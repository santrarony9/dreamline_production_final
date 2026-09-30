export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

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

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins for upload POST (or use specific domains)
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
        return NextResponse.json({ error: "Session expired. Please refresh the page and log in again." }, { status: 401, headers: corsHeaders });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const chunk = formData.get("chunk");

        if (!file && !chunk) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400, headers: corsHeaders });
        }

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
                const finalExt = safeFileName.includes('.') ? safeFileName.substring(safeFileName.lastIndexOf('.')) : '';
                const baseFileName = safeFileName.substring(0, safeFileName.lastIndexOf('.')) || safeFileName;
                const finalName = `${Date.now()}-${baseFileName.substring(0, 20)}${finalExt}`;
                const finalPath = path.join(process.cwd(), 'public', 'uploads', finalName);

                const writeStream = fs.createWriteStream(finalPath);
                for (let i = 0; i < totalChunks; i++) {
                    const cp = path.join(tempDir, `${i}`);
                    const data = await fsPromises.readFile(cp);
                    writeStream.write(data);
                }
                writeStream.end();

                await new Promise((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                await fsPromises.rm(tempDir, { recursive: true, force: true }).catch(console.error);

                const backendUrl = process.env.BACKEND_URL || "https://backend.dreamlineproduction.com";
                const publicUrl = `${backendUrl}/uploads/${finalName}`;
                return NextResponse.json({ success: true, url: publicUrl }, { headers: corsHeaders });
            } else {
                return NextResponse.json({ success: true, message: `Chunk ${chunkIndex} received` }, { headers: corsHeaders });
            }
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400, headers: corsHeaders });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400, headers: corsHeaders });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const isImage = file.type.startsWith("image/");
        let processedBuffer = buffer;

        if (isImage) {
            processedBuffer = await sharp(buffer)
                .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 80, progressive: true })
                .toBuffer();
        }

        const fsPromises = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fsPromises.mkdir(uploadDir, { recursive: true });

        const fileName = `${Date.now()}-${originalName}`;
        const filePath = path.join(uploadDir, fileName);
        await fsPromises.writeFile(filePath, processedBuffer);

        const backendUrl = process.env.BACKEND_URL || "https://backend.dreamlineproduction.com";
        const publicUrl = `${backendUrl}/uploads/${fileName}`;
        
        return NextResponse.json({ success: true, url: publicUrl }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500, headers: corsHeaders });
    }
}
