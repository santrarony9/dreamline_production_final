export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-2",
    endpoint: process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
});

export async function POST(request) {
    console.log("PRE-SIGNED URL REQUEST RECEIVED");

    // Validate AWS credentials are present
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error("Missing AWS credentials in environment variables");
        return NextResponse.json({ error: "Server configuration error: Missing AWS credentials" }, { status: 500 });
    }

    const session = await getServerSession();
    if (!session) {
        console.log("Unauthorized request to pre-signed URL");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log("Request body:", body);
        const { fileName, fileType } = body;

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "Missing file details" }, { status: 400 });
        }

        const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || "dreamlinepro";
        const region = process.env.AWS_REGION || "ap-south-2";
        const finalFileName = `${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

        console.log("Generating presigned URL for bucket:", bucketName, "region:", region, "file:", finalFileName);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: finalFileName,
            ContentType: fileType,
        });

        // Generate a pre-signed URL valid for 1 hour (3600 seconds)
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Determine the final public URL
        let publicUrl;
        if (process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT) {
            const baseEndpoint = (process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT).replace(/\/$/, "");
            if (process.env.NEXT_PUBLIC_S3_CUSTOM_DOMAIN) {
                publicUrl = `${process.env.NEXT_PUBLIC_S3_CUSTOM_DOMAIN}/${finalFileName}`;
            } else {
                publicUrl = `${baseEndpoint}/${bucketName}/${finalFileName}`;
            }
        } else {
            publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${finalFileName}`;
        }

        console.log("Presigned URL generated successfully. Public URL:", publicUrl);
        return NextResponse.json({ uploadUrl: presignedUrl, publicUrl });
    } catch (error) {
        console.error("Presigned URL error:", error);
        return NextResponse.json({ error: "Failed to generate upload URL: " + error.message }, { status: 500 });
    }
}
