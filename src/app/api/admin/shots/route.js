export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceShot from "@/models/ServiceShot";
import ServiceVideo from "@/models/ServiceVideo";
import ServicePage from "@/models/ServicePage";
import MediaAsset from "@/models/MediaAsset";
import { syncServicePage } from "@/lib/service-sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const serviceSlug = searchParams.get("serviceSlug");
    const category = searchParams.get("category");
    const videoId = searchParams.get("videoId");
    const shotType = searchParams.get("shotType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = {};
    if (serviceSlug && serviceSlug !== "ALL") {
        query.serviceSlug = serviceSlug;
    }
    if (category && category !== "ALL") {
        query.category = category;
    }
    if (videoId && videoId !== "ALL") {
        query.videoId = videoId;
    }
    if (shotType && shotType !== "ALL") {
        query.shotType = shotType;
    }
    if (status && status !== "ALL") {
        if (status === "published") {
            query.isPublished = true;
            query.status = "published";
        } else if (status === "draft") {
            query.$or = [{ isPublished: false }, { status: "draft" }];
        }
    }
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ title: regex }, { description: regex }, { videoTitle: regex }];
    }

    const shots = await ServiceShot.find(query).sort({ order: 1, createdAt: -1 }).lean();

    return NextResponse.json({
        success: true,
        count: shots.length,
        shots: shots.map(s => ({ ...s, _id: s._id.toString() }))
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

        // ── BULK MULTI-IMAGE UPLOAD HANDLING ──
        if (body.bulk && Array.isArray(body.shots)) {
            const { serviceSlug, category, videoId } = body;
            if (!serviceSlug) {
                return NextResponse.json({ error: "Service slug is required for bulk shots" }, { status: 400 });
            }

            const svc = await ServicePage.findOne({ slug: serviceSlug }, 'title category').lean();
            const serviceTitle = svc?.title || serviceSlug;
            const targetCategory = category || svc?.category || "CORPORATE";

            let videoInfo = { videoTitle: "", videoUrl: "" };
            if (videoId) {
                const vid = await ServiceVideo.findById(videoId).lean();
                if (vid) {
                    videoInfo = { videoTitle: vid.title, videoUrl: vid.youtubeUrl };
                }
            }

            // Get current max order for this service
            const lastShot = await ServiceShot.findOne({ serviceSlug }).sort({ order: -1 }).lean();
            let startOrder = lastShot?.order ? lastShot.order + 1 : 1;

            const createdShots = [];
            for (let i = 0; i < body.shots.length; i++) {
                const s = body.shots[i];
                if (!s.imageUrl) continue;

                const newShot = await ServiceShot.create({
                    title: s.title || `${serviceTitle} Shot #${startOrder + i}`,
                    imageUrl: s.imageUrl,
                    thumbnailUrl: s.thumbnailUrl || s.imageUrl,
                    category: targetCategory,
                    serviceSlug,
                    serviceTitle,
                    videoId: videoId || s.videoId || null,
                    videoTitle: videoInfo.videoTitle || s.videoTitle || "",
                    videoUrl: videoInfo.videoUrl || s.videoUrl || "",
                    description: s.description || "",
                    shotType: s.shotType || "candid",
                    aspectRatio: s.aspectRatio || "16:9",
                    isFeatured: Boolean(s.isFeatured),
                    order: startOrder + i,
                    isPublished: true,
                    status: 'published'
                });
                createdShots.push(newShot);

                // Register media asset
                try {
                    await MediaAsset.findOneAndUpdate(
                        { url: s.imageUrl },
                        {
                            $set: {
                                alt: newShot.title,
                                title: newShot.title,
                                source: 'shot-upload'
                            },
                            $addToSet: {
                                usedIn: {
                                    model: 'ServiceShot',
                                    documentId: newShot._id.toString(),
                                    field: 'imageUrl',
                                    contextTitle: newShot.title
                                }
                            }
                        },
                        { upsert: true }
                    );
                } catch (e) {}
            }

            await syncServicePage(serviceSlug);

            return NextResponse.json({
                success: true,
                message: `Successfully uploaded and added ${createdShots.length} shots.`,
                count: createdShots.length,
                shots: createdShots
            });
        }

        // ── SINGLE SHOT CREATION / UPDATE ──
        const {
            _id,
            title,
            imageUrl,
            thumbnailUrl,
            category,
            serviceSlug,
            oldServiceSlug,
            videoId,
            description,
            shotType,
            aspectRatio,
            isFeatured,
            order,
            isPublished,
            status
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Shot title is required" }, { status: 400 });
        }
        if (!imageUrl || !imageUrl.trim()) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }
        if (!serviceSlug || !serviceSlug.trim()) {
            return NextResponse.json({ error: "Service association is required" }, { status: 400 });
        }

        const svc = await ServicePage.findOne({ slug: serviceSlug }, 'title category').lean();
        const serviceTitle = svc?.title || serviceSlug;
        const targetCategory = category || svc?.category || "CORPORATE";

        let videoInfo = { videoTitle: "", videoUrl: "" };
        if (videoId) {
            const vid = await ServiceVideo.findById(videoId).lean();
            if (vid) {
                videoInfo = { videoTitle: vid.title, videoUrl: vid.youtubeUrl };
            }
        }

        const shotData = {
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            thumbnailUrl: thumbnailUrl || imageUrl.trim(),
            category: targetCategory,
            serviceSlug: serviceSlug.trim(),
            serviceTitle,
            videoId: videoId || null,
            videoTitle: videoInfo.videoTitle,
            videoUrl: videoInfo.videoUrl,
            description: description || "",
            shotType: shotType || "candid",
            aspectRatio: aspectRatio || "16:9",
            isFeatured: Boolean(isFeatured),
            order: order !== undefined ? Number(order) : 0,
            isPublished: isPublished !== undefined ? Boolean(isPublished) : (status !== 'draft'),
            status: status || (isPublished === false ? 'draft' : 'published')
        };

        let savedShot;
        if (_id) {
            savedShot = await ServiceShot.findByIdAndUpdate(_id, { $set: shotData }, { returnDocument: 'after' });
        } else {
            savedShot = await ServiceShot.create(shotData);
        }

        // Track media asset usage
        try {
            await MediaAsset.findOneAndUpdate(
                { url: imageUrl.trim() },
                {
                    $set: {
                        alt: savedShot.title,
                        title: savedShot.title,
                        source: 'shot-upload'
                    },
                    $addToSet: {
                        usedIn: {
                            model: 'ServiceShot',
                            documentId: savedShot._id.toString(),
                            field: 'imageUrl',
                            contextTitle: savedShot.title
                        }
                    }
                },
                { upsert: true }
            );
        } catch (e) {}

        await syncServicePage(serviceSlug);
        if (oldServiceSlug && oldServiceSlug !== serviceSlug) {
            await syncServicePage(oldServiceSlug);
        }

        return NextResponse.json({ success: true, shot: savedShot });
    } catch (err) {
        return safeErrorResponse(err, "Shot POST");
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
            await Promise.all(items.map((item, idx) => 
                ServiceShot.findByIdAndUpdate(item._id || item.id, { $set: { order: item.order !== undefined ? item.order : idx + 1 } })
            ));
        }

        if (serviceSlug) {
            await syncServicePage(serviceSlug);
        }

        return NextResponse.json({ success: true, message: "Shots reordered successfully" });
    } catch (err) {
        return safeErrorResponse(err, "Shot PUT Reorder");
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
            return NextResponse.json({ error: "Shot ID is required" }, { status: 400 });
        }

        const shot = await ServiceShot.findById(id);
        if (!shot) {
            return NextResponse.json({ error: "Shot not found" }, { status: 404 });
        }

        const targetSlug = shot.serviceSlug;
        const shotImgUrl = shot.imageUrl;
        await ServiceShot.findByIdAndDelete(id);

        // Remove from MediaAsset usedIn
        try {
            await MediaAsset.updateOne(
                { url: shotImgUrl },
                { $pull: { usedIn: { documentId: id } } }
            );
        } catch (e) {}

        if (targetSlug) {
            await syncServicePage(targetSlug);
        }

        return NextResponse.json({ success: true, message: "Shot deleted successfully" });
    } catch (err) {
        return safeErrorResponse(err, "Shot DELETE");
    }
}
