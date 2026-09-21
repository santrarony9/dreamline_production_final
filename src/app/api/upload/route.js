export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for upload + Sharp processing

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    // Pass authOptions so session validation works on Vercel production
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Session expired. Please refresh the page and log in again." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const contentType = file.type || "";
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
            buffer = await sharp(buffer)
                .resize({ width: 2000, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            fileName = fileName.replace(/\.[^.]+$/, ".webp");
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

        // Return relative URL — next.config.mjs rewrites /uploads/* to backend.dreamlineproduction.com/uploads/*
        const publicUrl = `https://backend.dreamlineproduction.com/uploads/${finalFileName}`;
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        return safeErrorResponse(error, "Upload");
    }
}
