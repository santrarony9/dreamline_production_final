export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import PodcastVideo from "@/models/PodcastVideo";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function detectVideoType(url) {
    if (!url) return 'standard';
    return url.includes('/shorts/') ? 'shorts' : 'standard';
}

async function syncServicePageVideos() {
    try {
        const publishedVideos = await PodcastVideo.find({ status: "published" })
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();
        
        const serviceVideos = publishedVideos.map(v => ({
            title: v.title,
            url: v.youtubeUrl,
            thumbnail: v.thumbnail
        }));

        await ServicePage.updateOne(
            { slug: "podcast-production-kolkata" },
            { $set: { videos: serviceVideos } }
        );
    } catch (e) {
        console.error("Failed to sync ServicePage.videos:", e);
    }
}

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const video = await PodcastVideo.findById(id).lean();

        if (!video) {
            return NextResponse.json({ error: "Podcast video not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, item: video });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const video = await PodcastVideo.findById(id);
        if (!video) {
            return NextResponse.json({ error: "Podcast video not found" }, { status: 404 });
        }

        // Handle partial or full updates
        if (body.title !== undefined) video.title = body.title.trim();
        if (body.description !== undefined) video.description = body.description.trim();
        if (body.category !== undefined) video.category = body.category.trim();
        if (body.status !== undefined) video.status = body.status === "draft" ? "draft" : "published";
        if (body.displayOrder !== undefined) video.displayOrder = parseInt(body.displayOrder, 10) || 0;

        if (body.youtubeUrl && body.youtubeUrl.trim() !== video.youtubeUrl) {
            const ytId = extractYouTubeId(body.youtubeUrl.trim());
            if (!ytId) {
                return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
            }
            video.youtubeUrl = body.youtubeUrl.trim();
            video.youtubeId = ytId;
            if (!body.videoType) {
                video.videoType = detectVideoType(body.youtubeUrl.trim());
            }
            if (!body.thumbnail) {
                video.thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }
        }

        if (body.videoType !== undefined) {
            video.videoType = body.videoType === "shorts" ? "shorts" : "standard";
        }

        if (body.thumbnail !== undefined) {
            video.thumbnail = body.thumbnail.trim();
        }

        await video.save();
        await syncServicePageVideos();
        revalidatePath("/services/podcast-production-kolkata/");

        return NextResponse.json({
            success: true,
            item: video,
            message: "Podcast video updated successfully"
        });

    } catch (err) {
        console.error("PUT /api/admin/podcasts/[id] error:", err);
        return NextResponse.json({ error: err.message || "Failed to update video" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const deleted = await PodcastVideo.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        await syncServicePageVideos();
        revalidatePath("/services/podcast-production-kolkata/");

        return NextResponse.json({
            success: true,
            message: "Video deleted successfully"
        });
    } catch (err) {
        console.error("DELETE /api/admin/podcasts/[id] error:", err);
        return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }
}
