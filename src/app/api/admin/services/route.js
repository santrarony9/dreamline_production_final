export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceVideo from "@/models/ServiceVideo";
import ServiceShot from "@/models/ServiceShot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { safeErrorResponse } from "@/lib/error-handler";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = {};
    if (category && category !== "ALL") {
        query.category = category;
    }
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ title: regex }, { slug: regex }, { description: regex }];
    }

    const services = await ServicePage.find(query).sort({ order: 1, createdAt: 1 }).lean();

    // Enrich each service with real video and shot counts
    const enriched = await Promise.all(services.map(async (svc) => {
        const [videoCount, shotCount] = await Promise.all([
            ServiceVideo.countDocuments({ serviceSlug: svc.slug }),
            ServiceShot.countDocuments({ serviceSlug: svc.slug })
        ]);
        return {
            ...svc,
            _id: svc._id.toString(),
            videoCount,
            shotCount
        };
    }));

    return NextResponse.json({ success: true, services: enriched });
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
            category,
            slug,
            oldSlug,
            shortDescription,
            description,
            heroImage,
            heroImageAlt,
            order,
            seoTitle,
            metaDescription,
            metaKeywords,
            isPublished
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Service name is required" }, { status: 400 });
        }
        if (!slug || !slug.trim()) {
            return NextResponse.json({ error: "Service slug is required" }, { status: 400 });
        }

        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const targetSlug = cleanSlug;

        // Check if slug is taken by another service
        const existing = await ServicePage.findOne({ slug: targetSlug, ...(_id ? { _id: { $ne: _id } } : {}) });
        if (existing) {
            return NextResponse.json({ error: `Slug "${targetSlug}" is already in use by "${existing.title}"` }, { status: 400 });
        }

        const updateData = {
            title: title.trim(),
            category: category ? category.trim() : "CORPORATE",
            slug: targetSlug,
            shortDescription: shortDescription || "",
            subtitle: shortDescription || "Services",
            description: description || "",
            heroImage: heroImage || "",
            heroImageAlt: heroImageAlt || `${title} - Dreamline Production Kolkata`,
            order: order !== undefined ? Number(order) : 0,
            seoTitle: seoTitle || `${title} | Dreamline Production Kolkata`,
            metaDescription: metaDescription || description || `Professional ${title} services by Dreamline Production in Kolkata.`,
            metaKeywords: metaKeywords || "",
            isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
            active: isPublished !== undefined ? Boolean(isPublished) : true
        };

        let savedService;
        if (_id) {
            savedService = await ServicePage.findByIdAndUpdate(_id, { $set: updateData }, { returnDocument: 'after' });
            
            // If slug was renamed, update associated videos and shots
            if (oldSlug && oldSlug !== targetSlug) {
                await Promise.all([
                    ServiceVideo.updateMany({ serviceSlug: oldSlug }, { $set: { serviceSlug: targetSlug, serviceTitle: title } }),
                    ServiceShot.updateMany({ serviceSlug: oldSlug }, { $set: { serviceSlug: targetSlug, serviceTitle: title } })
                ]);
                revalidatePath(`/services/${oldSlug}/`);
            }
        } else {
            savedService = await ServicePage.findOneAndUpdate(
                { slug: targetSlug },
                { $set: updateData },
                { upsert: true, returnDocument: 'after' }
            );
        }

        revalidatePath(`/services/${targetSlug}/`);
        revalidatePath('/services/');
        revalidatePath('/', 'layout');

        return NextResponse.json({ success: true, service: savedService });
    } catch (err) {
        return safeErrorResponse(err, "Service POST");
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
        const slug = searchParams.get("slug");
        const force = searchParams.get("force") === "true";

        if (!id && !slug) {
            return NextResponse.json({ error: "Service ID or slug is required" }, { status: 400 });
        }

        const service = await ServicePage.findOne(id ? { _id: id } : { slug });
        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        const [videoCount, shotCount] = await Promise.all([
            ServiceVideo.countDocuments({ serviceSlug: service.slug }),
            ServiceShot.countDocuments({ serviceSlug: service.slug })
        ]);

        // If content is attached and force is not set, return warning with counts
        if ((videoCount > 0 || shotCount > 0) && !force) {
            return NextResponse.json({
                warning: true,
                message: `This service has ${videoCount} video(s) and ${shotCount} shot(s) associated with it. Are you sure you want to delete it?`,
                videoCount,
                shotCount
            }, { status: 409 });
        }

        await ServicePage.findByIdAndDelete(service._id);

        if (force) {
            // Remove or orphan associated videos and shots
            await Promise.all([
                ServiceVideo.deleteMany({ serviceSlug: service.slug }),
                ServiceShot.deleteMany({ serviceSlug: service.slug })
            ]);
        }

        revalidatePath(`/services/${service.slug}/`);
        revalidatePath('/services/');
        revalidatePath('/', 'layout');

        return NextResponse.json({
            success: true,
            message: `Service "${service.title}" deleted successfully.`
        });
    } catch (err) {
        return safeErrorResponse(err, "Service DELETE");
    }
}
