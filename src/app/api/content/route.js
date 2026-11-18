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
    
    if (fields && /clientSecret|clientId|mapsApiKey|refreshToken/i.test(fields)) {
        return NextResponse.json({ error: "Invalid field selection" }, { status: 400 });
    }

    const query = Content.findOne();
    if (fields) query.select(fields);
    
    const content = await query.lean();

    if (content) {
        // Deep strip sensitive fields from public response
        const stripSensitive = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            delete obj.clientSecret;
            delete obj.clientId;
            delete obj.mapsApiKey;
            delete obj.refreshToken;
            Object.values(obj).forEach(stripSensitive);
        };
        stripSensitive(content);
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
        'splitGallery', 'videoVault', 'projects', 'banners'
    ];
    topLevelFields.forEach(field => {
        if (body[field] !== undefined) updateData[field] = body[field];
    });

    // If 'global' is provided as an object, merge its sub-properties using dot notation
    if (body.global && typeof body.global === 'object') {
        Object.keys(body.global).forEach(key => {
            if (body.global[key] && typeof body.global[key] === 'object' && !Array.isArray(body.global[key])) {
                Object.keys(body.global[key]).forEach(subKey => {
                    updateData[`global.${key}.${subKey}`] = body.global[key][subKey];
                });
            } else {
                updateData[`global.${key}`] = body.global[key];
            }
        });
    }

    // Home-nested fields
    const homeFields = [
        'hero', 'services', 'partners', 'marquee', 'stats', 
        'expertise', 'motionArchive', 'reviews', 'quote', 'sections'
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
            { upsert: true, returnDocument: 'after', runValidators: true }
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

        // Revalidate layout and all paths for immediate on-demand ISR synchronization
        try {
            revalidatePath('/', 'layout');
            revalidatePath('/');
            revalidatePath('/about');
            revalidatePath('/luxury');
            revalidatePath('/commercial');
            revalidatePath('/tech');
            revalidatePath('/services');
            revalidatePath('/portfolio');
            revalidatePath('/contact');
        } catch (revErr) {
            console.warn('[Content Update] Revalidation notice:', revErr.message);
        }
        
        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        return safeErrorResponse(error, "Content Update");
    }
}

