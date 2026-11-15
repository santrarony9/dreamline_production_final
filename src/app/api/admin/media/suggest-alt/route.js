export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { generateSmartAltText } from "@/lib/alt-text-generator";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { url, contextTitle, category, role, index } = body;

        const suggestedAlt = generateSmartAltText({
            url: url || "",
            contextTitle: contextTitle || "",
            category: category || "general",
            role: role || "main",
            index: typeof index === 'number' ? index : 0
        });

        return NextResponse.json({
            success: true,
            suggestedAlt
        });
    } catch (err) {
        return safeErrorResponse(err, "Suggest Alt");
    }
}
