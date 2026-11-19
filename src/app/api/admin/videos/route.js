export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceVideo from "@/models/ServiceVideo";
import ServicePage from "@/models/ServicePage";
import { syncServicePage } from "@/lib/service-sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
};

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const serviceSlug = searchParams.get("serviceSlug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const videoType = searchParams.get("videoType");
    const search = searchParams.get("search");

    let query = {};
    if (serviceSlug && serviceSlug !== "ALL") {
        query.serviceSlug = serviceSlug;
    }
    if (category && category !== "ALL") {
        query.category = category;
    }
    if (status && status !== "ALL") {
        if (status === "published") {
            query.isPublished = true;
            query.status = "published";
        } else if (status === "draft") {
            query.$or = [{ isPublished: false }, { status: "draft" }];
        }
    }
    if (videoType && videoType !== "ALL") {
        query.videoType = videoType;
    }
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ title: regex }, { youtubeId: regex }, { description: regex }, { tag: regex }];
    }

    const videos = await ServiceVideo.find(query).sort({ order: 1, createdAt: -1 }).lean();

    return NextResponse.json({
        success: true,
        count: videos.length,
        videos: videos.map(v => ({ ...v, _id: v._id.toString() }))
    });
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const body = await request.json();
        const {
            _id,
            title,
            youtubeUrl,
            customThumbnail,
            category,
            serviceSlug,
            oldServiceSlug,
            description,
            videoType,
            tag,
            isFeatured,
            order,
            isPublished,
            status
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Video title is required" }, { status: 400 });
        }
        if (!youtubeUrl || !youtubeUrl.trim()) {
            return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
        }
        if (!serviceSlug || !serviceSlug.trim()) {
            return NextResponse.json({ error: "Service association is required" }, { status: 400 });
        }

        const ytId = extractYouTubeId(youtubeUrl);
        if (!ytId) {
            return NextResponse.json({ error: "Invalid YouTube URL. Could not extract an 11-character Video ID." }, { status: 400 });
        }

        // Fetch service title if not provided
        let targetServiceTitle = "";
        const svcPage = await ServicePage.findOne({ slug: serviceSlug }, 'title category').lean();
        if (svcPage) {
            targetServiceTitle = svcPage.title;
        }

        const isShorts = videoType === 'shorts' || youtubeUrl.includes('/shorts/');
        const defaultThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        const activeThumb = customThumbnail && customThumbnail.trim() ? customThumbnail.trim() : defaultThumb;

        const updateData = {
            title: title.trim(),
            youtubeUrl: youtubeUrl.trim(),
            youtubeId: ytId,
            thumbnail: activeThumb,
            customThumbnail: customThumbnail || "",
            category: category ? category.trim() : (svcPage?.category || "CORPORATE"),
            serviceSlug: serviceSlug.trim(),
            serviceTitle: targetServiceTitle,
            description: description || "",
            videoType: isShorts ? 'shorts' : 'standard',
            tag: tag || (isShorts ? 'Short Highlight' : '4K Cinematic'),
            isFeatured: Boolean(isFeatured),
            order: order !== undefined ? Number(order) : 0,
            isPublished: isPublished !== undefined ? Boolean(isPublished) : (status !== 'draft'),
            status: status || (isPublished === false ? 'draft' : 'published')
        };

        let savedVideo;
        if (_id) {
            savedVideo = await ServiceVideo.findByIdAndUpdate(_id, { $set: updateData }, { returnDocument: 'after' });
        } else {
            savedVideo = await ServiceVideo.create(updateData);
        }

        // Synchronize ServicePage frontend representation
        await syncServicePage(serviceSlug);
        if (oldServiceSlug && oldServiceSlug !== serviceSlug) {
            await syncServicePage(oldServiceSlug);
        }

        return NextResponse.json({ success: true, video: savedVideo });
    } catch (err) {
        return safeErrorResponse(err, "Video POST");
    }
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const body = await request.json();
        const { items, serviceSlug } = body;

        if (Array.isArray(items)) {
            // Batch update order
            await Promise.all(items.map((item, idx) => 
                ServiceVideo.findByIdAndUpdate(item._id || item.id, { $set: { order: item.order !== undefined ? item.order : idx + 1 } })
            ));
        }

        if (serviceSlug) {
            await syncServicePage(serviceSlug);
        }

        return NextResponse.json({ success: true, message: "Videos reordered successfully" });
    } catch (err) {
        return safeErrorResponse(err, "Video PUT Reorder");
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
        }

        const video = await ServiceVideo.findById(id);
        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const targetSlug = video.serviceSlug;
        await ServiceVideo.findByIdAndDelete(id);

        // Re-sync ServicePage
        if (targetSlug) {
            await syncServicePage(targetSlug);
        }

        return NextResponse.json({ success: true, message: "Video deleted successfully" });
    } catch (err) {
        return safeErrorResponse(err, "Video DELETE");
    }
}
