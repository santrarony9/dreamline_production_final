import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";

export async function GET() {
    await dbConnect();
    const content = await Content.findOne().lean();
    
    return NextResponse.json({
        homeQuote: content?.home?.quote || "NOT FOUND IN HOME",
        rootQuote: content?.quote || "NOT FOUND IN ROOT",
        allKeys: Object.keys(content || {}),
        homeKeys: Object.keys(content?.home || {})
    });
}
