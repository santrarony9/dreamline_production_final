export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

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

// This endpoint authenticates the user on Vercel, then returns the direct VPS upload URL.
// The browser then uploads the file DIRECTLY to the VPS, bypassing Vercel's 4.5MB body limit.
export async function POST(request) {
    console.log("UPLOAD URL REQUEST RECEIVED — returning direct VPS upload URL");

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

        // Return the DIRECT VPS backend upload URL so the browser bypasses Vercel entirely.
        // This avoids Vercel's 4.5MB request body limit and proxy timeout issues.
        const backendUrl = process.env.BACKEND_URL || "https://backend.dreamlineproduction.com";
        return NextResponse.json({
            uploadUrl: `${backendUrl}/api/upload`,
            method: "POST_FORMDATA"
        });
    } catch (error) {
        return safeErrorResponse(error, "Upload URL");
    }
}
