export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for upload + Sharp processing

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-2",
    endpoint: process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
});

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
        const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "dreamlinepro";

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: finalFileName,
            Body: buffer,
            ContentType: contentType.startsWith("image/") && !contentType.includes("svg") ? "image/webp" : contentType,
        });

        await s3Client.send(command);

        // Determine URL format
        let url;
        if (process.env.NEXT_PUBLIC_CLOUDFRONT_URL) {
            const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL.replace(/\/$/, "");
            url = `${cloudFrontUrl}/${finalFileName}`;
        } else if (process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT) {
            const baseEndpoint = (process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT).replace(/\/$/, "");
            if (process.env.NEXT_PUBLIC_S3_CUSTOM_DOMAIN) {
                url = `${process.env.NEXT_PUBLIC_S3_CUSTOM_DOMAIN}/${finalFileName}`;
            } else {
                url = `${baseEndpoint}/${bucketName}/${finalFileName}`;
            }
        } else {
            url = `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-south-2"}.amazonaws.com/${finalFileName}`;
        }

        return NextResponse.json({ url });
    } catch (error) {
        return safeErrorResponse(error, "Upload");
    }
}
