export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { safeErrorResponse } from "@/lib/error-handler";

const ALLOWED_WEDDING_FIELDS = ["id", "title", "date", "location", "videoUrl", "youtubeId", "image", "seo"];

export async function GET() {
    await dbConnect();
    const weddings = await Wedding.find().sort({ date: -1 }).lean();
    return NextResponse.json(weddings);
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        
        const sanitizedData = {};
        for (const key of ALLOWED_WEDDING_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        // Ensure id is present as it's required by the model
        if (!sanitizedData.id) {
            sanitizedData.id = `wedding-${Date.now()}`;
        }

        const wedding = await Wedding.create(sanitizedData);

        try { 
            revalidatePath("/"); 
            revalidatePath("/luxury");
            revalidatePath("/admin/weddings");
        } catch(e) {}
        
        return NextResponse.json(wedding);
    } catch (err) {
        return safeErrorResponse(err, "Wedding POST");
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        
        const sanitizedData = {};
        for (const key of ALLOWED_WEDDING_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        const targetId = data._id || data.id;

        // Use _id (mongo id) for finding the document, 
        // but keep the custom string 'id' in the update if it exists
        const wedding = await Wedding.findByIdAndUpdate(targetId, sanitizedData, { new: true });

        if (!wedding) {
            return NextResponse.json({ error: "Wedding film not found" }, { status: 404 });
        }

        try { 
            revalidatePath("/"); 
            revalidatePath("/luxury");
            revalidatePath(`/wedding/${targetId}`);
            revalidatePath("/admin/weddings");
        } catch(e) {}

        return NextResponse.json(wedding);
    } catch (err) {
        return safeErrorResponse(err, "Wedding PUT");
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        await dbConnect();
        await Wedding.findByIdAndDelete(id);
        
        try { 
            revalidatePath("/"); 
            revalidatePath("/luxury");
            revalidatePath("/admin/weddings");
        } catch(e) {}
        
        return NextResponse.json({ success: true });
    } catch (err) {
        return safeErrorResponse(err, "Wedding DELETE");
    }
}
