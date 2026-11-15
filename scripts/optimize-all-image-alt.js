const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local if MONGODB_URI not set
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match) process.env.MONGODB_URI = match[1].trim();
    }
  } catch (e) {}
}

const { generateSmartAltText, isAltTextSuboptimal } = require('../src/lib/alt-text-generator');

async function optimizeAllDatabaseImages() {
    console.log("=======================================================");
    console.log("   DREAMLINE PRODUCTION - DATABASE IMAGE ALT OPTIMIZER ");
    console.log("=======================================================\n");

    const uri = process.env.MONGODB_URI || 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.\n");

    const Wedding = require('../src/models/Wedding').default || mongoose.model('Wedding');
    const Journal = require('../src/models/Journal').default || mongoose.model('Journal');
    const ServicePage = require('../src/models/ServicePage').default || mongoose.model('ServicePage');
    const TechProject = require('../src/models/TechProject').default || mongoose.model('TechProject');
    const MediaAsset = require('../src/models/MediaAsset').default || mongoose.model('MediaAsset');

    let totalUpdated = 0;

    // ---------------------------------------------------------
    // 1. JOURNALS / BLOG POSTS
    // ---------------------------------------------------------
    console.log("--- 1. OPTIMIZING BLOG POST IMAGES ---");
    const journals = await Journal.find();
    for (const post of journals) {
        let updated = false;

        // Featured image
        if (post.image) {
            if (isAltTextSuboptimal(post.featuredImageAlt)) {
                const altText = generateSmartAltText({
                    url: post.image,
                    contextTitle: post.title,
                    category: "blog",
                    role: "blog"
                });
                post.featuredImageAlt = altText;
                if (!post.seo) post.seo = {};
                post.seo.ogImageAlt = altText;
                updated = true;
                totalUpdated++;

                await MediaAsset.findOneAndUpdate(
                    { url: post.image },
                    {
                        url: post.image,
                        alt: altText,
                        title: post.title,
                        category: "blog",
                        source: `Blog: ${post.title}`,
                        aiSuggestedAlt: altText,
                        isManualApproved: true
                    },
                    { upsert: true }
                );
                console.log(`  [BLOG] "${post.title.substring(0, 40)}..." -> "${altText}"`);
            }
        }

        // Check embedded images inside content HTML
        if (post.content && post.content.includes('<img')) {
            const originalContent = post.content;
            const updatedContent = originalContent.replace(/<img\b([^>]*)\/?>/gi, (fullTag, props) => {
                const srcMatch = props.match(/\bsrc=["']([^"']+)["']/i);
                const altMatch = props.match(/\balt=["']([^"']*)["']/i);
                const src = srcMatch ? srcMatch[1] : null;
                const currentAlt = altMatch ? altMatch[1] : "";

                if (src && isAltTextSuboptimal(currentAlt)) {
                    const newAlt = generateSmartAltText({
                        url: src,
                        contextTitle: post.title,
                        category: "blog",
                        role: "blog"
                    });
                    totalUpdated++;
                    if (altMatch) {
                        return fullTag.replace(/\balt=["'][^"']*["']/i, `alt="${newAlt}"`);
                    } else {
                        return fullTag.replace(/<img\b/i, `<img alt="${newAlt}" `);
                    }
                }
                return fullTag;
            });

            if (updatedContent !== originalContent) {
                post.content = updatedContent;
                updated = true;
                console.log(`  [BLOG CONTENT IMAGES] Updated embedded HTML image alt attributes for "${post.title}"`);
            }
        }

        if (updated) {
            await post.save();
        }
    }

    // ---------------------------------------------------------
    // 2. WEDDINGS
    // ---------------------------------------------------------
    console.log("\n--- 2. OPTIMIZING WEDDING PORTFOLIO IMAGES ---");
    const weddings = await Wedding.find();
    for (const w of weddings) {
        const wTitle = w.title || w.couple || w.id;
        const cover = w.coverImage || w.img;
        let weddingChanged = false;

        if (cover && isAltTextSuboptimal(w.altText)) {
            const altText = generateSmartAltText({
                url: cover,
                contextTitle: wTitle,
                category: "wedding",
                role: "main"
            });
            w.altText = altText;
            weddingChanged = true;
            totalUpdated++;

            await MediaAsset.findOneAndUpdate(
                { url: cover },
                {
                    url: cover,
                    alt: altText,
                    title: `${wTitle} Cover`,
                    category: "wedding",
                    source: `Wedding: ${wTitle}`,
                    aiSuggestedAlt: altText,
                    isManualApproved: true
                },
                { upsert: true }
            );
            console.log(`  [WEDDING COVER] "${wTitle}" -> "${altText}"`);
        }

        // Gallery images
        if (Array.isArray(w.images) && w.images.length > 0) {
            const updatedAlts = [...(w.imageAltTexts || [])];
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
                    weddingChanged = true;
                    totalUpdated++;

                    await MediaAsset.findOneAndUpdate(
                        { url: imgUrl },
                        {
                            url: imgUrl,
                            alt: altText,
                            title: `${wTitle} Capture ${i + 1}`,
                            category: "wedding",
                            source: `Wedding Gallery: ${wTitle}`,
                            aiSuggestedAlt: altText,
                            isManualApproved: true
                        },
                        { upsert: true }
                    );
                    console.log(`  [WEDDING GALLERY] "${wTitle}" Frame ${i + 1} -> "${altText}"`);
                }
            }
            if (weddingChanged) {
                w.imageAltTexts = updatedAlts;
            }
        }

        if (weddingChanged) {
            await w.save();
        }
    }

    // ---------------------------------------------------------
    // 3. SERVICE PAGES
    // ---------------------------------------------------------
    console.log("\n--- 3. OPTIMIZING SERVICE PAGE IMAGES ---");
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
            totalUpdated++;

            await MediaAsset.findOneAndUpdate(
                { url: s.heroImage },
                {
                    url: s.heroImage,
                    alt: altText,
                    title: `${s.title} Hero`,
                    category: "service",
                    source: `Service: ${s.title}`,
                    aiSuggestedAlt: altText,
                    isManualApproved: true
                },
                { upsert: true }
            );
            console.log(`  [SERVICE HERO] "${s.title}" -> "${altText}"`);
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
                    totalUpdated++;

                    await MediaAsset.findOneAndUpdate(
                        { url: item.url },
                        {
                            url: item.url,
                            alt: altText,
                            title: `${s.title} Gallery ${i + 1}`,
                            category: "service",
                            source: `Service Gallery: ${s.title}`,
                            aiSuggestedAlt: altText,
                            isManualApproved: true
                        },
                        { upsert: true }
                    );
                    console.log(`  [SERVICE GALLERY] "${s.title}" Frame ${i + 1} -> "${altText}"`);
                }
            }
        }

        if (serviceChanged) {
            await s.save();
        }
    }

    // ---------------------------------------------------------
    // 4. TECH PROJECTS
    // ---------------------------------------------------------
    console.log("\n--- 4. OPTIMIZING TECH PROJECT IMAGES ---");
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
            totalUpdated++;

            await MediaAsset.findOneAndUpdate(
                { url: t.img },
                {
                    url: t.img,
                    alt: altText,
                    title: t.title,
                    category: "tech",
                    source: `Tech: ${t.title}`,
                    aiSuggestedAlt: altText,
                    isManualApproved: true
                },
                { upsert: true }
            );
            console.log(`  [TECH PROJECT] "${t.title}" -> "${altText}"`);
        }
    }

    console.log("\n=======================================================");
    console.log(`   TOTAL IMAGES OPTIMIZED AND SYNCHRONIZED: ${totalUpdated}`);
    console.log("=======================================================\n");

    await mongoose.disconnect();
}

optimizeAllDatabaseImages();
