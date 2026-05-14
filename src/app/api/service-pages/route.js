import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
    await dbConnect();
    const pages = await ServicePage.find().lean();
    return NextResponse.json(pages);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { slug, ...updateData } = body;

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const page = await ServicePage.findOneAndUpdate(
            { slug },
            { $set: updateData },
            { upsert: true, new: true }
        );

        // Revalidate the dynamic page
        revalidatePath(`/services/${slug}`);
        
        return NextResponse.json(page);
    } catch (err) {
        console.error("Service Page API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
