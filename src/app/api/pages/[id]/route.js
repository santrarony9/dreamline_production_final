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
import { normalizePageSlug, isValidPageSlug, checkPageSlugAvailability, handlePageSlugChange } from "@/lib/page-redirects";

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

export async function GET(request, { params }) {
    await dbConnect();
    const { id } = await params;

    let page;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
        page = await CustomPage.findById(id).lean();
    } else {
        page = await CustomPage.findOne({ slug: id }).lean();
    }

    if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const data = await request.json();

        let page = await CustomPage.findById(id);
        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        const oldSlug = page.slug;
        let finalSlug = oldSlug;

        // Check if slug is being updated
        if (data.slug && data.slug.trim() !== "") {
            const requestedSlug = normalizePageSlug(data.slug);
            if (!isValidPageSlug(requestedSlug)) {
                return NextResponse.json({
                    error: `Invalid URL slug "${requestedSlug}".`
                }, { status: 400 });
            }

            if (requestedSlug !== oldSlug) {
                const availability = await checkPageSlugAvailability({
                    slug: requestedSlug,
                    excludeId: page._id
                });

                if (!availability.available) {
                    return NextResponse.json({
                        error: availability.reason || `URL slug "${requestedSlug}" is already in use.`
                    }, { status: 409 });
                }

                // Handle slug change: create 301 redirect, update aliases, resolve chains
                await handlePageSlugChange({
                    pageId: page._id,
                    oldSlug: oldSlug,
                    newSlug: requestedSlug
                });

                finalSlug = requestedSlug;
                data.slug = finalSlug;
            }
        }

        const updatedPage = await CustomPage.findByIdAndUpdate(page._id, data, { new: true });

        // Sync with website navigation
        await syncPageNavigation(updatedPage, updatedPage.status !== 'published' || !updatedPage.navigation?.inNavbar);

        try {
            revalidatePath("/");
            revalidatePath(`/${finalSlug}/`);
            if (oldSlug && oldSlug !== finalSlug) {
                revalidatePath(`/${oldSlug}/`);
            }
            revalidatePath("/sitemap.xml");
        } catch (e) {}

        return NextResponse.json(updatedPage);
    } catch (err) {
        return safeErrorResponse(err, "Page PUT");
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const { id } = await params;

        const page = await CustomPage.findByIdAndDelete(id);
        if (page) {
            await syncPageNavigation(page, true);
            try {
                revalidatePath("/");
                revalidatePath(`/${page.slug}/`);
                revalidatePath("/sitemap.xml");
            } catch (e) {}
        }

        return NextResponse.json({ success: true, message: "Page deleted successfully." });
    } catch (err) {
        return safeErrorResponse(err, "Page DELETE");
    }
}
