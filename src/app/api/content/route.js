export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
    await dbConnect();
    const content = await Content.findOne().lean();
    return NextResponse.json(content || {});
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Explicitly pick allowed fields to prevent mass assignment
    const { hero, home, about, luxury, commercial, contact, social, footer, splitGallery, videoVault, global } = body;
    const updateData = { hero, home, about, luxury, commercial, contact, social, footer, splitGallery, videoVault, global };

    // Remove undefined fields to avoid overwriting with null
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const content = await Content.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, new: true }
    );


    // Clear ISR cache so changes appear immediately on the frontend
    try {
        revalidatePath("/");
        revalidatePath("/about");
        revalidatePath("/luxury");
        revalidatePath("/commercial");
        console.log("Revalidated all public pages after content update");
    } catch (e) {
        console.error("Revalidation warning:", e.message);
    }

    return NextResponse.json(content);
}

