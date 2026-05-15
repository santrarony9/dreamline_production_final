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

        // Revalidate paths for on-demand ISR
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/luxury');
        revalidatePath('/commercial');
        revalidatePath('/tech');
        
        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        console.error("API Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

