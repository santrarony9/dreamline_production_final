export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { encode } from "next-auth/jwt";

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

export async function POST(request) {
    console.log("UPLOAD URL REQUEST RECEIVED — returning direct VPS upload URL with token");

    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8" });
    if (!token) {
        return NextResponse.json({ error: "Session expired. Please refresh the page and log in again." }, { status: 401 });
    }
    const session = { user: token };

    try {
        const body = await request.json();
        const { fileName, fileType } = body;

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "Missing file details" }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(fileType)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
        }

        // Generate a temporary upload token using next-auth/jwt
        const secret = process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8";
        const uploadToken = await encode({
            token: { 
                uploadAuth: true, 
                user: session.user?.email,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
            },
            secret: secret,
        });

        return NextResponse.json({
            uploadUrl: "/api/upload",
            method: "POST_FORMDATA",
            token: uploadToken
        });
    } catch (error) {
        return safeErrorResponse(error, "Upload URL");
    }
}
