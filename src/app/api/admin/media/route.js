export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import Content from "@/models/Content";
import TechProject from "@/models/TechProject";
import ServicePage from "@/models/ServicePage";
import CustomPage from "@/models/CustomPage";
import MediaAsset from "@/models/MediaAsset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { generateSmartAltText, isAltTextSuboptimal } from "@/lib/alt-text-generator";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format"); // 'urls' or default 'details'
        const filter = searchParams.get("filter"); // 'all', 'missing', 'approved'
        const categoryFilter = searchParams.get("category");
        const searchQuery = searchParams.get("search");

        // Fetch all potential image sources
        const [weddings, journals, content, techProjects, services, customPages, savedAssets] = await Promise.all([
            Wedding.find().lean(),
            Journal.find().lean(),
            Content.findOne().lean(),
            TechProject.find().lean(),
            ServicePage.find().lean(),
            CustomPage.find().lean(),
            MediaAsset.find().lean()
        ]);

        const assetsMap = new Map();

        // Populate already saved assets
        savedAssets.forEach(asset => {
            if (asset.url) {
                assetsMap.set(asset.url, {
                    ...asset,
                    usedIn: asset.usedIn || []
                });
            }
        });

        // Helper to register or update an image reference
        const trackImage = (url, usage) => {
            if (!url || typeof url !== 'string' || !url.startsWith('http') && !url.startsWith('/')) return;
            // Exclude icons or favicons
            if (url.includes('favicon') || url.endsWith('.ico')) return;

            let asset = assetsMap.get(url);
            if (!asset) {
                const suggested = generateSmartAltText({
                    url,
                    contextTitle: usage.contextTitle || "",
                    category: usage.category || "general",
                    role: usage.role || "main"
                });

                asset = {
                    url,
                    alt: usage.alt || "",
                    title: usage.contextTitle || "",
                    caption: "",
                    category: usage.category || "general",
                    source: usage.source || "",
                    aiSuggestedAlt: suggested,
                    isManualApproved: Boolean(usage.alt && !isAltTextSuboptimal(usage.alt)),
                    usedIn: []
                };
                assetsMap.set(url, asset);
            }

            // Sync alt if document has one and asset has none
            if (!asset.alt && usage.alt) {
                asset.alt = usage.alt;
                if (!isAltTextSuboptimal(usage.alt)) {
                    asset.isManualApproved = true;
                }
            }

            // Append usage if not already recorded
            const usageExists = asset.usedIn.some(u => 
                u.model === usage.model && 
                u.documentId === usage.documentId && 
                u.field === usage.field
            );
            if (!usageExists) {
                asset.usedIn.push({
                    model: usage.model,
                    documentId: usage.documentId,
                    field: usage.field,
                    contextTitle: usage.contextTitle
                });
            }
        };

        // 1. Weddings
        weddings.forEach(w => {
            const wTitle = w.title || w.couple || w.id || "Wedding Story";
            if (w.coverImage) trackImage(w.coverImage, { model: 'Wedding', documentId: String(w._id), field: 'coverImage', contextTitle: wTitle, category: 'wedding', alt: w.altText });
            if (w.img && w.img !== w.coverImage) trackImage(w.img, { model: 'Wedding', documentId: String(w._id), field: 'img', contextTitle: wTitle, category: 'wedding', alt: w.altText });
            if (Array.isArray(w.images)) {
                w.images.forEach((imgUrl, i) => {
                    const alt = w.imageAltTexts?.[i] || "";
                    trackImage(imgUrl, { model: 'Wedding', documentId: String(w._id), field: `images[${i}]`, contextTitle: wTitle, category: 'wedding', alt, role: 'gallery' });
                });
            }
        });

        // 2. Journals (Blogs)
        journals.forEach(j => {
            if (j.image) {
                trackImage(j.image, {
                    model: 'Journal',
                    documentId: String(j._id),
                    field: 'image',
                    contextTitle: j.title,
                    category: 'blog',
                    alt: j.featuredImageAlt || j.seo?.ogImageAlt || ""
                });
            }
        });

        // 3. Tech Projects
        techProjects.forEach(t => {
            if (t.img) {
                trackImage(t.img, {
                    model: 'TechProject',
                    documentId: String(t._id),
                    field: 'img',
                    contextTitle: t.title,
                    category: 'tech',
                    alt: t.imgAlt || ""
                });
            }
        });

        // 4. Service Pages
        services.forEach(s => {
            if (s.heroImage) {
                trackImage(s.heroImage, {
                    model: 'ServicePage',
                    documentId: String(s._id),
                    field: 'heroImage',
                    contextTitle: s.title,
                    category: 'service',
                    alt: s.heroImageAlt || ""
                });
            }
            if (Array.isArray(s.gallery)) {
                s.gallery.forEach((gItem, i) => {
                    if (gItem.url) {
                        trackImage(gItem.url, {
                            model: 'ServicePage',
                            documentId: String(s._id),
                            field: `gallery[${i}]`,
                            contextTitle: `${s.title} Gallery`,
                            category: 'service',
                            alt: gItem.alt || gItem.caption || ""
                        });
                    }
                });
            }
        });

        // 5. Custom Pages
        customPages.forEach(p => {
            if (p.featuredImage) {
                trackImage(p.featuredImage, {
                    model: 'CustomPage',
                    documentId: String(p._id),
                    field: 'featuredImage',
                    contextTitle: p.title,
                    category: 'general',
                    alt: p.seo?.ogImageAlt || ""
                });
            }
            if (p.bannerImage && p.bannerImage !== p.featuredImage) {
                trackImage(p.bannerImage, {
                    model: 'CustomPage',
                    documentId: String(p._id),
                    field: 'bannerImage',
                    contextTitle: p.title,
                    category: 'general',
                    alt: ""
                });
            }
            if (Array.isArray(p.sections)) {
                p.sections.forEach(sec => {
                    if (Array.isArray(sec.settings?.images)) {
                        sec.settings.images.forEach((img, i) => {
                            if (img.url) {
                                trackImage(img.url, {
                                    model: 'CustomPage',
                                    documentId: String(p._id),
                                    field: `sections.${sec.id}.images[${i}]`,
                                    contextTitle: p.title,
                                    category: 'general',
                                    alt: img.alt || ""
                                });
                            }
                        });
                    }
                });
            }
        });

        // 6. Global & Home Content
        if (content) {
            if (content.home?.hero?.backgroundImage) trackImage(content.home.hero.backgroundImage, { model: 'Content', field: 'home.hero.backgroundImage', contextTitle: 'Home Hero', category: 'home', alt: "Dreamline Production cinematic studio Kolkata" });
            if (content.home?.expertise?.image) trackImage(content.home.expertise.image, { model: 'Content', field: 'home.expertise.image', contextTitle: 'Home Expertise', category: 'home', alt: "Luxury Bengali wedding cinematography by Dreamline Production Kolkata" });
            if (content.about?.founder?.image) trackImage(content.about.founder.image, { model: 'Content', field: 'about.founder.image', contextTitle: 'Founder Rony Santra', category: 'about', role: 'founder', alt: "Rony Santra founder Dreamline Production Kolkata" });
            if (content.about?.bts?.videoImage) trackImage(content.about.bts.videoImage, { model: 'Content', field: 'about.bts.videoImage', contextTitle: 'About Behind The Scenes', category: 'about', alt: "Behind the scenes at Dreamline Production studio Kolkata" });
            if (content.luxury?.testimonial?.image) trackImage(content.luxury.testimonial.image, { model: 'Content', field: 'luxury.testimonial.image', contextTitle: 'Luxury Testimonial', category: 'luxury', alt: "Luxury wedding client testimonial Dreamline Production" });
        }

        // Return simple string URLs if explicitly requested by legacy calls
        if (format === 'urls') {
            const urls = Array.from(assetsMap.keys()).sort((a, b) => {
                const getTimestamp = (url) => {
                    const fileName = url.split('/').pop();
                    const match = fileName.match(/^(\d+)-/);
                    return match ? parseInt(match[1]) : 0;
                };
                return getTimestamp(b) - getTimestamp(a);
            });
            return NextResponse.json(urls);
        }

        // Convert map to array with computed missingAlt status
        let results = Array.from(assetsMap.values()).map(asset => {
            const isMissing = isAltTextSuboptimal(asset.alt);
            return {
                ...asset,
                isMissingAlt: isMissing,
                effectiveAlt: asset.alt || asset.aiSuggestedAlt || ""
            };
        });

        // Apply filters
        if (filter === 'missing') {
            results = results.filter(a => a.isMissingAlt);
        } else if (filter === 'approved') {
            results = results.filter(a => a.isManualApproved && !a.isMissingAlt);
        }

        if (categoryFilter && categoryFilter !== 'all') {
            results = results.filter(a => a.category === categoryFilter);
        }

        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(a => 
                a.url.toLowerCase().includes(q) ||
                (a.alt || "").toLowerCase().includes(q) ||
                (a.title || "").toLowerCase().includes(q) ||
                (a.aiSuggestedAlt || "").toLowerCase().includes(q)
            );
        }

        // Sort: Missing alt first, then newest
        results.sort((a, b) => {
            if (a.isMissingAlt && !b.isMissingAlt) return -1;
            if (!a.isMissingAlt && b.isMissingAlt) return 1;
            return 0;
        });

        return NextResponse.json(results);
    } catch (err) {
        return safeErrorResponse(err, "Media GET");
    }
}

/**
 * PUT: Update Alt Text for an image and sync to source documents
 */
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        const { url, alt, title, caption, category } = data;

        if (!url) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        const trimmedAlt = (alt || "").trim();

        // 1. Upsert MediaAsset record
        const updatedAsset = await MediaAsset.findOneAndUpdate(
            { url },
            {
                url,
                alt: trimmedAlt,
                title: title !== undefined ? title : undefined,
                caption: caption !== undefined ? caption : undefined,
                category: category || undefined,
                isManualApproved: Boolean(trimmedAlt)
            },
            { upsert: true, returnDocument: 'after' }
        );

        // 2. Synchronize alt text to source collections in MongoDB
        if (trimmedAlt) {
            // Update Journal if used as featured image
            await Journal.updateMany(
                { image: url },
                { $set: { featuredImageAlt: trimmedAlt, "seo.ogImageAlt": trimmedAlt } }
            );

            // Update Wedding if used as cover image
            await Wedding.updateMany(
                { $or: [{ coverImage: url }, { img: url }] },
                { $set: { altText: trimmedAlt } }
            );

            // Update ServicePage if used as heroImage
            await ServicePage.updateMany(
                { heroImage: url },
                { $set: { heroImageAlt: trimmedAlt } }
            );

            // Update ServicePage gallery items
            await ServicePage.updateMany(
                { "gallery.url": url },
                { $set: { "gallery.$[elem].alt": trimmedAlt } },
                { arrayFilters: [{ "elem.url": url }] }
            );

            // Update TechProject if used
            await TechProject.updateMany(
                { img: url },
                { $set: { imgAlt: trimmedAlt } }
            );

            // Update CustomPage featured/banner image
            await CustomPage.updateMany(
                { $or: [{ featuredImage: url }, { bannerImage: url }] },
                { $set: { "seo.ogImageAlt": trimmedAlt } }
            );
        }

        return NextResponse.json({
            success: true,
            asset: updatedAsset,
            message: "Alt text saved and synchronized across database."
        });
    } catch (err) {
        return safeErrorResponse(err, "Media PUT");
    }
}

/**
 * POST: Register a newly uploaded image asset with initial alt text
 */
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();
        const { url, alt, title, category, source } = data;

        if (!url) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        const suggested = generateSmartAltText({
            url,
            contextTitle: title || "",
            category: category || "general"
        });

        const asset = await MediaAsset.findOneAndUpdate(
            { url },
            {
                url,
                alt: (alt || "").trim(),
                title: (title || "").trim(),
                category: category || "general",
                source: source || "",
                aiSuggestedAlt: suggested,
                isManualApproved: Boolean(alt && !isAltTextSuboptimal(alt))
            },
            { upsert: true, returnDocument: 'after' }
        );

        return NextResponse.json({ success: true, asset });
    } catch (err) {
        return safeErrorResponse(err, "Media POST");
    }
}

const scrubObject = (obj, targetUrl) => {
    let modified = false;
    if (Array.isArray(obj)) {
        for (let i = obj.length - 1; i >= 0; i--) {
            if (obj[i] === targetUrl) {
                obj.splice(i, 1);
                modified = true;
            } else if (typeof obj[i] === 'object' && obj[i] !== null) {
                if (scrubObject(obj[i], targetUrl)) modified = true;
            }
        }
    } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (obj[key] === targetUrl) {
                obj[key] = '';
                modified = true;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (scrubObject(obj[key], targetUrl)) modified = true;
            }
        }
    }
    return modified;
};

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { url } = await request.json();
        if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

        await dbConnect();

        // Remove from MediaAsset
        await MediaAsset.deleteOne({ url });

        // Scrub Content
        let content = await Content.findOne();
        if (content) {
            const contentObj = content.toObject();
            if (scrubObject(contentObj, url)) {
                await Content.updateOne({ _id: content._id }, contentObj);
            }
        }

        // Scrub Weddings
        const weddings = await Wedding.find();
        for (let w of weddings) {
            const wObj = w.toObject();
            if (scrubObject(wObj, url)) {
                await Wedding.updateOne({ _id: w._id }, wObj);
            }
        }

        // Scrub Journals
        const journals = await Journal.find();
        for (let j of journals) {
            const jObj = j.toObject();
            if (scrubObject(jObj, url)) {
                await Journal.updateOne({ _id: j._id }, jObj);
            }
        }

        // Scrub TechProjects
        const techProjects = await TechProject.find();
        for (let t of techProjects) {
            const tObj = t.toObject();
            if (scrubObject(tObj, url)) {
                await TechProject.updateOne({ _id: t._id }, tObj);
            }
        }

        // Scrub ServicePages
        const servicePages = await ServicePage.find();
        for (let s of servicePages) {
            const sObj = s.toObject();
            if (scrubObject(sObj, url)) {
                await ServicePage.updateOne({ _id: s._id }, sObj);
            }
        }

        return NextResponse.json({ success: true, message: "Asset removed from database references." });
    } catch (err) {
        return safeErrorResponse(err, "Delete Media");
    }
}
