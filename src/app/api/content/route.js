export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contentLimiter } from "@/lib/rate-limit";
import { safeErrorResponse } from "@/lib/error-handler";

export async function GET(request) {
    const { success } = contentLimiter.check(request);
    if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get("fields")?.split(',').join(' ');
    
    const query = Content.findOne();
    if (fields) query.select(fields);
    
    const content = await query.lean();

    if (content) {
        // Strip sensitive fields from public response
        if (content.global?.google) {
            delete content.global.google.clientSecret;
            delete content.global.google.clientId;
            delete content.global.google.mapsApiKey;
            delete content.global.google.refreshToken;
        }
    }

    return NextResponse.json(content || {});
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Structure the update data using dot notation for nested fields
    // to prevent overwriting entire parent objects.
    const updateData = {};

    // Top-level fields
    const topLevelFields = [
        'about', 'luxury', 'commercial', 'contact', 'social', 'footer', 
        'splitGallery', 'videoVault', 'global', 'projects'
    ];
    topLevelFields.forEach(field => {
        if (body[field] !== undefined) updateData[field] = body[field];
    });

    // Home-nested fields
    const homeFields = [
        'hero', 'services', 'partners', 'marquee', 'stats', 
        'expertise', 'motionArchive', 'reviews', 'quote'
    ];
    
    // If 'home' itself is provided as an object, we can merge its properties
    if (body.home && typeof body.home === 'object') {
        Object.keys(body.home).forEach(key => {
            updateData[`home.${key}`] = body.home[key];
        });
    }

    // Explicitly handle fields that might be sent at top-level by legacy admin forms
    homeFields.forEach(field => {
        if (body[field] !== undefined) {
            updateData[`home.${field}`] = body[field];
        }
    });

    let content;
    try {
        content = await Content.findOneAndUpdate(
            {},
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );

        // Automatically create corresponding ServicePage documents for subcategories
        const services = updateData['home.services'] || (body.home && body.home.services) || body.services;
        if (services && Array.isArray(services)) {
            const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            for (const srv of services) {
                if (srv.subcategories && Array.isArray(srv.subcategories)) {
                    for (const sub of srv.subcategories) {
                        if (!sub.trim()) continue;
                        const slug = slugify(sub);
                        await ServicePage.findOneAndUpdate(
                            { slug },
                            { $setOnInsert: { slug, title: sub, subtitle: "Premium Service", active: true } },
                            { upsert: true }
                        );
                    }
                }
            }
        }

        // Revalidate paths for on-demand ISR
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/luxury');
        revalidatePath('/commercial');
        revalidatePath('/tech');
        
        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        return safeErrorResponse(error, "Content Update");
    }
}

