export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { getServerSession } from "next-auth";

export async function GET() {
    await dbConnect();

    // Determine whether the caller is a Public User or an Authenticated Admin Admin
    const session = await getServerSession();

    // We store dates as YYYY-MM-DD. A simple lexical string comparison works.
    const todayStr = new Date().toISOString().split('T')[0];

    let query = {};
    if (!session) {
        // Public users only see posts that are scheduled for today or in the past
        query = { date: { $lte: todayStr } };
    }

    const journals = await Journal.find(query).sort({ date: -1 }).lean();
    return NextResponse.json(journals);
}

export async function POST(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const post = await Journal.create(data);
    try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
    return NextResponse.json(post);
}

export async function PUT(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;
    const post = await Journal.findByIdAndUpdate(id, updateData, { new: true });
    try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
    return NextResponse.json(post);
}

export async function DELETE(request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    await dbConnect();
    await Journal.findByIdAndDelete(id);
    try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
    return NextResponse.json({ success: true });
}
