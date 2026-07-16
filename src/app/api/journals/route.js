export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

const FALLBACK_IMAGE = "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG";
const PRODUCTION_URL = "https://dreamlineproduction.com";

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}


export async function GET() {
    await dbConnect();

    // Determine whether the caller is a Public User or an Authenticated Admin Admin
    const session = await getServerSession(authOptions);

    // We store dates as YYYY-MM-DD. A simple lexical string comparison works.
    const todayStr = new Date().toISOString().split('T')[0];

    let query = {};
    if (!session) {
        // Public users only see posts that are scheduled for today or in the past
        query = { date: { $lte: todayStr } };
    }

    const journals = await Journal.find(query).sort({ date: -1 }).lean();
    return NextResponse.json(journals);
}

const ALLOWED_JOURNAL_FIELDS = ["id", "title", "date", "category", "image", "content", "excerpt", "seo", "featured", "status"];

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        
        const sanitizedData = {};
        for (const key of ALLOWED_JOURNAL_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        let post;
        if (sanitizedData.id) {
            post = await Journal.findOneAndUpdate({ id: sanitizedData.id }, sanitizedData, { new: true, upsert: true });
        } else {
            post = await Journal.create(sanitizedData);
        }

        // Automation Trigger: Send to Google Business Profile via Webhook
        if (process.env.AUTOMATION_WEBHOOK_URL) {
            try {
                // Validate: Skip webhook if essential data is missing
                if (!post.title || post.title.trim() === '') {
                    console.warn("Webhook skipped: Post has no title, _id:", post._id);
                } else {
                    const imageUrl = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
                    const postObj = post.toObject ? post.toObject() : post;
                    const slug = postObj.id || postObj._id.toString();
                    const summaryText = stripHtml(post.excerpt || post.content).substring(0, 1500) || post.title;
                    const excerptText = post.excerpt || stripHtml(post.content).substring(0, 300) || post.title;

                    await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'JOURNAL_POST',
                            action: 'CREATE',
                            post: {
                                _id: post._id,
                                id: slug,
                                title: post.title,
                                date: post.date || new Date().toISOString().split('T')[0],
                                category: post.category || "Wedding",
                                image: imageUrl,
                                summary: summaryText,
                                publicUrl: `${PRODUCTION_URL}/journal/${slug}`,
                                excerpt: excerptText,
                                seo: post.seo || { title: "", description: "", keywords: "" }
                            }
                        })
                    });
                }
            } catch (e) {
                console.error("Automation Trigger Failed:", e.message);
            }
        }

        try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
        return NextResponse.json(post);
    } catch (error) {
        return safeErrorResponse(error, "Journal POST");
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        
        const sanitizedData = {};
        for (const key of ALLOWED_JOURNAL_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }
        
        const targetId = data._id || data.id;
        
        if (!targetId || !/^[0-9a-fA-F]{24}$/.test(targetId)) {
            return NextResponse.json({ error: "Invalid journal ID format" }, { status: 400 });
        }

        const post = await Journal.findByIdAndUpdate(targetId, sanitizedData, { new: true });
        
        if (!post) {
            return NextResponse.json({ error: "Journal post not found" }, { status: 404 });
        }

        // Automation Trigger: Update existing schedule
        if (process.env.AUTOMATION_WEBHOOK_URL) {
            try {
                // Validate: Skip webhook if essential data is missing
                if (!post.title || post.title.trim() === '') {
                    console.warn("Webhook skipped (PUT): Post has no title, _id:", post._id);
                } else {
                    const imageUrl = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
                    const postObj = post.toObject ? post.toObject() : post;
                    const slug = postObj.id || postObj._id.toString();
                    const summaryText = stripHtml(post.excerpt || post.content).substring(0, 1500) || post.title;
                    const excerptText = post.excerpt || stripHtml(post.content).substring(0, 300) || post.title;

                    await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'JOURNAL_POST',
                            action: 'UPDATE',
                            post: {
                                _id: post._id,
                                id: slug,
                                title: post.title,
                                date: post.date || new Date().toISOString().split('T')[0],
                                category: post.category || "Wedding",
                                image: imageUrl,
                                summary: summaryText,
                                publicUrl: `${PRODUCTION_URL}/journal/${slug}`,
                                excerpt: excerptText,
                                seo: post.seo || { title: "", description: "", keywords: "" }
                            }
                        })
                    });
                }
            } catch (e) {
                console.error("Automation Trigger Failed:", e.message);
            }
        }

        try { 
            revalidatePath("/"); 
            revalidatePath("/journal"); 
            revalidatePath(`/journal/${targetId}`);
        } catch(e) {}
        
        return NextResponse.json(post);
    } catch (err) {
        return safeErrorResponse(err, "Journal PUT");
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ error: "Invalid journal ID format" }, { status: 400 });
        }

        await dbConnect();
        await Journal.findByIdAndDelete(id);
        
        try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
        
        return NextResponse.json({ success: true });
    } catch (err) {
        return safeErrorResponse(err, "Journal DELETE");
    }
}
