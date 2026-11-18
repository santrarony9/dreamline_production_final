import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { safeErrorResponse } from "@/lib/error-handler";

export const dynamic = 'force-dynamic';

const ALLOWED_SERVICE_PAGE_FIELDS = [
    "title", 
    "subtitle", 
    "description", 
    "shortDescription",
    "category", 
    "heroImage", 
    "heroImageAlt", 
    "heroVideo", 
    "gallery", 
    "videos", 
    "videoSectionTitle",
    "videoSectionSubtitle",
    "sections", 
    "testimonials", 
    "seoTitle", 
    "metaDescription", 
    "metaKeywords", 
    "ctaText", 
    "ctaLink", 
    "featuredBadge", 
    "order", 
    "active", 
    "isPublished"
];

export async function GET() {
    await dbConnect();
    const pages = await ServicePage.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(pages);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { slug, oldSlug, ...updateData } = body;

    if (!slug || typeof slug !== "string") {
        return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }
    
    const sanitizedData = { slug: slug.trim() };
    for (const key of ALLOWED_SERVICE_PAGE_FIELDS) {
        if (updateData[key] !== undefined) sanitizedData[key] = updateData[key];
    }

    try {
        let page;
        if (oldSlug && oldSlug !== slug) {
            // Renaming slug - update existing document
            page = await ServicePage.findOneAndUpdate(
                { slug: oldSlug },
                { $set: sanitizedData },
                { upsert: true, new: true }
            );
            revalidatePath(`/services/${oldSlug}/`);
        } else {
            page = await ServicePage.findOneAndUpdate(
                { slug: sanitizedData.slug },
                { $set: sanitizedData },
                { upsert: true, new: true }
            );
        }

        // Revalidate the service pages with trailing slash
        revalidatePath(`/services/${sanitizedData.slug}/`);
        revalidatePath('/services/');
        revalidatePath('/', 'layout');
        
        return NextResponse.json(page);
    } catch (err) {
        return safeErrorResponse(err, "ServicePage");
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const id = searchParams.get("id");

        if (!slug && !id) {
            return NextResponse.json({ error: "Slug or ID is required" }, { status: 400 });
        }

        const query = id ? { _id: id } : { slug };
        const deleted = await ServicePage.findOneAndDelete(query);

        if (deleted && deleted.slug) {
            revalidatePath(`/services/${deleted.slug}/`);
        }
        revalidatePath('/services/');

        return NextResponse.json({ success: true, message: "Service page deleted successfully", deleted });
    } catch (err) {
        return safeErrorResponse(err, "ServicePage");
    }
}
