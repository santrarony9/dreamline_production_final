export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceCategory from "@/models/ServiceCategory";
import ServiceVideo from "@/models/ServiceVideo";
import ServiceShot from "@/models/ServiceShot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [
        totalServices,
        publishedServices,
        videoStats,
        shotStats,
        categories,
        recentVideos,
        recentShots
    ] = await Promise.all([
        ServicePage.countDocuments(),
        ServicePage.countDocuments({ isPublished: true }),
        ServiceVideo.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$isPublished", true] }, { $ne: ["$status", "draft"] }] }, 1, 0]
                        }
                    }
                }
            }
        ]),
        ServiceShot.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$isPublished", true] }, { $ne: ["$status", "draft"] }] }, 1, 0]
                        }
                    }
                }
            }
        ]),
        ServiceCategory.find({}).sort({ order: 1 }).lean(),
        ServiceVideo.find({}).sort({ createdAt: -1 }).limit(6).lean(),
        ServiceShot.find({}).sort({ createdAt: -1 }).limit(6).lean()
    ]);

    const totalVideos = videoStats[0]?.total || 0;
    const publishedVideos = videoStats[0]?.published || 0;
    const draftVideos = Math.max(0, totalVideos - publishedVideos);

    const totalShots = shotStats[0]?.total || 0;
    const publishedShots = shotStats[0]?.published || 0;
    const draftShots = Math.max(0, totalShots - publishedShots);

    return NextResponse.json({
        totalServices,
        publishedServices,
        totalVideos,
        publishedVideos,
        draftVideos,
        totalShots,
        publishedShots,
        draftShots,
        categories,
        recentVideos,
        recentShots
    });
}
