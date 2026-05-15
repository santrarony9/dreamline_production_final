export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await request.json();
    const post = await Journal.create(data);

    // Automation Trigger: Send to Google Business Profile via Webhook
    if (process.env.AUTOMATION_WEBHOOK_URL) {
        try {
            await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'JOURNAL_POST',
                    action: 'CREATE',
                    post: {
                        ...post.toObject(),
                        summary: stripHtml(post.excerpt || post.content).substring(0, 1500),
                        publicUrl: `${process.env.NEXTAUTH_URL}/journal/${post._id || post.id}`
                    }
                })
            });
        } catch (e) {
            console.error("Automation Trigger Failed:", e.message);
        }
    }

    try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
    return NextResponse.json(post);
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        const { _id, id, ...updateData } = data;

        const post = await Journal.findByIdAndUpdate(_id || id, updateData, { new: true });
        
        if (!post) {
            return NextResponse.json({ error: "Journal post not found" }, { status: 404 });
        }

        // Automation Trigger: Update existing schedule
        if (process.env.AUTOMATION_WEBHOOK_URL) {
            try {
                await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'JOURNAL_POST',
                        action: 'UPDATE',
                        post: {
                            ...post.toObject(),
                            summary: stripHtml(post.excerpt || post.content).substring(0, 1500),
                            publicUrl: `${process.env.NEXTAUTH_URL}/journal/${post._id || post.id}`
                        }
                    })
                });
            } catch (e) {
                console.error("Automation Trigger Failed:", e.message);
            }
        }

        try { 
            revalidatePath("/"); 
            revalidatePath("/journal"); 
            revalidatePath(`/journal/${id || _id}`);
        } catch(e) {}
        
        return NextResponse.json(post);
    } catch (err) {
        console.error("Journal PUT Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    await dbConnect();
    await Journal.findByIdAndDelete(id);
    try { revalidatePath("/"); revalidatePath("/journal"); } catch(e) {}
    return NextResponse.json({ success: true });
}
