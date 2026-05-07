export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
    await dbConnect();
    const weddings = await Wedding.find().sort({ date: -1 }).lean();
    return NextResponse.json(weddings);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { title, client, date, category, tags, description, videoUrl, coverImg, gallery, splitGallery, stats } = await request.json();
    const wedding = await Wedding.create({ title, client, date, category, tags, description, videoUrl, coverImg, gallery, splitGallery, stats });

    try { revalidatePath("/"); } catch(e) {}
    return NextResponse.json(wedding);
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id, title, client, date, category, tags, description, videoUrl, coverImg, gallery, splitGallery, stats } = await request.json();
    const wedding = await Wedding.findByIdAndUpdate(id, { title, client, date, category, tags, description, videoUrl, coverImg, gallery, splitGallery, stats }, { new: true });

    try { revalidatePath("/"); } catch(e) {}
    return NextResponse.json(wedding);
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    await dbConnect();
    await Wedding.findByIdAndDelete(id);
    try { revalidatePath("/"); } catch(e) {}
    return NextResponse.json({ success: true });
}
