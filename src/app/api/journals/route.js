export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { slugify, isValidSlug, checkSlugAvailability, handleSlugChange } from "@/lib/blog-redirects";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800";
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamlineproduction.com";

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function getISTDateString() {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

export async function GET(request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const todayStr = getISTDateString();

    let query = {};

    if (!session) {
        // Public users ONLY see published posts scheduled for today or earlier
        query = {
            $and: [
                {
                    $or: [
                        { status: 'published' },
                        { status: { $exists: false } },
                        { status: null }
                    ]
                },
                {
                    $or: [
                        { date: { $lte: todayStr } },
                        { date: null },
                        { date: "" },
                        { date: { $exists: false } }
                    ]
                }
            ]
        };
    } else if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'draft') {
            query = { status: 'draft' };
        } else if (statusFilter === 'scheduled') {
            query = {
                $or: [
                    { status: 'scheduled' },
                    { date: { $gt: todayStr }, status: { $ne: 'draft' } }
                ]
            };
        } else if (statusFilter === 'published') {
            query = {
                status: 'published',
                date: { $lte: todayStr }
            };
        }
    }

    const journals = await Journal.find(query).sort({ date: -1, createdAt: -1 }).lean();
    return NextResponse.json(journals);
}

const ALLOWED_JOURNAL_FIELDS = [
    "id", "slug", "title", "subtitle", "date", "status", "category", "tags",
    "image", "featuredImageAlt", "content", "excerpt", "author", "seo",
    "cta", "relatedPosts", "featured", "order", "aliases", "redirectHistory",
    "googleBusinessSync", "lastSyncedAt"
];

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        const sanitizedData = {};
        for (const key of ALLOWED_JOURNAL_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        if (!sanitizedData.title || sanitizedData.title.trim() === "") {
            return NextResponse.json({ error: "Blog title is required." }, { status: 400 });
        }

        // Determine and validate slug
        let finalSlug = sanitizedData.slug ? slugify(sanitizedData.slug) : slugify(sanitizedData.title);
        if (!isValidSlug(finalSlug)) {
            return NextResponse.json({
                error: `Invalid URL slug "${finalSlug}". Slugs must contain only lowercase letters, numbers, and hyphens.`
            }, { status: 400 });
        }

        // Validate uniqueness
        const availability = await checkSlugAvailability({ slug: finalSlug });
        if (!availability.available) {
            return NextResponse.json({
                error: availability.reason || `URL slug "${finalSlug}" is already in use.`
            }, { status: 409 });
        }

        sanitizedData.slug = finalSlug;
        sanitizedData.id = finalSlug; // Backward compatibility

        // Default publication status if missing
        const todayStr = getISTDateString();
        if (!sanitizedData.status) {
            if (sanitizedData.date && sanitizedData.date > todayStr) {
                sanitizedData.status = 'scheduled';
            } else {
                sanitizedData.status = 'published';
            }
        }

        const post = await Journal.create(sanitizedData);

        // Automation Trigger: Send to Google Business Profile via Webhook
        if (process.env.AUTOMATION_WEBHOOK_URL && post.status === 'published') {
            try {
                const imageUrl = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
                const publicUrl = `${PRODUCTION_URL}/blogs/${finalSlug}/`;
                const summaryText = stripHtml(post.excerpt || post.content).substring(0, 1500) || post.title;
                const excerptText = post.excerpt || stripHtml(post.content).substring(0, 300) || post.title;

                await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'JOURNAL_POST',
                        action: 'CREATE',
                        post: {
                            _id: post._id,
                            id: finalSlug,
                            slug: finalSlug,
                            title: post.title,
                            date: post.date || todayStr,
                            category: post.category || "Insight",
                            image: imageUrl,
                            summary: summaryText,
                            publicUrl: publicUrl,
                            excerpt: excerptText,
                            seo: post.seo || { title: "", description: "", keywords: "" }
                        }
                    })
                });
            } catch (e) {
                console.error("Automation Trigger Failed:", e.message);
            }
        }

        try {
            revalidatePath("/");
            revalidatePath("/blogs");
            revalidatePath(`/blogs/${finalSlug}/`);
            revalidatePath("/sitemap.xml");
        } catch (e) {}

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, "Journal POST");
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        const targetId = data._id || data.id;
        if (!targetId || !/^[0-9a-fA-F]{24}$/.test(targetId)) {
            return NextResponse.json({ error: "Invalid journal ID format" }, { status: 400 });
        }

        const existingPost = await Journal.findById(targetId);
        if (!existingPost) {
            return NextResponse.json({ error: "Journal post not found" }, { status: 404 });
        }

        const sanitizedData = {};
        for (const key of ALLOWED_JOURNAL_FIELDS) {
            if (data[key] !== undefined) sanitizedData[key] = data[key];
        }

        const oldSlug = existingPost.slug || existingPost.id;
        let finalSlug = oldSlug;

        // Check if slug is being updated
        if (sanitizedData.slug && sanitizedData.slug.trim() !== "") {
            const requestedSlug = slugify(sanitizedData.slug);
            if (!isValidSlug(requestedSlug)) {
                return NextResponse.json({
                    error: `Invalid URL slug "${requestedSlug}". Slugs must contain only lowercase letters, numbers, and hyphens.`
                }, { status: 400 });
            }

            if (requestedSlug !== oldSlug) {
                // Check if new slug is available
                const availability = await checkSlugAvailability({
                    slug: requestedSlug,
                    excludeId: existingPost._id
                });

                if (!availability.available) {
                    return NextResponse.json({
                        error: availability.reason || `URL slug "${requestedSlug}" is already taken.`
                    }, { status: 409 });
                }

                // Handle slug change: create 301 redirect, update aliases, resolve chains & prevent loops
                await handleSlugChange({
                    blogId: existingPost._id,
                    oldSlug: oldSlug,
                    newSlug: requestedSlug
                });

                finalSlug = requestedSlug;
                sanitizedData.slug = finalSlug;
                sanitizedData.id = finalSlug;
            }
        }

        // Auto-update status if scheduled date is changed
        const todayStr = getISTDateString();
        if (sanitizedData.status === 'scheduled' && sanitizedData.date && sanitizedData.date <= todayStr) {
            sanitizedData.status = 'published';
        }

        const updatedPost = await Journal.findByIdAndUpdate(targetId, sanitizedData, { new: true });

        // Automation Trigger: Update
        if (process.env.AUTOMATION_WEBHOOK_URL && updatedPost.status === 'published') {
            try {
                const imageUrl = (updatedPost.image && updatedPost.image.startsWith('http')) ? updatedPost.image : FALLBACK_IMAGE;
                const publicUrl = `${PRODUCTION_URL}/blogs/${finalSlug}/`;
                const summaryText = stripHtml(updatedPost.excerpt || updatedPost.content).substring(0, 1500) || updatedPost.title;
                const excerptText = updatedPost.excerpt || stripHtml(updatedPost.content).substring(0, 300) || updatedPost.title;

                await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'JOURNAL_POST',
                        action: 'UPDATE',
                        post: {
                            _id: updatedPost._id,
                            id: finalSlug,
                            slug: finalSlug,
                            title: updatedPost.title,
                            date: updatedPost.date || todayStr,
                            category: updatedPost.category || "Insight",
                            image: imageUrl,
                            summary: summaryText,
                            publicUrl: publicUrl,
                            excerpt: excerptText,
                            seo: updatedPost.seo || { title: "", description: "", keywords: "" }
                        }
                    })
                });
            } catch (e) {
                console.error("Automation Trigger Failed:", e.message);
            }
        }

        try {
            revalidatePath("/");
            revalidatePath("/blogs");
            revalidatePath(`/blogs/${finalSlug}/`);
            if (oldSlug && oldSlug !== finalSlug) {
                revalidatePath(`/blogs/${oldSlug}/`);
            }
            revalidatePath("/sitemap.xml");
        } catch (e) {}

        return NextResponse.json(updatedPost);
    } catch (err) {
        return safeErrorResponse(err, "Journal PUT");
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return NextResponse.json({ error: "Invalid journal ID format" }, { status: 400 });
        }

        await dbConnect();
        const post = await Journal.findByIdAndDelete(id);

        try {
            revalidatePath("/");
            revalidatePath("/blogs");
            if (post?.slug) revalidatePath(`/blogs/${post.slug}/`);
            revalidatePath("/sitemap.xml");
        } catch (e) {}

        return NextResponse.json({ success: true, message: "Blog post deleted successfully." });
    } catch (err) {
        return safeErrorResponse(err, "Journal DELETE");
    }
}
