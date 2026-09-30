export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken, encode } from "next-auth/jwt";
import { safeErrorResponse } from "@/lib/error-handler";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "video/mp4",
    "video/webm",
    "application/pdf",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    let isAuthenticated = false;

    // Check for Authorization header first (cross-origin upload token or Vercel proxy)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const tokenString = authHeader.substring(7);
        
        // 1. Check for server-to-server proxy token (Vercel → VPS forwarding)
        if (tokenString === "PROXY_DREAMLINE_2026_xyz123_SUPER_SECRET") {
            isAuthenticated = true;
        } 
        // 2. Check for client-side JWT upload token
        else {
            try {
                const { decode } = await import("next-auth/jwt");
                const secret = process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8";
                const decoded = await decode({ token: tokenString, secret });
                if (decoded && decoded.uploadAuth && decoded.exp > Math.floor(Date.now() / 1000)) {
                    isAuthenticated = true;
                }
            } catch (e) {
                console.error("JWT verification error:", e);
            }
        }
    }

    if (!isAuthenticated) {
        // Fallback for same-origin uploads (session cookie)
        const session = await getServerSession(authOptions);
        if (session) {
            isAuthenticated = true;
        } else {
            try {
                const token = await getToken({ 
                    req: request, 
                    secret: process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8",
                    secureCookie: true
                });
                if (token) isAuthenticated = true;
            } catch (e) {}
        }
    }

    if (!isAuthenticated) {
        return NextResponse.json(
            { error: "Session expired. Please refresh the page and log in again." },
            { status: 401, headers: corsHeaders }
        );
    }

    // ─── VERCEL MODE: Proxy entire request to VPS backend ───
    // On Vercel, the filesystem is ephemeral and chunks across serverless 
    // invocations can land on different instances. Instead of trying to handle
    // uploads locally, we forward every chunk (and single-file uploads) to the
    // VPS backend server-to-server. This avoids all CORS/redirect/rewrite issues.
    if (process.env.VERCEL === '1') {
        try {
            const backendUrl = process.env.BACKEND_URL || "https://backend.dreamlineproduction.com";
            const secret = process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8";

            // Read the raw request body and forward it with the same Content-Type
            const bodyBuffer = await request.arrayBuffer();
            const contentType = request.headers.get("content-type") || "";

            const vpsRes = await fetch(`${backendUrl}/api/upload`, {
                method: "POST",
                headers: {
                    "Content-Type": contentType,
                    "Authorization": "Bearer PROXY_DREAMLINE_2026_xyz123_SUPER_SECRET",
                },
                body: bodyBuffer,
            });

            const vpsData = await vpsRes.json();

            if (!vpsRes.ok) {
                console.error("[Upload Proxy] VPS returned error:", vpsRes.status, vpsData);
                return NextResponse.json(
                    { error: vpsData.error || "Upload failed on storage server" },
                    { status: vpsRes.status, headers: corsHeaders }
                );
            }

            return NextResponse.json(vpsData, { headers: corsHeaders });
        } catch (err) {
            console.error("[Upload Proxy] Error forwarding to VPS:", err);
            return NextResponse.json(
                { error: "Failed to reach storage server. Please try again." },
                { status: 502, headers: corsHeaders }
            );
        }
    }

    // ─── VPS MODE: Handle uploads locally ───
    try {
        const sharp = (await import("sharp")).default;
        const formData = await request.formData();
        const file = formData.get("file");
        const chunk = formData.get("chunk");

        if (!file && !chunk) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400, headers: corsHeaders });
        }

        // ── Chunked upload flow ──
        if (chunk) {
            const fileId = formData.get("fileId");
            const chunkIndex = parseInt(formData.get("chunkIndex"));
            const totalChunks = parseInt(formData.get("totalChunks"));
            let fileName = formData.get("fileName");
            const contentType = formData.get("fileType");

            const fsPromises = await import('fs/promises');
            const path = await import('path');
            const fs = await import('fs');

            if (!fileName) fileName = "unknown-file";
            const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
            const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp', fileId);
            await fsPromises.mkdir(tempDir, { recursive: true });

            const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
            const chunkPath = path.join(tempDir, `${chunkIndex}`);
            await fsPromises.writeFile(chunkPath, chunkBuffer);

            const uploadedChunks = await fsPromises.readdir(tempDir);
            if (uploadedChunks.length === totalChunks) {
                // All chunks received — assemble the file
                const finalExt = safeFileName.includes('.') ? safeFileName.substring(safeFileName.lastIndexOf('.')) : '';
                const baseFileName = safeFileName.substring(0, safeFileName.lastIndexOf('.')) || safeFileName;

                // Assemble chunks into a single buffer
                const chunks = [];
                for (let i = 0; i < totalChunks; i++) {
                    const cp = path.join(tempDir, `${i}`);
                    chunks.push(await fsPromises.readFile(cp));
                }
                let assembledBuffer = Buffer.concat(chunks);

                // Cleanup temp dir
                await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

                // Process images with sharp
                let finalFileName;
                if (contentType && contentType.startsWith("image/") && !contentType.includes("svg")) {
                    try {
                        assembledBuffer = await sharp(assembledBuffer)
                            .resize({ width: 2000, withoutEnlargement: true })
                            .webp({ quality: 80 })
                            .toBuffer();
                        finalFileName = `${Date.now()}-${baseFileName.substring(0, 20)}.webp`;
                    } catch (sharpErr) {
                        console.error("Sharp processing failed, saving original:", sharpErr);
                        finalFileName = `${Date.now()}-${baseFileName.substring(0, 20)}${finalExt}`;
                    }
                } else {
                    finalFileName = `${Date.now()}-${baseFileName.substring(0, 20)}${finalExt}`;
                }

                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                await fsPromises.mkdir(uploadDir, { recursive: true });
                await fsPromises.writeFile(path.join(uploadDir, finalFileName), assembledBuffer);

                const publicUrl = `https://backend.dreamlineproduction.com/uploads/${finalFileName}`;
                return NextResponse.json({ success: true, url: publicUrl }, { headers: corsHeaders });
            } else {
                return NextResponse.json({ success: true, message: `Chunk ${chunkIndex} received` }, { headers: corsHeaders });
            }
        }

        // ── Single-file upload flow ──
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400, headers: corsHeaders });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400, headers: corsHeaders });
        }

        let buffer = Buffer.from(await file.arrayBuffer());
        let originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

        if (file.type.startsWith("image/") && !file.type.includes("svg")) {
            try {
                buffer = await sharp(buffer)
                    .resize({ width: 2000, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();
                originalName = originalName.replace(/\.[^.]+$/, ".webp");
            } catch (sharpErr) {
                console.error("Sharp processing failed, saving original:", sharpErr);
            }
        }

        const fsPromises = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fsPromises.mkdir(uploadDir, { recursive: true });

        const finalFileName = `${Date.now()}-${originalName}`;
        await fsPromises.writeFile(path.join(uploadDir, finalFileName), buffer);

        const publicUrl = `https://backend.dreamlineproduction.com/uploads/${finalFileName}`;
        return NextResponse.json({ success: true, url: publicUrl }, { headers: corsHeaders });
    } catch (error) {
        console.error("[Upload VPS] Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500, headers: corsHeaders });
    }
}
