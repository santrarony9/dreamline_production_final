export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import { getServerSession } from "next-auth";

export async function GET() {
    await dbConnect();
    const weddings = await Wedding.find().sort({ date: -1 }).lean();
    return NextResponse.json(weddings);
}

export async function POST(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const wedding = await Wedding.create(data);
    return NextResponse.json(wedding);
}

export async function PUT(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;
    const wedding = await Wedding.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(wedding);
}

export async function DELETE(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    await dbConnect();
    await Wedding.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
