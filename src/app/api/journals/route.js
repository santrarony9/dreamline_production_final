export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { getServerSession } from "next-auth";

export async function GET() {
    await dbConnect();
    const journals = await Journal.find().sort({ date: -1 }).lean();
    return NextResponse.json(journals);
}

export async function POST(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const post = await Journal.create(data);
    return NextResponse.json(post);
}

export async function PUT(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;
    const post = await Journal.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(post);
}

export async function DELETE(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    await dbConnect();
    await Journal.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
