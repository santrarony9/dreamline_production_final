import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";

const FALLBACK_IMAGE = "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG";

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET(request) {
    try {
        // Security: Check for a secret key to prevent unauthorized triggers
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const authHeader = request.headers.get("Authorization");
        const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        const isAuthorized = 
            (!process.env.AUTOMATION_SECRET && !process.env.CRON_SECRET) || 
            (secret && secret === process.env.AUTOMATION_SECRET) || 
            (bearerSecret && (bearerSecret === process.env.AUTOMATION_SECRET || bearerSecret === process.env.CRON_SECRET));
        
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Get today's date in YYYY-MM-DD format (IST context)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const todayStr = istDate.toISOString().split('T')[0];

        console.log(`[DailySync] Checking for post on: ${todayStr}`);

        // Find the post for today that is still pending sync
        const post = await Journal.findOne({ 
            date: todayStr,
            googleBusinessSync: { $ne: "SYNCED" }
        });

        if (!post) {
            return NextResponse.json({ 
                success: true, 
                message: `No pending post found for today (${todayStr}). Sync may have already happened or no post is scheduled.` 
            });
        }

        console.log(`[DailySync] Found post: ${post.title}. Triggering webhook...`);

        // Trigger Automation: Send to Google Business Profile via Webhook
        if (!process.env.AUTOMATION_WEBHOOK_URL) {
            throw new Error("AUTOMATION_WEBHOOK_URL not configured");
        }

        // Ensure we always have a valid image URL for Google Business Profile
        let imageUrl = (post.image && post.image.startsWith('http')) 
            ? post.image 
            : FALLBACK_IMAGE;

        // Auto-compress the image via our high-performance JPG proxy if it's hosted on S3 or Unsplash
        // This keeps the size under 2MB and guarantees a valid .jpg extension path for Google's API validation rules
        const isOptimizable = imageUrl.includes('dreamlinepro.s3') || imageUrl.includes('unsplash.com');
        if (isOptimizable) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';
            imageUrl = `${siteUrl}/api/images/cover.jpg?url=${encodeURIComponent(imageUrl)}`;
        }

        const postSummary = stripHtml(post.excerpt || post.content).substring(0, 1500);
        const publicUrl = `https://dreamlineproduction.com/journal/${post._id || post.id}`;

        const payload = {
            type: 'JOURNAL_POST',
            action: 'AUTOMATED_SYNC',
            post: {
                _id: post._id,
                title: post.title,
                date: post.date,
                category: post.category || "Wedding",
                image: imageUrl,
                summary: postSummary,
                publicUrl: publicUrl,
                excerpt: post.excerpt || postSummary.substring(0, 300)
            }
        };

        console.log(`[DailySync] Payload image: ${imageUrl}`);
        console.log(`[DailySync] Payload publicUrl: ${publicUrl}`);

        const response = await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Mark as FAILED so we can retry
            post.googleBusinessSync = "FAILED";
            post.lastSyncedAt = new Date();
            await post.save();
            throw new Error(`Webhook failed: ${response.status} ${errorText}`);
        }

        // Update database status
        post.googleBusinessSync = "SYNCED";
        post.lastSyncedAt = new Date();
        await post.save();

        console.log(`[DailySync] Successfully synced: ${post.title}`);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully synced today's post: ${post.title}`,
            postId: post._id,
            image: imageUrl
        });

    } catch (error) {
        console.error("[DailySync] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
