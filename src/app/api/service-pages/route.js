import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { revalidatePath } from "next/cache";
import { safeErrorResponse } from "@/lib/error-handler";

const ALLOWED_SERVICE_PAGE_FIELDS = ["title", "subtitle", "description", "heroImage", "gallery", "videos", "active"];

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

    if (!slug || typeof slug !== "string") {
        return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }
    
    const sanitizedData = {};
    for (const key of ALLOWED_SERVICE_PAGE_FIELDS) {
        if (updateData[key] !== undefined) sanitizedData[key] = updateData[key];
    }

    try {
        const page = await ServicePage.findOneAndUpdate(
            { slug },
            { $set: sanitizedData },
            { upsert: true, new: true }
        );

        // Revalidate the dynamic page
        revalidatePath(`/services/${slug}`);
        
        return NextResponse.json(page);
    } catch (err) {
        return safeErrorResponse(err, "ServicePage");
    }
}
