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
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        
        // Ensure id is present as it's required by the model
        if (!data.id) {
            data.id = `wedding-${Date.now()}`;
        }

        const wedding = await Wedding.create(data);

        try { 
            revalidatePath("/"); 
            revalidatePath("/luxury");
            revalidatePath("/admin/weddings");
        } catch(e) {}
        
        return NextResponse.json(wedding);
    } catch (err) {
        console.error("POST Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        const { _id, id, ...updateData } = data;

        // Use _id (mongo id) for finding the document, 
        // but keep the custom string 'id' in the update if it exists
        const wedding = await Wedding.findByIdAndUpdate(_id || id, updateData, { new: true });

        if (!wedding) {
            return NextResponse.json({ error: "Wedding film not found" }, { status: 404 });
        }

        try { 
            revalidatePath("/"); 
            revalidatePath("/luxury");
            revalidatePath(`/wedding/${id || _id}`);
            revalidatePath("/admin/weddings");
        } catch(e) {}

        return NextResponse.json(wedding);
    } catch (err) {
        console.error("PUT Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
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
        console.error("DELETE Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
