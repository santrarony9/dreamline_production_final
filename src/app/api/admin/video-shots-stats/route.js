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
        totalVideos,
        publishedVideos,
        draftVideos,
        totalShots,
        publishedShots,
        draftShots,
        categories,
        recentVideos,
        recentShots
    ] = await Promise.all([
        ServicePage.countDocuments(),
        ServicePage.countDocuments({ isPublished: true }),
        ServiceVideo.countDocuments(),
        ServiceVideo.countDocuments({ isPublished: true, status: 'published' }),
        ServiceVideo.countDocuments({ $or: [{ isPublished: false }, { status: 'draft' }] }),
        ServiceShot.countDocuments(),
        ServiceShot.countDocuments({ isPublished: true, status: 'published' }),
        ServiceShot.countDocuments({ $or: [{ isPublished: false }, { status: 'draft' }] }),
        ServiceCategory.find({}).sort({ order: 1 }).lean(),
        ServiceVideo.find({}).sort({ createdAt: -1 }).limit(6).lean(),
        ServiceShot.find({}).sort({ createdAt: -1 }).limit(6).lean()
    ]);

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
