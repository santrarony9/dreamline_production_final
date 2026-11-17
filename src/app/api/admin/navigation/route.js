import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NavigationItem from '@/models/NavigationItem';
import ServicePage from '@/models/ServicePage';
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

        const [{ rootItems, flatItems }, availablePages] = await Promise.all([
            getAdminNavigationTree(),
            getAvailableWebsitePages()
        ]);

        return NextResponse.json({
            success: true,
            rootItems,
            flatItems,
            availablePages
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

        // 1. Bulk Reorder Handler
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
