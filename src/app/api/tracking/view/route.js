import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";

export async function POST(request) {
    try {
        await dbConnect();
        const { path } = await request.json();

        if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Increment views for the path on this day
        await Analytics.findOneAndUpdate(
            { path, date: today },
            { $inc: { views: 1 } },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking error:", error);
        return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
    }
}
