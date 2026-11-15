export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import ServicePage from "@/models/ServicePage";
import TechProject from "@/models/TechProject";
import MediaAsset from "@/models/MediaAsset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { generateSmartAltText, isAltTextSuboptimal } from "@/lib/alt-text-generator";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        let optimizedCount = 0;
        let skippedApprovedCount = 0;

        // 1. Optimize Journals (Blogs)
        const journals = await Journal.find();
        for (const j of journals) {
            if (j.image) {
                const needsAlt = isAltTextSuboptimal(j.featuredImageAlt);
                if (needsAlt) {
                    const altText = generateSmartAltText({
                        url: j.image,
                        contextTitle: j.title,
                        category: "blog",
                        role: "blog"
                    });

                    j.featuredImageAlt = altText;
                    if (!j.seo) j.seo = {};
                    j.seo.ogImageAlt = altText;
                    await j.save();

                    // Upsert MediaAsset
                    await MediaAsset.findOneAndUpdate(
                        { url: j.image },
                        {
                            url: j.image,
                            alt: altText,
                            title: j.title,
                            category: "blog",
                            aiSuggestedAlt: altText,
                            isManualApproved: false
                        },
                        { upsert: true }
                    );

                    optimizedCount++;
                } else {
                    skippedApprovedCount++;
                }
            }
        }

        // 2. Optimize Weddings
        const weddings = await Wedding.find();
        for (const w of weddings) {
            const wTitle = w.title || w.couple || w.id || "Cinematic Wedding";
            const cover = w.coverImage || w.img;

            if (cover && isAltTextSuboptimal(w.altText)) {
                const altText = generateSmartAltText({
                    url: cover,
                    contextTitle: wTitle,
                    category: "wedding",
                    role: "main"
                });
                w.altText = altText;

                await MediaAsset.findOneAndUpdate(
                    { url: cover },
                    {
                        url: cover,
                        alt: altText,
                        title: wTitle,
                        category: "wedding",
                        aiSuggestedAlt: altText,
                        isManualApproved: false
                    },
                    { upsert: true }
                );
                optimizedCount++;
            }

            // Optimize wedding gallery images
            if (Array.isArray(w.images)) {
                const updatedAlts = [...(w.imageAltTexts || [])];
                let galleryUpdated = false;

                for (let i = 0; i < w.images.length; i++) {
                    const imgUrl = w.images[i];
                    if (isAltTextSuboptimal(updatedAlts[i])) {
                        const altText = generateSmartAltText({
                            url: imgUrl,
                            contextTitle: wTitle,
                            category: "wedding",
                            index: i + 1,
                            role: "gallery"
                        });
                        updatedAlts[i] = altText;
                        galleryUpdated = true;

                        await MediaAsset.findOneAndUpdate(
                            { url: imgUrl },
                            {
                                url: imgUrl,
                                alt: altText,
                                title: `${wTitle} Frame ${i + 1}`,
                                category: "wedding",
                                aiSuggestedAlt: altText,
                                isManualApproved: false
                            },
                            { upsert: true }
                        );
                        optimizedCount++;
                    }
                }

                if (galleryUpdated) {
                    w.imageAltTexts = updatedAlts;
                    await w.save();
                }
            }
        }

        // 3. Optimize Service Pages
        const services = await ServicePage.find();
        for (const s of services) {
            let serviceChanged = false;

            if (s.heroImage && isAltTextSuboptimal(s.heroImageAlt)) {
                const altText = generateSmartAltText({
                    url: s.heroImage,
                    contextTitle: s.title,
                    category: "service",
                    role: "main"
                });
                s.heroImageAlt = altText;
                serviceChanged = true;

                await MediaAsset.findOneAndUpdate(
                    { url: s.heroImage },
                    {
                        url: s.heroImage,
                        alt: altText,
                        title: s.title,
                        category: "service",
                        aiSuggestedAlt: altText,
                        isManualApproved: false
                    },
                    { upsert: true }
                );
                optimizedCount++;
            }

            if (Array.isArray(s.gallery)) {
                for (let i = 0; i < s.gallery.length; i++) {
                    const item = s.gallery[i];
                    if (item.url && isAltTextSuboptimal(item.alt)) {
                        const altText = generateSmartAltText({
                            url: item.url,
                            contextTitle: `${s.title} Showcase`,
                            category: "service",
                            index: i + 1,
                            role: "gallery"
                        });
                        item.alt = altText;
                        serviceChanged = true;

                        await MediaAsset.findOneAndUpdate(
                            { url: item.url },
                            {
                                url: item.url,
                                alt: altText,
                                title: `${s.title} Frame ${i + 1}`,
                                category: "service",
                                aiSuggestedAlt: altText,
                                isManualApproved: false
                            },
                            { upsert: true }
                        );
                        optimizedCount++;
                    }
                }
            }

            if (serviceChanged) {
                await s.save();
            }
        }

        // 4. Optimize Tech Projects
        const techProjects = await TechProject.find();
        for (const t of techProjects) {
            if (t.img && isAltTextSuboptimal(t.imgAlt)) {
                const altText = generateSmartAltText({
                    url: t.img,
                    contextTitle: t.title,
                    category: "tech",
                    role: "main"
                });
                t.imgAlt = altText;
                await t.save();

                await MediaAsset.findOneAndUpdate(
                    { url: t.img },
                    {
                        url: t.img,
                        alt: altText,
                        title: t.title,
                        category: "tech",
                        aiSuggestedAlt: altText,
                        isManualApproved: false
                    },
                    { upsert: true }
                );
                optimizedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            optimizedCount,
            skippedApprovedCount,
            message: `Optimized alt text for ${optimizedCount} images across blogs, weddings, and service pages.`
        });
    } catch (err) {
        return safeErrorResponse(err, "Auto-Optimize Alt Text");
    }
}
