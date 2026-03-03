export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";

export async function GET() {
    await dbConnect();
    const content = await Content.findOne().lean();
    return NextResponse.json(content || {});
}

export async function POST(request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Use findOneAndReplace or findOneAndUpdate to keep it as a single config document
    const content = await Content.findOneAndUpdate(
        {},
        { $set: data },
        { upsert: true, new: true }
    );

    return NextResponse.json(content);
}
