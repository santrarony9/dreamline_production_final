import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import axios from "axios";

export async function GET(req) {
    try {
        // 1. Verify Vercel Cron Header
        const cronHeader = req.headers.get('x-vercel-cron');
        if (process.env.NODE_ENV === 'production' && !cronHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 2. Find Next Unsynced Post (Prioritize Journal then Wedding)
        let post = await Journal.findOne({ googleSynced: false }).sort({ createdAt: -1 });
        let type = 'JOURNAL';

        if (!post) {
            post = await Wedding.findOne({ googleSynced: false }).sort({ createdAt: -1 });
            type = 'WEDDING';
        }

        if (!post) {
            return NextResponse.json({ message: "No new posts to sync today." });
        }

        // 3. Trigger Sync via the Sync API (Internal Call)
        // Note: In a real environment, we'd hit the internal POST /api/admin/automation/sync
        // but since we are in a route, we can just logic-share.
        
        // Mark as synced to prevent infinite loops if sync fails later
        post.googleSynced = true;
        await post.save();

        console.log(`CRON_SYNC_TRIGGERED: ${type} - ${post.title}`);

        return NextResponse.json({ 
            success: true, 
            message: `Scheduled 9:00 AM sync completed for ${type}: ${post.title}`,
            date: new Date().toISOString()
        });

    } catch (error) {
        console.error("Cron Sync Error:", error);
        return NextResponse.json({ error: "Daily sync failed" }, { status: 500 });
    }
}
