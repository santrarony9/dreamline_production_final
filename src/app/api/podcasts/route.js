export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PodcastVideo from "@/models/PodcastVideo";
import { ensurePodcastVideosSeeded } from "@/lib/podcast-defaults";

export async function GET(request) {
    try {
        await dbConnect();
        await ensurePodcastVideosSeeded();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const videoType = searchParams.get("type");

        const filter = { status: "published" };

        if (category && category !== "all") {
            filter.category = category;
        }

        if (videoType && videoType !== "all") {
            filter.videoType = videoType;
        }

        const items = await PodcastVideo.find(filter)
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            items,
            total: items.length
        });
    } catch (err) {
        console.error("GET /api/podcasts error:", err);
        return NextResponse.json({ error: "Failed to fetch podcast videos" }, { status: 500 });
    }
}
