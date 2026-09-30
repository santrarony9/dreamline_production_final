import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        secret: process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.substring(0, 5) + "..." : "missing",
        fullSecret: process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
    });
}
