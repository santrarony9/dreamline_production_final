const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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

const SRC_DIR = path.resolve(__dirname, '../src');

function getAllFiles(dir, exts = ['.js', '.jsx', '.tsx']) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== '.next') {
                files = files.concat(getAllFiles(fullPath, exts));
            }
        } else if (exts.includes(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }
    return files;
}

function auditCodebaseImages() {
    const files = getAllFiles(SRC_DIR);
    console.log(`Found ${files.length} code files in src/ to inspect.\n`);

    const imageOccurrences = [];

    // Regex for <Image and <img tags
    const imgRegex = /<(Image|img)\b([^>]*)\/?>/gs;

    for (const file of files) {
        const relPath = path.relative(path.resolve(__dirname, '..'), file);
        const content = fs.readFileSync(file, 'utf8');

        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            const tagType = match[1];
            const propsString = match[2];

            // Extract src
            const srcMatch = propsString.match(/\bsrc=(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')/);
            const src = srcMatch ? (srcMatch[1] || srcMatch[2] || srcMatch[3]) : 'MISSING_SRC';

            // Extract alt
            const altMatch = propsString.match(/\balt=(?:\{([^}]+)\}|"([^"]*)"|'([^']*)')/);
            let alt = null;
            let altType = 'missing';

            if (altMatch) {
                if (altMatch[1] !== undefined) {
                    alt = `{${altMatch[1]}}`;
                    altType = 'dynamic';
                } else if (altMatch[2] !== undefined) {
                    alt = altMatch[2];
                    altType = alt === '' ? 'empty' : 'static';
                } else if (altMatch[3] !== undefined) {
                    alt = altMatch[3];
                    altType = alt === '' ? 'empty' : 'static';
                }
            }

            imageOccurrences.push({
                file: relPath,
                tagType,
                src,
                alt,
                altType
            });
        }
    }

    console.log(`--- CODEBASE IMAGE TAG AUDIT (${imageOccurrences.length} total occurrences) ---`);
    let missingCount = 0;
    let emptyCount = 0;
    let staticCount = 0;
    let dynamicCount = 0;
    let genericCount = 0;

    const genericTerms = ['image', 'photo', 'img', 'media', 'banner', 'thumbnail', 'gallery image', 'picture'];

    for (const item of imageOccurrences) {
        if (item.altType === 'missing') {
            missingCount++;
            console.log(`[MISSING ALT] ${item.file} -> <${item.tagType} src="${item.src}">`);
        } else if (item.altType === 'empty') {
            emptyCount++;
        } else if (item.altType === 'static') {
            staticCount++;
            const cleanAlt = item.alt.toLowerCase().trim();
            if (genericTerms.includes(cleanAlt) || cleanAlt.startsWith('img_') || cleanAlt.startsWith('image_')) {
                genericCount++;
                console.log(`[GENERIC ALT] ${item.file} -> alt="${item.alt}" (src: ${item.src})`);
            }
        } else if (item.altType === 'dynamic') {
            dynamicCount++;
            // Check if dynamic alt is something like {item.alt || "image"}
            if (item.alt.includes('"image"') || item.alt.includes("'image'") || item.alt.includes('"photo"') || item.alt.includes("'photo'")) {
                genericCount++;
                console.log(`[GENERIC FALLBACK IN DYNAMIC ALT] ${item.file} -> alt=${item.alt}`);
            }
        }
    }

    console.log(`\nSummary:`);
    console.log(`  Missing alt attributes: ${missingCount}`);
    console.log(`  Empty alt="" (decorative): ${emptyCount}`);
    console.log(`  Static alt texts: ${staticCount}`);
    console.log(`  Dynamic alt expressions: ${dynamicCount}`);
    console.log(`  Generic / weak alt texts: ${genericCount}`);

    return imageOccurrences;
}

async function auditDatabaseImages() {
    console.log('\n--- DATABASE IMAGE ASSETS AUDIT ---');
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const Wedding = require('../src/models/Wedding').default || mongoose.model('Wedding');
        const Journal = require('../src/models/Journal').default || mongoose.model('Journal');
        const Content = require('../src/models/Content').default || mongoose.model('Content');
        const TechProject = require('../src/models/TechProject').default || mongoose.model('TechProject');
        const ServicePage = require('../src/models/ServicePage').default || mongoose.model('ServicePage');
        const CustomPage = require('../src/models/CustomPage').default || mongoose.model('CustomPage');

        const [weddings, journals, content, tech, services, customPages] = await Promise.all([
            Wedding.find().lean(),
            Journal.find().lean(),
            Content.findOne().lean(),
            TechProject.find().lean(),
            ServicePage.find().lean(),
            CustomPage.find().lean()
        ]);

        console.log(`\nCollections:`);
        console.log(`- Weddings: ${weddings.length} documents`);
        console.log(`- Journals/Blogs: ${journals.length} documents`);
        console.log(`- Tech Projects: ${tech.length} documents`);
        console.log(`- Service Pages: ${services.length} documents`);
        console.log(`- Custom Pages: ${customPages.length} documents`);

        // Check journal images
        console.log('\nChecking Journal/Blog images:');
        let journalMissingAlt = 0;
        let journalTotalImg = 0;
        journals.forEach(j => {
            if (j.image) {
                journalTotalImg++;
                const alt = j.featuredImageAlt || j.imageAlt;
                if (!alt) {
                    journalMissingAlt++;
                    console.log(`  [MISSING] Journal "${j.title}" (slug: ${j.slug || j.id}) missing featuredImageAlt. Image: ${j.image}`);
                } else {
                    console.log(`  [OK] Journal "${j.title}": featuredImageAlt = "${alt}"`);
                }
            }
        });
        console.log(`Journal images missing alt in DB: ${journalMissingAlt} of ${journalTotalImg}`);

        // Check Weddings images
        console.log('\nChecking Wedding images:');
        let weddingMissingAlt = 0;
        let weddingTotalImg = 0;
        weddings.forEach(w => {
            const wTitle = w.title || w.couple || w.id;
            if (w.coverImage || w.img) {
                weddingTotalImg++;
                if (!w.altText) {
                    weddingMissingAlt++;
                    console.log(`  [MISSING] Wedding "${wTitle}" missing altText`);
                } else {
                    console.log(`  [OK] Wedding "${wTitle}" cover altText = "${w.altText}"`);
                }
            }
            (w.images || []).forEach((img, idx) => {
                weddingTotalImg++;
                const alt = (w.imageAltTexts && w.imageAltTexts[idx]) || (typeof img === 'object' ? img.alt : null);
                if (!alt) {
                    weddingMissingAlt++;
                    console.log(`  [MISSING] Wedding "${wTitle}" frame ${idx + 1} missing alt`);
                } else {
                    console.log(`  [OK] Wedding "${wTitle}" frame ${idx + 1} alt = "${alt}"`);
                }
            });
            console.log(`  [INFO] Wedding "${wTitle}": coverImage=${!!(w.coverImage || w.img)}, images=${w.images?.length || 0}`);
        });
        console.log(`Wedding images missing alt in DB: ${weddingMissingAlt} of ${weddingTotalImg}`);

        // Check Service page images
        console.log('\nChecking Service Page images:');
        let serviceMissingAlt = 0;
        let serviceTotalImg = 0;
        services.forEach(s => {
            if (s.heroImage) {
                serviceTotalImg++;
                if (!s.heroImageAlt) {
                    serviceMissingAlt++;
                    console.log(`  [MISSING] Service "${s.title}" missing heroImageAlt`);
                }
            }
            (s.gallery || []).forEach((g, idx) => {
                serviceTotalImg++;
                if (!g.alt) {
                    serviceMissingAlt++;
                    console.log(`  [MISSING] Service "${s.title}" gallery item ${idx + 1} missing alt`);
                }
            });
        });
        console.log(`Service images missing alt in DB: ${serviceMissingAlt} of ${serviceTotalImg}`);

        // Check Tech Projects
        console.log('\nChecking Tech Project images:');
        let techMissingAlt = 0;
        let techTotalImg = 0;
        tech.forEach(t => {
            if (t.img) {
                techTotalImg++;
                if (!t.imgAlt) {
                    techMissingAlt++;
                    console.log(`  [MISSING] Tech Project "${t.title}" missing imgAlt`);
                }
            }
        });
        console.log(`Tech images missing alt in DB: ${techMissingAlt} of ${techTotalImg}`);

        // Check MediaAsset collection
        const MediaAsset = require('../src/models/MediaAsset').default || mongoose.model('MediaAsset');
        const mediaAssets = await MediaAsset.find().lean();
        console.log(`\nMediaAsset Vault: ${mediaAssets.length} total indexed media assets.`);
        const missingMediaAlt = mediaAssets.filter(m => !m.alt || m.isMissingAlt).length;
        console.log(`MediaAsset with missing or suboptimal alt: ${missingMediaAlt} of ${mediaAssets.length}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error auditing DB images:', err);
    }
}

auditCodebaseImages();
auditDatabaseImages();
