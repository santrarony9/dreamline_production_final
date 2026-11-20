export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MediaAsset from "@/models/MediaAsset";
import ServicePage from "@/models/ServicePage";
import ServiceVideo from "@/models/ServiceVideo";
import ServiceShot from "@/models/ServiceShot";
import Content from "@/models/Content";
import CustomPage from "@/models/CustomPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { syncServicePage } from "@/lib/service-sync";
import { revalidatePath } from "next/cache";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    // Scan database for all image URLs in use
    const [pages, videos, shots, mediaDocs] = await Promise.all([
        ServicePage.find({}, 'slug title heroImage gallery').lean(),
        ServiceVideo.find({}, 'title serviceSlug thumbnail customThumbnail').lean(),
        ServiceShot.find({}, 'title serviceSlug imageUrl videoTitle').lean(),
        MediaAsset.find({}).sort({ createdAt: -1 }).lean()
    ]);

    // Build comprehensive usage map
    const usageMap = new Map();

    const recordUsage = (url, context) => {
        if (!url || typeof url !== 'string' || !url.trim()) return;
        const cleanUrl = url.trim();
        if (!usageMap.has(cleanUrl)) {
            usageMap.set(cleanUrl, []);
        }
        usageMap.get(cleanUrl).push(context);
    };

    pages.forEach(p => {
        if (p.heroImage) recordUsage(p.heroImage, { type: 'Service Hero', title: p.title, slug: p.slug });
        (p.gallery || []).forEach(g => {
            if (g.url) recordUsage(g.url, { type: 'Service Gallery', title: p.title, caption: g.caption });
        });
    });

    videos.forEach(v => {
        if (v.customThumbnail) recordUsage(v.customThumbnail, { type: 'Video Custom Thumbnail', title: v.title, serviceSlug: v.serviceSlug });
        else if (v.thumbnail) recordUsage(v.thumbnail, { type: 'Video Thumbnail', title: v.title, serviceSlug: v.serviceSlug });
    });

    shots.forEach(s => {
        if (s.imageUrl) recordUsage(s.imageUrl, { type: 'Photography Shot', title: s.title, serviceSlug: s.serviceSlug });
    });

    // Combine MediaAsset entries with unique usage URLs from database
    const allUrls = new Set([
        ...mediaDocs.map(m => m.url),
        ...usageMap.keys()
    ]);

    let results = [];
    for (const url of allUrls) {
        const matchingDoc = mediaDocs.find(m => m.url === url);
        const uses = usageMap.get(url) || [];

        const fileName = matchingDoc?.title || url.split('/').pop()?.split('?')[0] || "image";
        const isYouTubeThumb = url.includes('img.youtube.com') || url.includes('ytimg.com');

        // Apply search filter if provided
        if (search && search.trim()) {
            const s = search.toLowerCase();
            const matchesSearch = fileName.toLowerCase().includes(s) || 
                                  url.toLowerCase().includes(s) || 
                                  uses.some(u => u.title?.toLowerCase().includes(s));
            if (!matchesSearch) continue;
        }

        // Apply category filter if provided
        if (category && category !== 'ALL') {
            const matchesCat = (matchingDoc?.category?.toLowerCase() === category.toLowerCase()) || 
                               uses.some(u => u.serviceSlug?.toLowerCase().includes(category.toLowerCase()));
            if (!matchesCat) continue;
        }

        results.push({
            url,
            fileName,
            fileSize: matchingDoc?.fileSize || null,
            mimeType: matchingDoc?.mimeType || (url.endsWith('.webp') ? 'image/webp' : url.endsWith('.png') ? 'image/png' : 'image/jpeg'),
            isExternal: url.startsWith('http'),
            isYouTubeThumb,
            usageCount: uses.length,
            usedIn: uses,
            createdAt: matchingDoc?.createdAt || null
        });
    }

    // Sort by usage count and recency
    results.sort((a, b) => b.usageCount - a.usageCount || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json({
        success: true,
        total: results.length,
        assets: results
    });
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");
        const force = searchParams.get("force") === "true";

        if (!url) {
            return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
        }

        // Check if currently used in services, videos, or shots
        const [usedInHero, usedInGallery, usedInVideo, usedInShot] = await Promise.all([
            ServicePage.find({ heroImage: url }, 'title slug').lean(),
            ServicePage.find({ "gallery.url": url }, 'title slug').lean(),
            ServiceVideo.find({ $or: [{ thumbnail: url }, { customThumbnail: url }] }, 'title serviceSlug').lean(),
            ServiceShot.find({ imageUrl: url }, 'title serviceSlug').lean()
        ]);

        const allUses = [
            ...usedInHero.map(s => `Hero in "${s.title}"`),
            ...usedInGallery.map(s => `Gallery in "${s.title}"`),
            ...usedInVideo.map(v => `Thumbnail in "${v.title}" (${v.serviceSlug})`),
            ...usedInShot.map(sh => `Shot "${sh.title}" (${sh.serviceSlug})`)
        ];

        if (allUses.length > 0 && !force) {
            return NextResponse.json({
                warning: true,
                inUse: true,
                usageCount: allUses.length,
                usedIn: allUses,
                message: `This media file is currently in use in ${allUses.length} location(s):\n• ${allUses.slice(0, 3).join('\n• ')}${allUses.length > 3 ? ` and ${allUses.length - 3} more` : ''}.\n\nDeleting it may break images on your live site. Confirm force deletion?`
            }, { status: 409 });
        }

        // Safe to delete or forced:
        if (process.env.VERCEL !== '1' && url.startsWith('/uploads/')) {
            try {
                const fs = await import('fs/promises');
                const path = await import('path');
                const fileName = path.basename(url);
                const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
                await fs.unlink(filePath).catch(() => {});
            } catch (e) {}
        }

        await MediaAsset.deleteOne({ url });

        return NextResponse.json({
            success: true,
            message: "Media file deleted successfully."
        });
    } catch (err) {
        return safeErrorResponse(err, "Media Library DELETE");
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const body = await request.json();
        const { url, alt, title, caption, category, newUrl } = body;

        if (!url) {
            return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
        }

        // If replacing an old URL with a new URL across the entire database
        if (newUrl && newUrl !== url) {
            const cleanOld = url.trim();
            const cleanNew = newUrl.trim();

            // 1. Update ServicePage hero & gallery
            await ServicePage.updateMany(
                { heroImage: cleanOld },
                { $set: { heroImage: cleanNew } }
            );
            await ServicePage.updateMany(
                { "gallery.url": cleanOld },
                { $set: { "gallery.$[elem].url": cleanNew } },
                { arrayFilters: [{ "elem.url": cleanOld }] }
            );

            // 2. Update ServiceVideo
            await ServiceVideo.updateMany(
                { thumbnail: cleanOld },
                { $set: { thumbnail: cleanNew } }
            );
            await ServiceVideo.updateMany(
                { customThumbnail: cleanOld },
                { $set: { customThumbnail: cleanNew } }
            );

            // 3. Update ServiceShot
            await ServiceShot.updateMany(
                { imageUrl: cleanOld },
                { $set: { imageUrl: cleanNew } }
            );

            // 4. Update CustomPage
            await CustomPage.updateMany(
                { featuredImage: cleanOld },
                { $set: { featuredImage: cleanNew } }
            );
            await CustomPage.updateMany(
                { bannerImage: cleanOld },
                { $set: { bannerImage: cleanNew } }
            );

            // 5. Update MediaAsset
            await MediaAsset.findOneAndUpdate(
                { url: cleanOld },
                { 
                    $set: { 
                        url: cleanNew,
                        alt: alt !== undefined ? alt : "",
                        title: title !== undefined ? title : "",
                        category: category || "general"
                    } 
                },
                { upsert: true }
            );

            // Synchronize affected service pages
            const affectedPages = await ServicePage.find({
                $or: [{ heroImage: cleanNew }, { "gallery.url": cleanNew }]
            }, 'slug').lean();

            for (const p of affectedPages) {
                if (p.slug) await syncServicePage(p.slug);
            }

            try {
                revalidatePath('/', 'layout');
            } catch (e) {}

            return NextResponse.json({
                success: true,
                message: `Image replaced successfully across ${affectedPages.length} service page(s) and database records.`
            });
        }

        // Standard metadata update (alt, title, caption, category)
        const updated = await MediaAsset.findOneAndUpdate(
            { url },
            {
                $set: {
                    ...(alt !== undefined && { alt: alt.trim() }),
                    ...(title !== undefined && { title: title.trim() }),
                    ...(caption !== undefined && { caption: caption.trim() }),
                    ...(category !== undefined && { category }),
                    isManualApproved: true
                }
            },
            { upsert: true, returnDocument: 'after' }
        );

        return NextResponse.json({
            success: true,
            asset: updated,
            message: "Media metadata updated successfully."
        });
    } catch (err) {
        return safeErrorResponse(err, "Media Library PATCH");
    }
}
