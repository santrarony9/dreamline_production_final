import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NavigationItem from '@/models/NavigationItem';
import ServicePage from '@/models/ServicePage';
import ServiceCategory from '@/models/ServiceCategory';
import CustomPage from '@/models/CustomPage';
import Journal from '@/models/Journal';
import { getAdminNavigationTree, revalidateNavigation } from '@/lib/navigation-service';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'superadmin')) {
        return false;
    }
    return true;
}

// Helper: Fetch all existing website pages to populate dropdown selector
async function getAvailableWebsitePages() {
    await dbConnect();

    const [services, customPages, journals] = await Promise.all([
        ServicePage.find({}, 'title slug category').lean(),
        CustomPage.find({ status: { $ne: 'archived' } }, 'title slug status').lean(),
        Journal.find({ status: 'published' }, 'title slug category').lean()
    ]);

    const corePages = [
        { title: "Home", url: "/", category: "Core Pages" },
        { title: "About Us", url: "/about/", category: "Core Pages" },
        { title: "Master Portfolio", url: "/portfolio/", category: "Core Pages" },
        { title: "Services Directory", url: "/services/", category: "Core Pages" },
        { title: "Blogs / Journal", url: "/blogs/", category: "Core Pages" },
        { title: "Contact Us", url: "/contact/", category: "Core Pages" },
        { title: "Luxury Wedding Cinema", url: "/luxury", category: "Core Pages" },
        { title: "Commercial Ad Films", url: "/commercial", category: "Core Pages" },
        { title: "Tech & 3D Innovation", url: "/tech", category: "Core Pages" },
        { title: "FAQ", url: "/faq/", category: "Core Pages" }
    ];

    const servicePageLinks = services.map(s => ({
        title: s.title || s.slug,
        url: `/services/${s.slug}/`,
        category: "Service Pages"
    }));

    // Add static services if not in DB
    const staticServices = [
        { title: "Drone Photography Kolkata", url: "/services/drone-photography-kolkata/", category: "Service Pages" },
        { title: "Drone Videography Kolkata", url: "/services/drone-videography-kolkata/", category: "Service Pages" },
        { title: "Wedding Photography Kolkata", url: "/services/wedding-photography-kolkata/", category: "Service Pages" },
        { title: "Pre-Wedding Shoot Kolkata", url: "/services/pre-wedding-shoot-kolkata/", category: "Service Pages" },
        { title: "Rice Ceremony Photography Kolkata", url: "/services/rice-ceremony-photography-kolkata/", category: "Service Pages" },
        { title: "Corporate Photography Kolkata", url: "/services/corporate-photography-kolkata/", category: "Service Pages" },
        { title: "Video Production Agency Kolkata", url: "/services/video-production-agency-kolkata/", category: "Service Pages" }
    ];

    staticServices.forEach(ss => {
        if (!servicePageLinks.some(s => s.url === ss.url)) {
            servicePageLinks.push(ss);
        }
    });

    const customPageLinks = customPages.map(cp => ({
        title: cp.title || cp.slug,
        url: `/${cp.slug}/`,
        category: "Custom Builder Pages"
    }));

    const blogLinks = journals.map(j => ({
        title: j.title || j.slug,
        url: `/blogs/${j.slug}/`,
        category: "Blog Articles"
    }));

    return {
        corePages,
        servicePages: servicePageLinks,
        customPages: customPageLinks,
        blogArticles: blogLinks
    };
}

export async function GET() {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        const [{ rootItems, flatItems }, availablePages, categories] = await Promise.all([
            getAdminNavigationTree(),
            getAvailableWebsitePages(),
            ServiceCategory.find().sort({ order: 1, createdAt: 1 }).lean().catch(() => [])
        ]);

        return NextResponse.json({
            success: true,
            rootItems,
            flatItems,
            availablePages,
            categories
        });
    } catch (error) {
        console.error('[API /api/admin/navigation GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch navigation tree' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        const {
            title,
            url,
            type = 'internal',
            parentId = null,
            order = 0,
            openInNewTab = false,
            isActive = true,
            displayDesktop = true,
            displayMobile = true,
            badge = '',
            description = '',
            group = '',
            subGroup = '',
            icon = '',
            isDropdown = false
        } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Menu title is required.' }, { status: 400 });
        }
        if (!url || !url.trim()) {
            return NextResponse.json({ error: 'Menu URL / Page Link is required.' }, { status: 400 });
        }

        let cleanParentId = parentId;
        if (cleanParentId === "" || cleanParentId === "root" || cleanParentId === "none") {
            cleanParentId = null;
        }

        const newItem = await NavigationItem.create({
            title: title.trim(),
            url: url.trim(),
            type,
            parentId: cleanParentId,
            order: Number(order) || 0,
            openInNewTab: Boolean(openInNewTab),
            isActive: Boolean(isActive),
            displayDesktop: Boolean(displayDesktop),
            displayMobile: Boolean(displayMobile),
            badge: (badge || '').trim(),
            description: (description || '').trim(),
            group: (group || '').trim(),
            subGroup: (subGroup || '').trim(),
            icon: (icon || '').trim(),
            isDropdown: Boolean(isDropdown)
        });

        // If child added to a parent, ensure parent is marked as isDropdown
        if (cleanParentId) {
            await NavigationItem.findByIdAndUpdate(cleanParentId, { isDropdown: true });
        }

        revalidateNavigation();

        return NextResponse.json({
            success: true,
            item: newItem,
            message: `Menu item "${newItem.title}" created successfully.`
        });
    } catch (error) {
        console.error('[API /api/admin/navigation POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create menu item' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // 1. Bulk Services Menu Save Handler
        if (body.action === 'save_services_menu' && Array.isArray(body.categories)) {
            let servicesRoot = await NavigationItem.findOne({ title: "SERVICES", parentId: null });
            if (!servicesRoot) {
                servicesRoot = await NavigationItem.create({
                    title: "SERVICES",
                    url: "/services/",
                    type: "internal",
                    parentId: null,
                    order: 3,
                    openInNewTab: false,
                    isActive: true,
                    displayDesktop: true,
                    displayMobile: true,
                    isDropdown: true,
                    badge: ""
                });
            } else {
                await NavigationItem.findByIdAndUpdate(servicesRoot._id, {
                    isDropdown: true,
                    isActive: true,
                    displayDesktop: true,
                    displayMobile: true,
                    badge: ""
                });
            }

            // Remove existing children of SERVICES
            await NavigationItem.deleteMany({ parentId: servicesRoot._id });

            let overallOrder = 1;
            const newChildren = [];

            for (let cIdx = 0; cIdx < body.categories.length; cIdx++) {
                const cat = body.categories[cIdx];
                const catName = (cat.name || "").trim().toUpperCase();
                if (!catName) continue;
                
                const isCatActive = cat.isActive !== false;
                const isCatPublished = cat.isPublished !== false;
                const showInMegaMenu = cat.showInMegaMenu !== false;
                const catSlug = (cat.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();

                // Persist / update ServiceCategory document
                try {
                    await ServiceCategory.findOneAndUpdate(
                        { name: catName },
                        { 
                            $set: {
                                name: catName,
                                slug: catSlug,
                                description: cat.description || "",
                                image: cat.image || "",
                                order: cIdx + 1,
                                isActive: isCatActive,
                                isPublished: isCatPublished,
                                showInMegaMenu: showInMegaMenu,
                                url: cat.url || "",
                                badge: cat.badge || ""
                            }
                        },
                        { upsert: true, new: true }
                    );
                } catch (catErr) {
                    console.warn(`[API Navigation] Could not sync category ${catName}:`, catErr.message);
                }

                // If category is not in mega menu or inactive/unpublished, items should not appear on public menu
                const categoryVisibleInMega = isCatActive && isCatPublished && showInMegaMenu;

                const items = Array.isArray(cat.items) ? cat.items : [];
                
                if (items.length === 0) {
                    if (categoryVisibleInMega) {
                        newChildren.push({
                            title: "Coming Soon",
                            url: "#",
                            type: "internal",
                            parentId: servicesRoot._id,
                            order: overallOrder++,
                            group: catName,
                            badge: "COMING SOON",
                            description: `Services under ${catName} launching soon.`,
                            openInNewTab: false,
                            isActive: true,
                            displayDesktop: true,
                            displayMobile: true,
                            isDropdown: false
                        });
                    }
                } else {
                    for (const item of items) {
                        newChildren.push({
                            title: (item.title || "").trim(),
                            url: (item.url || "#").trim(),
                            type: item.type || "internal",
                            parentId: servicesRoot._id,
                            order: overallOrder++,
                            group: catName,
                            subGroup: (item.subGroup || "").trim(),
                            icon: (item.icon || "").trim(),
                            badge: (item.badge || "").trim(),
                            description: (item.description || "").trim(),
                            openInNewTab: Boolean(item.openInNewTab),
                            isActive: categoryVisibleInMega ? (item.isActive !== false) : false,
                            displayDesktop: item.displayDesktop !== false,
                            displayMobile: item.displayMobile !== false,
                            isDropdown: false
                        });
                    }
                }
            }

            if (newChildren.length > 0) {
                await NavigationItem.insertMany(newChildren);
            }

            revalidateNavigation();

            return NextResponse.json({
                success: true,
                message: `Services menu successfully updated and published! (${newChildren.length} items across ${body.categories.length} categories)`
            });
        }

        // 2. Bulk Reorder Handler
        if (body.action === 'reorder' && Array.isArray(body.items)) {
            const updates = body.items.map((it, idx) => {
                let cleanParentId = it.parentId;
                if (cleanParentId === "" || cleanParentId === "root" || cleanParentId === "none") {
                    cleanParentId = null;
                }
                return NavigationItem.findByIdAndUpdate(it.id || it._id, {
                    order: idx + 1,
                    parentId: cleanParentId
                });
            });

            await Promise.all(updates);
            revalidateNavigation();

            return NextResponse.json({
                success: true,
                message: 'Navigation order updated successfully.'
            });
        }

        // 2. Single Item Edit Handler
        const {
            id,
            _id,
            title,
            url,
            type,
            parentId,
            order,
            openInNewTab,
            isActive,
            displayDesktop,
            displayMobile,
            badge,
            description,
            group,
            icon,
            isDropdown
        } = body;

        const targetId = id || _id;
        if (!targetId) {
            return NextResponse.json({ error: 'Menu Item ID is required for updating.' }, { status: 400 });
        }

        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Menu title is required.' }, { status: 400 });
        }
        if (!url || !url.trim()) {
            return NextResponse.json({ error: 'Menu URL is required.' }, { status: 400 });
        }

        let cleanParentId = parentId;
        if (cleanParentId === "" || cleanParentId === "root" || cleanParentId === "none" || cleanParentId === targetId) {
            cleanParentId = null;
        }

        // Prevent setting parent to one of its own descendants
        if (cleanParentId) {
            const checkDescendant = async (pid, target) => {
                if (pid.toString() === target.toString()) return true;
                const p = await NavigationItem.findById(pid).lean();
                if (p && p.parentId) return checkDescendant(p.parentId, target);
                return false;
            };
            const isCircular = await checkDescendant(cleanParentId, targetId);
            if (isCircular) {
                return NextResponse.json({ error: 'Cannot set a menu item as a child of its own submenu.' }, { status: 400 });
            }
        }

        const updatedItem = await NavigationItem.findByIdAndUpdate(
            targetId,
            {
                title: title.trim(),
                url: url.trim(),
                type: type || 'internal',
                parentId: cleanParentId,
                order: Number(order) || 0,
                openInNewTab: Boolean(openInNewTab),
                isActive: Boolean(isActive),
                displayDesktop: Boolean(displayDesktop),
                displayMobile: Boolean(displayMobile),
                badge: (badge || '').trim(),
                description: (description || '').trim(),
                group: (group || '').trim(),
                subGroup: (body.subGroup || '').trim(),
                icon: (icon || '').trim(),
                isDropdown: Boolean(isDropdown)
            },
            { returnDocument: 'after' }
        );

        if (!updatedItem) {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }

        // If item now has a parent, ensure parent is marked as isDropdown
        if (cleanParentId) {
            await NavigationItem.findByIdAndUpdate(cleanParentId, { isDropdown: true });
        }

        revalidateNavigation();

        return NextResponse.json({
            success: true,
            item: updatedItem,
            message: `Menu item "${updatedItem.title}" updated successfully.`
        });
    } catch (error) {
        console.error('[API /api/admin/navigation PUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update menu item' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Menu Item ID is required for deletion.' }, { status: 400 });
        }

        const itemToDelete = await NavigationItem.findById(id);
        if (!itemToDelete) {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }

        // Delete the item and cascade delete any submenus attached to it
        await Promise.all([
            NavigationItem.findByIdAndDelete(id),
            NavigationItem.deleteMany({ parentId: id })
        ]);

        // If the item had a parent, check if that parent still has children
        if (itemToDelete.parentId) {
            const remainingChildren = await NavigationItem.countDocuments({ parentId: itemToDelete.parentId });
            if (remainingChildren === 0) {
                await NavigationItem.findByIdAndUpdate(itemToDelete.parentId, { isDropdown: false });
            }
        }

        revalidateNavigation();

        return NextResponse.json({
            success: true,
            deletedId: id,
            message: `Menu item "${itemToDelete.title}" and any attached submenus were deleted.`
        });
    } catch (error) {
        console.error('[API /api/admin/navigation DELETE] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete menu item' }, { status: 500 });
    }
}
