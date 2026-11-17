import dbConnect from "@/lib/mongodb";
import NavigationItem from "@/models/NavigationItem";
import { DEFAULT_NAVIGATION_SEED } from "@/lib/navigation-defaults";
import { revalidatePath } from "next/cache";

/**
 * Seeds the NavigationItem collection with default items if empty.
 */
export async function seedDefaultNavigationIfEmpty() {
    await dbConnect();
    const count = await NavigationItem.countDocuments();
    if (count > 0) return false;

    console.log("[Navigation] Database navigation table is empty. Initializing flagship seed data...");

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

    console.log("[Navigation] Flagship navigation successfully seeded.");
    return true;
}

/**
 * Retrieves the published navigation tree for frontend rendering.
 * Only returns active items, formatted as a tree with children.
 */
export async function getPublishedNavigationTree() {
    await dbConnect();
    await seedDefaultNavigationIfEmpty();

    const items = await NavigationItem.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();

    const serialized = JSON.parse(JSON.stringify(items));

    // Map by id for fast lookups
    const itemMap = new Map();
    serialized.forEach(item => {
        item.id = item._id.toString();
        item.children = [];
        itemMap.set(item.id, item);
    });

    const rootItems = [];

    serialized.forEach(item => {
        if (item.parentId && itemMap.has(item.parentId.toString())) {
            const parent = itemMap.get(item.parentId.toString());
            parent.children.push(item);
        } else {
            rootItems.push(item);
        }
    });

    return rootItems;
}

/**
 * Retrieves all navigation items for the admin interface (including inactive items).
 */
export async function getAdminNavigationTree() {
    await dbConnect();
    await seedDefaultNavigationIfEmpty();

    const items = await NavigationItem.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();

    const serialized = JSON.parse(JSON.stringify(items));

    const itemMap = new Map();
    serialized.forEach(item => {
        item.id = item._id.toString();
        item.children = [];
        itemMap.set(item.id, item);
    });

    const rootItems = [];

    serialized.forEach(item => {
        if (item.parentId && itemMap.has(item.parentId.toString())) {
            const parent = itemMap.get(item.parentId.toString());
            parent.children.push(item);
        } else {
            rootItems.push(item);
        }
    });

    return {
        rootItems,
        flatItems: serialized
    };
}

/**
 * Revalidates the frontend layout cache across all pages
 */
export function revalidateNavigation() {
    try {
        revalidatePath('/', 'layout');
    } catch (e) {
        console.warn("[Navigation] Could not revalidate cache:", e.message);
    }
}
