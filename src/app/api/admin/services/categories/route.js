import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceCategory from "@/models/ServiceCategory";
import NavigationItem from "@/models/NavigationItem";
import ServicePage from "@/models/ServicePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { revalidateNavigation } from "@/lib/navigation-service";

export const dynamic = 'force-dynamic';

const DEFAULT_SEED_CATEGORIES = [
    { name: "WEDDING", slug: "wedding", order: 1, description: "Luxury candid wedding photography, cinematic films and rituals in Kolkata", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "CORPORATE", slug: "corporate", order: 2, description: "Commercial ad films, brand promotions, documentaries and corporate media", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "DRONE & AERIAL", slug: "drone-and-aerial", order: 3, description: "DGCA-certified 4K aerial cinematography, mapping and photogrammetry", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "SOCIAL", slug: "social", order: 4, description: "Birthdays, rice ceremonies, family celebrations and cultural events", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "FASHION", slug: "fashion", order: 5, description: "Editorial fashion photography, runway videography and designer fashion films", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "PRODUCT", slug: "product", order: 6, description: "E-commerce product photography, 360 turntable videography and product commercials", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "POST PRODUCTION", slug: "post-production", order: 7, description: "Precision video editing, DaVinci Resolve color grading, VFX and high-end photo retouching", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "TECH", slug: "tech", order: 8, description: "Modern responsive web design, multi-camera live streaming and hybrid broadcasts", showInMegaMenu: true, isActive: true, isPublished: true },
    { name: "EVENT MANAGEMENT", slug: "event-management", order: 9, description: "Full-scale corporate summits, concerts & luxury event planning", showInMegaMenu: true, isActive: true, isPublished: true, badge: "COMING SOON" }
];

async function ensureCategoriesSeeded() {
    await dbConnect();
    const count = await ServiceCategory.countDocuments();
    if (count === 0) {
        for (const cat of DEFAULT_SEED_CATEGORIES) {
            await ServiceCategory.create(cat);
        }
    }
}

export async function GET() {
    try {
        await dbConnect();
        await ensureCategoriesSeeded();

        const categories = await ServiceCategory.find().sort({ order: 1, createdAt: 1 }).lean();

        // Calculate service count per category from NavigationItem under SERVICES
        const servicesRoot = await NavigationItem.findOne({ title: "SERVICES", parentId: null }).lean();
        let serviceCounts = {};
        if (servicesRoot) {
            const items = await NavigationItem.find({ parentId: servicesRoot._id }).lean();
            items.forEach(it => {
                const grp = (it.group || "").trim().toUpperCase();
                if (grp) {
                    serviceCounts[grp] = (serviceCounts[grp] || 0) + 1;
                }
            });
        }

        const enriched = categories.map(cat => ({
            ...cat,
            id: cat._id.toString(),
            serviceCount: serviceCounts[cat.name.toUpperCase()] || 0
        }));

        return NextResponse.json({ success: true, categories: enriched });
    } catch (err) {
        return safeErrorResponse(err, "ServiceCategory GET");
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { id, name, slug, description, image, order, isActive, isPublished, showInMegaMenu, url, badge, oldName } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const cleanName = name.trim().toUpperCase();
        const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();

        let categoryDoc;
        if (id) {
            categoryDoc = await ServiceCategory.findById(id);
            if (!categoryDoc) {
                return NextResponse.json({ error: "Category not found" }, { status: 404 });
            }

            const previousName = categoryDoc.name;
            categoryDoc.name = cleanName;
            categoryDoc.slug = cleanSlug;
            if (description !== undefined) categoryDoc.description = description;
            if (image !== undefined) categoryDoc.image = image;
            if (order !== undefined) categoryDoc.order = Number(order) || 0;
            if (isActive !== undefined) categoryDoc.isActive = Boolean(isActive);
            if (isPublished !== undefined) categoryDoc.isPublished = Boolean(isPublished);
            if (showInMegaMenu !== undefined) categoryDoc.showInMegaMenu = Boolean(showInMegaMenu);
            if (url !== undefined) categoryDoc.url = url;
            if (badge !== undefined) categoryDoc.badge = badge;
            await categoryDoc.save();

            // If category name changed, update navigation items and service pages referencing the previous name
            if (previousName && previousName !== cleanName) {
                await NavigationItem.updateMany(
                    { group: previousName },
                    { $set: { group: cleanName } }
                );
                await ServicePage.updateMany(
                    { category: previousName },
                    { $set: { category: cleanName } }
                );
            }
        } else {
            // Create new category
            categoryDoc = await ServiceCategory.create({
                name: cleanName,
                slug: cleanSlug,
                description: description || "",
                image: image || "",
                order: Number(order) || 0,
                isActive: isActive !== false,
                isPublished: isPublished !== false,
                showInMegaMenu: showInMegaMenu !== false,
                url: url || "",
                badge: badge || ""
            });
        }

        revalidateNavigation();
        return NextResponse.json({ success: true, category: categoryDoc });
    } catch (err) {
        return safeErrorResponse(err, "ServiceCategory POST");
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const name = searchParams.get("name");

        if (!id && !name) {
            return NextResponse.json({ error: "Category ID or Name is required" }, { status: 400 });
        }

        const query = id ? { _id: id } : { name: name.trim().toUpperCase() };
        const categoryDoc = await ServiceCategory.findOne(query);

        if (!categoryDoc) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        const catName = categoryDoc.name;
        await ServiceCategory.deleteOne({ _id: categoryDoc._id });

        // Remove or unassign child navigation items under SERVICES with this group
        const servicesRoot = await NavigationItem.findOne({ title: "SERVICES", parentId: null });
        if (servicesRoot) {
            await NavigationItem.deleteMany({ parentId: servicesRoot._id, group: catName });
        }

        revalidateNavigation();
        return NextResponse.json({ success: true, message: `Category "${catName}" and its navigation items have been removed.` });
    } catch (err) {
        return safeErrorResponse(err, "ServiceCategory DELETE");
    }
}
