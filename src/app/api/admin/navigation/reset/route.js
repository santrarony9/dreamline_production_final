import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NavigationItem from '@/models/NavigationItem';
import { DEFAULT_NAVIGATION_SEED } from '@/lib/navigation-defaults';
import { revalidateNavigation } from '@/lib/navigation-service';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        await dbConnect();
        
        // Remove all current items
        await NavigationItem.deleteMany({});

        // Re-seed with flagship defaults
        for (const root of DEFAULT_NAVIGATION_SEED) {
            const rootDoc = await NavigationItem.create({
                title: root.title,
                url: root.url,
                type: root.type || "internal",
                order: root.order,
                openInNewTab: root.openInNewTab || false,
                isActive: root.isActive !== false,
                displayDesktop: root.displayDesktop !== false,
                displayMobile: root.displayMobile !== false,
                isDropdown: root.isDropdown || (root.children && root.children.length > 0),
                badge: root.badge || ""
            });

            if (Array.isArray(root.children) && root.children.length > 0) {
                for (const child of root.children) {
                    await NavigationItem.create({
                        title: child.title,
                        url: child.url,
                        type: child.type || "internal",
                        parentId: rootDoc._id,
                        order: child.order,
                        group: child.group || "",
                        icon: child.icon || "",
                        badge: child.badge || "",
                        description: child.description || "",
                        openInNewTab: child.openInNewTab || false,
                        isActive: child.isActive !== false,
                        displayDesktop: child.displayDesktop !== false,
                        displayMobile: child.displayMobile !== false
                    });
                }
            }
        }

        revalidateNavigation();

        return NextResponse.json({
            success: true,
            message: 'Navigation reset to default flagship structure successfully.'
        });
    } catch (error) {
        console.error('[API /api/admin/navigation/reset POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to reset navigation' }, { status: 500 });
    }
}
