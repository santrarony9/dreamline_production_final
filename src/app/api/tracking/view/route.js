import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";

export async function POST(request) {
    try {
        await dbConnect();
        const { path, referrer } = await request.json();

        if (!path || typeof path !== 'string') return NextResponse.json({ error: "Missing path" }, { status: 400 });

        // Sanitize: limit length, allow only URL-safe characters
        const cleanPath = path.slice(0, 200).replace(/[^a-zA-Z0-9\-_\/\.\?=&%]/g, '');

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Detect organic google traffic
        const isGoogle = referrer && (referrer.includes('google.com') || referrer.includes('google.co.in'));

        // Increment views for the path on this day
        await Analytics.findOneAndUpdate(
            { path: cleanPath, date: today },
            { 
                $inc: { 
                    views: 1,
                    googleViews: isGoogle ? 1 : 0
                } 
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking error:", error);
        return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }
}
