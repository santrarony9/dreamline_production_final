import dbConnect from "./mongodb.js";
import CustomPage from "../models/CustomPage.js";
import PageRedirect from "../models/PageRedirect.js";
import {
    RESERVED_PAGE_ROOTS,
    STATIC_CORE_ROUTES,
    normalizePageSlug,
    isValidPageSlug
} from "./slug-utils.js";

export {
    RESERVED_PAGE_ROOTS,
    STATIC_CORE_ROUTES,
    normalizePageSlug,
    isValidPageSlug
};

/**
 * Check if a page URL slug is available.
 */
export async function checkPageSlugAvailability({ slug, excludeId = null }) {
    await dbConnect();
    const cleanSlug = normalizePageSlug(slug);

    if (!isValidPageSlug(cleanSlug)) {
        const segments = cleanSlug.split('/');
        if (segments.length > 0 && RESERVED_PAGE_ROOTS.has(segments[0])) {
            return {
                available: false,
                slug: cleanSlug,
                reason: `'${segments[0]}' is a protected system root path.`
            };
        }
        return {
            available: false,
            slug: cleanSlug,
            reason: "Slug must contain only lowercase letters, numbers, hyphens, and optional single slashes for nesting (2-200 chars)."
        };
    }

    // Check if another custom page already uses this slug
    const pageQuery = { slug: cleanSlug };
    if (excludeId) {
        pageQuery._id = { $ne: excludeId };
    }
    const existingPage = await CustomPage.findOne(pageQuery).lean();
    if (existingPage) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL already in use by page: "${existingPage.title}"`,
            conflictingPageId: existingPage._id.toString()
        };
    }

    // Check if registered as an alias of another custom page
    const aliasQuery = { aliases: cleanSlug };
    if (excludeId) {
        aliasQuery._id = { $ne: excludeId };
    }
    const aliasPage = await CustomPage.findOne(aliasQuery).lean();
    if (aliasPage) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL is registered as a redirect for "${aliasPage.title}"`
        };
    }

    // Check PageRedirect collection
    const redirectQuery = { fromSlug: cleanSlug };
    if (excludeId) {
        redirectQuery.pageId = { $ne: excludeId };
    }
    const existingRedirect = await PageRedirect.findOne(redirectQuery).lean();
    if (existingRedirect) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL is permanently redirected to /${existingRedirect.toSlug}/`
        };
    }

    return {
        available: true,
        slug: cleanSlug,
        url: `https://dreamlineproduction.com/${cleanSlug}/`
    };
}

/**
 * Handle page slug changes:
 * - Upserts 301 permanent redirect record
 * - Resolves redirect chains (A -> B, B -> C => A -> C)
 * - Prevents redirect loops
 * - Stores previous slug in page.aliases & page.redirectHistory
 */
export async function handlePageSlugChange({ pageId, oldSlug, newSlug }) {
    if (!oldSlug || !newSlug || oldSlug === newSlug) return;
    await dbConnect();

    const cleanOld = normalizePageSlug(oldSlug);
    const cleanNew = normalizePageSlug(newSlug);

    if (!cleanOld || !cleanNew || cleanOld === cleanNew) return;

    // 1. Prevent redirect loop: delete any existing redirect from newSlug -> oldSlug
    await PageRedirect.deleteMany({
        $or: [
            { fromSlug: cleanNew, toSlug: cleanOld },
            { fromSlug: cleanNew }
        ]
    });

    // 2. Avoid redirect chains: if any existing redirects point to cleanOld, update them directly to cleanNew!
    await PageRedirect.updateMany(
        { toSlug: cleanOld },
        { $set: { toSlug: cleanNew } }
    );

    // 3. Upsert 301 redirect
    await PageRedirect.findOneAndUpdate(
        { fromSlug: cleanOld },
        {
            fromSlug: cleanOld,
            toSlug: cleanNew,
            pageId: pageId,
            statusCode: 301
        },
        { upsert: true, new: true }
    );

    // 4. Update CustomPage document
    await CustomPage.findByIdAndUpdate(pageId, {
        $addToSet: { aliases: cleanOld },
        $push: {
            redirectHistory: {
                fromSlug: cleanOld,
                toSlug: cleanNew,
                changedAt: new Date()
            }
        }
    });

    console.log(`[PageRedirect] 301 Permanent Redirect created: /${cleanOld}/ -> /${cleanNew}/ (PageId: ${pageId})`);
}

/**
 * Resolve where a requested slug should route.
 * Follows redirect chains safely (max 5 hops).
 */
export async function resolvePageDestination(requestedSlug) {
    await dbConnect();
    const cleanSlug = normalizePageSlug(requestedSlug);
    if (!cleanSlug) return null;

    // 1. Primary check: Exact match on canonical slug
    const activePage = await CustomPage.findOne({ slug: cleanSlug }).lean();
    if (activePage) {
        return {
            targetSlug: activePage.slug,
            type: 'page',
            isRedirect: false,
            page: activePage
        };
    }

    // 2. Check if slug is an alias of an active page
    const aliasPage = await CustomPage.findOne({ aliases: cleanSlug }).lean();
    if (aliasPage) {
        return {
            targetSlug: aliasPage.slug,
            type: 'redirect',
            isRedirect: true,
            statusCode: 301,
            page: aliasPage
        };
    }

    // 3. Check PageRedirect table with loop guard (max 5 hops)
    let currentFrom = cleanSlug;
    let target = null;
    let hops = 0;
    const visited = new Set([cleanSlug]);

    while (hops < 5) {
        const redirectRecord = await PageRedirect.findOne({ fromSlug: currentFrom }).lean();
        if (!redirectRecord) break;
        target = redirectRecord.toSlug;
        if (visited.has(target)) {
            console.warn(`[PageRedirect] Loop detected for page slug '${cleanSlug}'. Breaking cycle.`);
            break;
        }
        visited.add(target);
        currentFrom = target;
        hops++;
    }

    if (target) {
        const page = await CustomPage.findOne({ slug: target }).lean();
        return {
            targetSlug: target,
            type: 'redirect',
            isRedirect: true,
            statusCode: 301,
            page: page || null
        };
    }

    return null;
}
