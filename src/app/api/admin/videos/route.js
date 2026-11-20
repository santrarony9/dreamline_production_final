export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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

const extractInstagramShortcode = (url) => {
    if (!url) return null;
    const match = url.trim().match(/instagram\.com\/(?:[^\/]+\/)?(?:reel|p)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
};

async function downloadAndStoreInstagramThumbnail(shortcode, reelUrl) {
    if (!shortcode || !reelUrl) return null;
    try {
        const destDir = path.join(process.cwd(), "public", "uploads", "fashion", "reels");
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        const filePath = path.join(destDir, `reel-${shortcode.toLowerCase()}.jpg`);
        const relativeUrl = `/uploads/fashion/reels/reel-${shortcode.toLowerCase()}.jpg`;

        const res = await fetch(reelUrl, {
            headers: {
                "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
            }
        });
        if (!res.ok) {
            return fs.existsSync(filePath) ? relativeUrl : null;
        }
        const html = await res.text();
        const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
        if (!ogMatch) {
            return fs.existsSync(filePath) ? relativeUrl : null;
        }
        const imgUrl = ogMatch[1].replace(/&amp;/g, "&");
        const imgRes = await fetch(imgUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        if (!imgRes.ok) {
            return fs.existsSync(filePath) ? relativeUrl : null;
        }
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        return relativeUrl;
    } catch (e) {
        console.error("Error downloading Instagram thumbnail:", e);
        return null;
    }
}

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

        // Dedicated action to refresh/download live Instagram Reel thumbnail
        if (body.action === 'refresh-thumbnail') {
            const reelUrl = (body.youtubeUrl || body.videoUrl || body.url || "").trim();
            const instaId = extractInstagramShortcode(reelUrl);
            if (!instaId) {
                return NextResponse.json({ error: "Only Instagram Reels can have thumbnails refreshed." }, { status: 400 });
            }
            const downloaded = await downloadAndStoreInstagramThumbnail(instaId, reelUrl);
            if (!downloaded) {
                return NextResponse.json({ error: "Could not retrieve thumbnail from Instagram. You may upload a custom thumbnail." }, { status: 404 });
            }
            if (body._id) {
                await ServiceVideo.findByIdAndUpdate(body._id, { $set: { thumbnail: downloaded, customThumbnail: downloaded } });
                if (body.serviceSlug) {
                    await syncServicePage(body.serviceSlug);
                }
            }
            return NextResponse.json({ success: true, thumbnail: downloaded });
        }

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
        const inputUrl = (youtubeUrl || body.videoUrl || body.url || "").trim();
        if (!inputUrl) {
            return NextResponse.json({ error: "Video URL is required (YouTube or Instagram Reel)" }, { status: 400 });
        }
        if (!serviceSlug || !serviceSlug.trim()) {
            return NextResponse.json({ error: "Service association is required" }, { status: 400 });
        }

        const ytId = extractYouTubeId(inputUrl);
        const instaId = extractInstagramShortcode(inputUrl);

        if (!ytId && !instaId) {
            return NextResponse.json({ error: "Invalid URL. Please provide a valid YouTube video/shorts or Instagram Reel link." }, { status: 400 });
        }

        const isInstagram = Boolean(instaId);
        const isShorts = isInstagram || videoType === 'shorts' || inputUrl.includes('/shorts/');
        const platform = isInstagram ? 'instagram' : 'youtube';

        // Fetch service title if not provided
        let targetServiceTitle = "";
        const svcPage = await ServicePage.findOne({ slug: serviceSlug }, 'title category').lean();
        if (svcPage) {
            targetServiceTitle = svcPage.title;
        }

        let defaultThumb = "";
        if (isInstagram) {
            const localJpg = `/uploads/fashion/reels/reel-${instaId.toLowerCase()}.jpg`;
            const fullLocal = path.join(process.cwd(), "public", "uploads", "fashion", "reels", `reel-${instaId.toLowerCase()}.jpg`);
            if (!fs.existsSync(fullLocal)) {
                await downloadAndStoreInstagramThumbnail(instaId, inputUrl);
            }
            defaultThumb = localJpg;
        } else {
            defaultThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
        const activeThumb = customThumbnail && customThumbnail.trim() ? customThumbnail.trim() : defaultThumb;

        const updateData = {
            title: title.trim(),
            youtubeUrl: inputUrl,
            youtubeId: ytId || instaId || "",
            videoUrl: inputUrl,
            platform,
            instagramUrl: isInstagram ? inputUrl : "",
            instagramId: instaId || "",
            thumbnail: activeThumb,
            customThumbnail: customThumbnail || "",
            category: category ? category.trim() : (svcPage?.category || "FASHION"),
            serviceSlug: serviceSlug.trim(),
            serviceTitle: targetServiceTitle,
            description: description || "",
            videoType: isShorts ? 'shorts' : 'standard',
            tag: tag || (isInstagram ? 'Instagram Reel' : (isShorts ? 'Short Highlight' : '4K Cinematic')),
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
