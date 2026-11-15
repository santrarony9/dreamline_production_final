import dbConnect from "./mongodb.js";
import Journal from "../models/Journal.js";
import BlogRedirect from "../models/BlogRedirect.js";
import { slugify, isValidSlug, RESERVED_SLUGS } from "./slug-utils.js";

export { slugify, isValidSlug, RESERVED_SLUGS };

/**
 * Check if a URL slug is available for a blog post.
 * Excludes the given blogId if updating an existing blog.
 */
export async function checkSlugAvailability({ slug, excludeId = null }) {
    await dbConnect();
    const cleanSlug = slugify(slug);

    if (!isValidSlug(cleanSlug)) {
        return {
            available: false,
            slug: cleanSlug,
            reason: RESERVED_SLUGS.has(cleanSlug)
                ? `'${cleanSlug}' is a reserved URL path.`
                : "Slug must be 2-120 characters and contain only lowercase letters, numbers, and hyphens."
        };
    }

    // Check if another blog has this as its primary slug or id
    const existingBlogQuery = {
        $or: [{ slug: cleanSlug }, { id: cleanSlug }]
    };
    if (excludeId) {
        existingBlogQuery._id = { $ne: excludeId };
    }
    const existingBlog = await Journal.findOne(existingBlogQuery).lean();
    if (existingBlog) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL already in use by blog: "${existingBlog.title}"`,
            conflictingPostId: existingBlog._id.toString()
        };
    }

    // Check if this slug is an alias of another blog
    const aliasQuery = { aliases: cleanSlug };
    if (excludeId) {
        aliasQuery._id = { $ne: excludeId };
    }
    const aliasBlog = await Journal.findOne(aliasQuery).lean();
    if (aliasBlog) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL is currently reserved as a redirect for "${aliasBlog.title}"`,
            conflictingPostId: aliasBlog._id.toString()
        };
    }

    // Check if registered in BlogRedirect collection pointing to another blog
    const redirectQuery = { fromSlug: cleanSlug };
    if (excludeId) {
        redirectQuery.blogId = { $ne: excludeId };
    }
    const existingRedirect = await BlogRedirect.findOne(redirectQuery).lean();
    if (existingRedirect) {
        return {
            available: false,
            slug: cleanSlug,
            reason: `URL is registered as a permanent redirect to /blogs/${existingRedirect.toSlug}/`
        };
    }

    return {
        available: true,
        slug: cleanSlug,
        url: `https://dreamlineproduction.com/blogs/${cleanSlug}/`
    };
}

/**
 * Handle a blog slug change.
 * - Adds oldSlug to post.aliases and post.redirectHistory
 * - Creates 301 BlogRedirect record
 * - Resolves redirect chains: updates any redirect pointing to oldSlug to point directly to newSlug
 * - Prevents redirect loops: cleans up any existing redirect from newSlug to oldSlug
 */
export async function handleSlugChange({ blogId, oldSlug, newSlug }) {
    if (!oldSlug || !newSlug || oldSlug === newSlug) return;
    await dbConnect();

    const cleanOld = slugify(oldSlug);
    const cleanNew = slugify(newSlug);

    if (!cleanOld || !cleanNew || cleanOld === cleanNew) return;

    // 1. Prevent redirect loops: if there was already a redirect from newSlug -> oldSlug, delete it
    await BlogRedirect.deleteMany({
        $or: [
            { fromSlug: cleanNew, toSlug: cleanOld },
            { fromSlug: cleanNew }
        ]
    });

    // 2. Avoid redirect chains: if any existing redirects point to cleanOld, update them directly to cleanNew!
    // Example: A -> B, now B -> C => update A directly to C!
    await BlogRedirect.updateMany(
        { toSlug: cleanOld },
        { $set: { toSlug: cleanNew } }
    );

    // 3. Create or update the 301 permanent redirect record for oldSlug -> newSlug
    await BlogRedirect.findOneAndUpdate(
        { fromSlug: cleanOld },
        {
            fromSlug: cleanOld,
            toSlug: cleanNew,
            blogId: blogId,
            statusCode: 301
        },
        { upsert: true, new: true }
    );

    // 4. Update the Journal document: add oldSlug to aliases array and append to redirectHistory
    await Journal.findByIdAndUpdate(blogId, {
        $addToSet: { aliases: cleanOld },
        $push: {
            redirectHistory: {
                fromSlug: cleanOld,
                toSlug: cleanNew,
                changedAt: new Date()
            }
        }
    });

    console.log(`[BlogRedirect] 301 Permanent Redirect created: /blogs/${cleanOld}/ -> /blogs/${cleanNew}/ (BlogId: ${blogId})`);
}

/**
 * Resolve where a given slug should route.
 * Follows redirect chains safely (max 5 hops) to return final canonical slug.
 */
export async function resolveBlogDestination(requestedSlug) {
    await dbConnect();
    const cleanSlug = slugify(requestedSlug);
    if (!cleanSlug) return null;

    // 1. First check if it matches an active blog's canonical slug or id
    const activeBlog = await Journal.findOne({
        $or: [{ slug: cleanSlug }, { id: cleanSlug }]
    }).lean();

    if (activeBlog) {
        const canonicalSlug = activeBlog.slug || activeBlog.id;
        // If accessed by non-canonical slug (e.g. legacy id mismatch), indicate redirect
        if (canonicalSlug && canonicalSlug !== cleanSlug) {
            return {
                targetSlug: canonicalSlug,
                isRedirect: true,
                statusCode: 301,
                post: activeBlog
            };
        }
        return {
            targetSlug: canonicalSlug,
            isRedirect: false,
            post: activeBlog
        };
    }

    // 2. Check if it's in a Journal document's aliases
    const aliasBlog = await Journal.findOne({ aliases: cleanSlug }).lean();
    if (aliasBlog) {
        const canonicalSlug = aliasBlog.slug || aliasBlog.id;
        return {
            targetSlug: canonicalSlug,
            isRedirect: true,
            statusCode: 301,
            post: aliasBlog
        };
    }

    // 3. Check BlogRedirect table with cycle protection (max 5 hops)
    let currentFrom = cleanSlug;
    let target = null;
    let hops = 0;
    const visited = new Set([cleanSlug]);

    while (hops < 5) {
        const redirectRecord = await BlogRedirect.findOne({ fromSlug: currentFrom }).lean();
        if (!redirectRecord) break;
        target = redirectRecord.toSlug;
        if (visited.has(target)) {
            // Loop detected! Break and redirect to target
            console.warn(`[BlogRedirect] Loop detected for slug '${cleanSlug}'. Breaking cycle.`);
            break;
        }
        visited.add(target);
        currentFrom = target;
        hops++;
    }

    if (target) {
        const post = await Journal.findOne({
            $or: [{ slug: target }, { id: target }]
        }).lean();

        return {
            targetSlug: target,
            isRedirect: true,
            statusCode: 301,
            post: post || null
        };
    }

    return null;
}
