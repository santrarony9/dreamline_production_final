export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

import sharp from "sharp";

export async function POST(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);
        let fileName = file.name.replace(/\s+/g, "-");
        let contentType = file.type;

        // Optimization: Convert images to WebP (excluding SVGs)
        if (contentType.startsWith("image/") && !contentType.includes("svg")) {
            console.log("Optimizing image:", fileName);
            buffer = await sharp(buffer)
                .resize({ width: 2000, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            contentType = "image/webp";
            fileName = fileName.replace(/\.[^.]+$/, ".webp");
        }

        const finalFileName = `${Date.now()}-${fileName}`;
        const bucketName = process.env.AWS_S3_BUCKET_NAME || "dreamline-production";

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: finalFileName,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalFileName}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}

