export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { checkSlugAvailability } from "@/lib/blog-redirects";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const excludeId = searchParams.get("excludeId");

        if (!slug) {
            return NextResponse.json({
                available: false,
                reason: "Slug parameter is required."
            }, { status: 400 });
        }

        const result = await checkSlugAvailability({ slug, excludeId });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Check slug API error:", error);
        return NextResponse.json({
            available: false,
            reason: error.message || "Failed to validate slug availability."
        }, { status: 500 });
    }
}
