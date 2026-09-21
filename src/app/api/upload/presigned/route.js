export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

// Pre-signed URLs are no longer needed since AWS S3 is bypassed.
// This endpoint now returns the direct upload URL for the FormData-based upload flow.
export async function POST(request) {
    console.log("UPLOAD URL REQUEST RECEIVED (S3 bypassed — using VPS local storage)");

    const session = await getServerSession(authOptions);
    if (!session) {
        console.log("Unauthorized request — session is null");
        return NextResponse.json({ error: "Session expired. Please refresh the page and log in again." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { fileName, fileType } = body;

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "Missing file details" }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(fileType)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
        }

        // Return the direct upload endpoint — the ImageUploader will POST FormData here
        return NextResponse.json({
            uploadUrl: "/api/upload",
            publicUrl: "pending", // Will be returned by the actual upload endpoint
            method: "POST_FORMDATA" // Signal to the client to use FormData instead of PUT
        });
    } catch (error) {
        return safeErrorResponse(error, "Upload URL");
    }
}
