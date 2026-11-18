export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import PodcastVideo from "@/models/PodcastVideo";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensurePodcastVideosSeeded } from "@/lib/podcast-defaults";

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

// Keep ServicePage.videos synchronized for redundancy
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

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        await ensurePodcastVideosSeeded();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const category = searchParams.get("category") || "all";
        const videoType = searchParams.get("videoType") || "all";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const filter = {};

        if (status !== "all") {
            filter.status = status;
        }

        if (category !== "all") {
            filter.category = category;
        }

        if (videoType !== "all") {
            filter.videoType = videoType;
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
                { youtubeId: regex }
            ];
        }

        const total = await PodcastVideo.countDocuments(filter);
        const items = await PodcastVideo.find(filter)
            .sort({ displayOrder: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Get unique categories and overall counts for tabs
        const allItems = await PodcastVideo.find({}).select('category status videoType').lean();
        const categories = Array.from(new Set(allItems.map(i => i.category).filter(Boolean)));
        
        const counts = {
            total: allItems.length,
            published: allItems.filter(i => i.status === "published").length,
            draft: allItems.filter(i => i.status === "draft").length,
            standard: allItems.filter(i => i.videoType === "standard").length,
            shorts: allItems.filter(i => i.videoType === "shorts").length
        };

        return NextResponse.json({
            success: true,
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            categories,
            counts
        });
    } catch (err) {
        console.error("GET /api/admin/podcasts error:", err);
        return NextResponse.json({ error: "Failed to fetch podcast videos" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // 1. Bulk Reorder
        if (body.action === 'reorder' && Array.isArray(body.items)) {
            const bulkOps = body.items.map((item, index) => ({
                updateOne: {
                    filter: { _id: item._id || item.id },
                    update: { $set: { displayOrder: index + 1 } }
                }
            }));

            if (bulkOps.length > 0) {
                await PodcastVideo.bulkWrite(bulkOps);
            }

            await syncServicePageVideos();
            revalidatePath("/services/podcast-production-kolkata/");
            return NextResponse.json({ success: true, message: "Order updated successfully" });
        }

        // 2. Create Single Video
        const { title, youtubeUrl, description, category, videoType, thumbnail, displayOrder, status } = body;

        if (!youtubeUrl || !youtubeUrl.trim()) {
            return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
        }

        const ytId = extractYouTubeId(youtubeUrl.trim());
        if (!ytId) {
            return NextResponse.json({ error: "Invalid YouTube URL. Please provide a valid watch, share, or shorts URL." }, { status: 400 });
        }

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Video title is required" }, { status: 400 });
        }

        const detectedType = videoType || detectVideoType(youtubeUrl.trim());
        
        let finalThumbnail = thumbnail && thumbnail.trim();
        if (!finalThumbnail) {
            finalThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }

        let order = parseInt(displayOrder, 10);
        if (isNaN(order)) {
            const maxOrderDoc = await PodcastVideo.findOne({}).sort({ displayOrder: -1 }).select('displayOrder').lean();
            order = (maxOrderDoc?.displayOrder || 0) + 1;
        }

        const newVideo = await PodcastVideo.create({
            title: title.trim(),
            youtubeUrl: youtubeUrl.trim(),
            youtubeId: ytId,
            description: description ? description.trim() : "",
            category: category ? category.trim() : "General",
            videoType: detectedType,
            thumbnail: finalThumbnail,
            displayOrder: order,
            status: status === "draft" ? "draft" : "published"
        });

        await syncServicePageVideos();
        revalidatePath("/services/podcast-production-kolkata/");

        return NextResponse.json({
            success: true,
            item: newVideo,
            message: "Podcast video added successfully"
        }, { status: 201 });

    } catch (err) {
        console.error("POST /api/admin/podcasts error:", err);
        return NextResponse.json({ error: err.message || "Failed to create podcast video" }, { status: 500 });
    }
}
