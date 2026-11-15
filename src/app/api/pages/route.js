export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import CustomPage from "@/models/CustomPage";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { normalizePageSlug, isValidPageSlug, checkPageSlugAvailability } from "@/lib/page-redirects";

function getISTDateString() {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

async function syncPageNavigation(page, isRemoving = false) {
    try {
        const siteContent = await Content.findOne();
        if (!siteContent) return;

        let navItems = siteContent.global?.navigation?.items || [];
        const pageHref = `/${page.slug}/`;
        const oldHrefs = (page.aliases || []).map(a => `/${a}/`);

        // Filter out existing entries for this page
        navItems = navItems.filter(item => 
            item.href !== pageHref && 
            item.href !== `/${page.slug}` &&
            !oldHrefs.includes(item.href)
        );

        if (!isRemoving && page.navigation?.inNavbar && page.status === 'published') {
            navItems.push({
                label: page.navigation.navLabel || page.title.toUpperCase(),
                href: pageHref,
                order: page.navigation.navOrder || 99
            });
            // Sort by order
            navItems.sort((a, b) => (a.order || 99) - (b.order || 99));
        }

        siteContent.global = siteContent.global || {};
        siteContent.global.navigation = siteContent.global.navigation || {};
        siteContent.global.navigation.items = navItems;
        await siteContent.save();
    } catch (err) {
        console.error("Error syncing page navigation:", err);
    }
}

export async function GET(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const todayStr = getISTDateString();

    let query = {};

    if (!session) {
        // Public visitors only see published pages scheduled for today or earlier
        query = {
            status: 'published',
            $or: [
                { publishDate: { $lte: todayStr } },
                { publishDate: null },
                { publishDate: "" },
                { publishDate: { $exists: false } }
            ]
        };
    } else if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'draft') {
            query = { status: 'draft' };
        } else if (statusFilter === 'scheduled') {
            query = {
                $or: [
                    { status: 'scheduled' },
                    { publishDate: { $gt: todayStr }, status: { $ne: 'draft' } }
                ]
            };
        } else if (statusFilter === 'published') {
            query = {
                status: 'published',
                publishDate: { $lte: todayStr }
            };
        }
    }

    const pages = await CustomPage.find(query).sort({ updatedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json(pages);
}

const ALLOWED_PAGE_FIELDS = [
    "title", "slug", "description", "featuredImage", "bannerImage",
    "template", "status", "publishDate", "author", "design", "sections",
    "seo", "navigation", "aliases", "redirectHistory", "order"
];

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        if (!data.title || data.title.trim() === "") {
            return NextResponse.json({ error: "Page title is required." }, { status: 400 });
        }

        // Determine and validate slug
        let finalSlug = data.slug ? normalizePageSlug(data.slug) : normalizePageSlug(data.title);
        if (!isValidPageSlug(finalSlug)) {
            return NextResponse.json({
                error: `Invalid URL slug "${finalSlug}". Slugs must contain only lowercase letters, numbers, and hyphens.`
            }, { status: 400 });
        }

        // Validate uniqueness
        const availability = await checkPageSlugAvailability({ slug: finalSlug });
        if (!availability.available) {
            return NextResponse.json({
                error: availability.reason || `URL slug "${finalSlug}" is already in use.`
            }, { status: 409 });
        }

        const sanitizedData = {};
        for (const key of ALLOWED_PAGE_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        sanitizedData.slug = finalSlug;

        const todayStr = getISTDateString();
        if (!sanitizedData.status) {
            if (sanitizedData.publishDate && sanitizedData.publishDate > todayStr) {
                sanitizedData.status = 'scheduled';
            } else {
                sanitizedData.status = 'published';
            }
        }

        // If no sections provided, add default Hero and Text section
        if (!sanitizedData.sections || sanitizedData.sections.length === 0) {
            sanitizedData.sections = [
                {
                    id: "hero-" + Date.now(),
                    type: "hero",
                    order: 0,
                    visible: true,
                    settings: {
                        heading: sanitizedData.title,
                        subheading: "Cinematic Visuals • Dreamline Production",
                        badge: "NEW PAGE",
                        description: sanitizedData.description || "Crafting extraordinary cinematic narratives and visuals across Kolkata and beyond.",
                        buttons: [
                            { label: "EXPLORE SERVICES", url: "/services/", style: "gold" },
                            { label: "GET IN TOUCH", url: "/contact/", style: "outline" }
                        ],
                        backgroundColor: "#050505",
                        alignment: "center",
                        paddingTop: "py-28",
                        paddingBottom: "py-20"
                    }
                }
            ];
        }

        const page = await CustomPage.create(sanitizedData);

        // Sync with navigation menu if requested
        if (page.navigation?.inNavbar) {
            await syncPageNavigation(page, false);
        }

        try {
            revalidatePath("/");
            revalidatePath(`/${finalSlug}/`);
            revalidatePath("/sitemap.xml");
        } catch (e) {}

        return NextResponse.json(page, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, "Page POST");
    }
}
