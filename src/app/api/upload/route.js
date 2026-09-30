export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for upload + Sharp processing

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import sharp from "sharp";
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request) {
    let isAuthenticated = false;

    // Check for Authorization header first (cross-origin upload token)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const tokenString = authHeader.substring(7);
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

    if (!isAuthenticated) {
        // Fallback for same-origin uploads
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
        return NextResponse.json({ error: "Session expired. Please refresh the page and log in again." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const chunk = formData.get("chunk");

        if (!file && !chunk) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Support for chunked uploads to bypass Vercel's 4.5MB limit
        if (chunk) {
            const fileId = formData.get("fileId");
            const chunkIndex = parseInt(formData.get("chunkIndex"));
            const totalChunks = parseInt(formData.get("totalChunks"));
            let fileName = formData.get("fileName");
            const contentType = formData.get("fileType");

            const fsPromises = await import('fs/promises');
            const path = await import('path');
            const os = await import('os');

            const tempDir = path.join(os.tmpdir(), 'dreamline-uploads');
            await fsPromises.mkdir(tempDir, { recursive: true }).catch(() => {});
            
            const tempFilePath = path.join(tempDir, `${fileId}.tmp`);
            const buffer = Buffer.from(await chunk.arrayBuffer());
            
            // Append chunk
            if (chunkIndex === 0) {
                await fsPromises.writeFile(tempFilePath, buffer);
            } else {
                await fsPromises.appendFile(tempFilePath, buffer);
            }

            if (chunkIndex === totalChunks - 1) {
                fileName = fileName.replace(/[^\x20-\x7E]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'upload';

                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                await fsPromises.mkdir(uploadDir, { recursive: true }).catch(() => {});
                
                let finalFileName = `${Date.now()}-${fileName}`;
                const finalPath = path.join(uploadDir, finalFileName);
                
                if (contentType.startsWith("image/") && !contentType.includes("svg")) {
                    const fileBuffer = await fsPromises.readFile(tempFilePath);
                    const optimizedBuffer = await sharp(fileBuffer)
                        .resize({ width: 2000, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();
                    finalFileName = finalFileName.replace(/\.[^.]+$/, ".webp");
                    const optimizedPath = path.join(uploadDir, finalFileName);
                    await fsPromises.writeFile(optimizedPath, optimizedBuffer);
                    await fsPromises.unlink(tempFilePath).catch(() => {});
                } else {
                    await fsPromises.rename(tempFilePath, finalPath);
                }

                const publicUrl = `https://dreamlineproduction.com/uploads/${finalFileName}`;
                return NextResponse.json({ url: publicUrl });
            } else {
                return NextResponse.json({ message: "Chunk received" });
            }
        }

        const contentType = file?.type || "";
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return NextResponse.json(
                { error: "File type not allowed" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum 50MB." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);

        // Sanitize filename: remove non-ASCII, special chars
        let fileName = file.name
            .replace(/[^\x20-\x7E]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'upload';

        // Optimization: Convert images to WebP (excluding SVGs)
        if (contentType.startsWith("image/") && !contentType.includes("svg")) {
            console.log("Optimizing image:", fileName);
            try {
                buffer = await sharp(buffer)
                    .resize({ width: 2000, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                fileName = fileName.replace(/\.[^.]+$/, ".webp");
            } catch (err) {
                console.error("Image optimization failed, skipping:", err);
            }
        }

        const finalFileName = `${Date.now()}-${fileName}`;

        // --- VPS Local Storage (AWS S3 bypassed — bucket blocked) ---
        const fs = await import('fs/promises');
        const path = await import('path');

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, finalFileName);
        await fs.writeFile(filePath, buffer);

        // Return absolute URL via Vercel frontend so Next.js Image Optimization can fetch it externally.
        // Vercel rewrites /uploads/* to http://backend.dreamlineproduction.com/uploads/*
        const publicUrl = `https://dreamlineproduction.com/uploads/${finalFileName}`;
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        return safeErrorResponse(error, "Upload");
    }
}
