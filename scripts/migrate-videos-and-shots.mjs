import mongoose from 'mongoose';
import ServicePage from '../src/models/ServicePage.js';
import ServiceCategory from '../src/models/ServiceCategory.js';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServiceShot from '../src/models/ServiceShot.js';

await mongoose.connect(process.env.MONGODB_URI);

const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
};

const CATEGORY_MAP = {
    'wedding-photography-kolkata': 'WEDDING',
    'pre-wedding-shoot-kolkata': 'WEDDING',
    'post-wedding-photography-kolkata': 'WEDDING',
    'corporate-photography-kolkata': 'CORPORATE',
    'commercial-ad-films-kolkata': 'CORPORATE',
    'brand-promotion-kolkata': 'CORPORATE',
    'short-film-production-kolkata': 'CORPORATE',
    '3d-visualization-kolkata': 'CORPORATE',
    'live-stream-broadcast-kolkata': 'CORPORATE',
    'fashion-photography-kolkata': 'CORPORATE',
    'podcast-production-kolkata': 'CORPORATE',
    'documentary-film-production-kolkata': 'CORPORATE',
    'drone-photography-kolkata': 'DRONE & AERIAL',
    'drone-videography-kolkata': 'DRONE & AERIAL',
    '3d-area-mapping-kolkata': 'DRONE & AERIAL',
    'birthday-photography-kolkata': 'SOCIAL',
    'rice-ceremony-photography-kolkata': 'SOCIAL',
    'other-social-events-kolkata': 'SOCIAL',
    'tech': 'TECH'
};

const pages = await ServicePage.find({}).lean();
console.log(`Starting migration across ${pages.length} service pages...`);

let videosMigrated = 0;
let shotsMigrated = 0;

for (const page of pages) {
    const mainCategory = CATEGORY_MAP[page.slug] || page.category || 'CORPORATE';

    // 1. Migrate Videos
    if (page.videos && page.videos.length > 0) {
        for (let i = 0; i < page.videos.length; i++) {
            const v = page.videos[i];
            const ytId = extractYouTubeId(v.url);
            if (!ytId) continue;

            const isShort = (v.url && v.url.includes('/shorts/')) || v.type === 'shorts';
            const thumb = v.thumbnail || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;

            await ServiceVideo.findOneAndUpdate(
                { serviceSlug: page.slug, youtubeId: ytId },
                {
                    $set: {
                        title: v.title || `${page.title} Production #${i + 1}`,
                        youtubeUrl: v.url,
                        youtubeId: ytId,
                        thumbnail: thumb,
                        category: mainCategory,
                        serviceSlug: page.slug,
                        serviceTitle: page.title,
                        description: v.description || "",
                        videoType: isShort ? 'shorts' : 'standard',
                        tag: v.category || (isShort ? 'Short Highlight' : '4K Cinematic'),
                        isFeatured: v.isFeatured || false,
                        order: v.order !== undefined ? v.order : i + 1,
                        isPublished: true,
                        status: 'published'
                    }
                },
                { upsert: true, new: true }
            );
            videosMigrated++;
        }
    }

    // 2. Migrate Gallery Shots
    if (page.gallery && page.gallery.length > 0) {
        for (let j = 0; j < page.gallery.length; j++) {
            const g = page.gallery[j];
            if (!g.url) continue;

            // Check if shot is from a YouTube video
            const ytId = extractYouTubeId(g.url);
            let matchingVideo = null;
            if (ytId) {
                matchingVideo = await ServiceVideo.findOne({ serviceSlug: page.slug, youtubeId: ytId });
            }

            const title = g.caption || g.alt || `${page.title} Shot #${j + 1}`;

            await ServiceShot.findOneAndUpdate(
                { serviceSlug: page.slug, imageUrl: g.url },
                {
                    $set: {
                        title: title,
                        imageUrl: g.url,
                        thumbnailUrl: g.url,
                        category: mainCategory,
                        serviceSlug: page.slug,
                        serviceTitle: page.title,
                        videoId: matchingVideo ? matchingVideo._id : null,
                        videoTitle: matchingVideo ? matchingVideo.title : "",
                        videoUrl: matchingVideo ? matchingVideo.youtubeUrl : "",
                        description: g.alt || g.caption || "",
                        shotType: page.slug.includes('wedding') ? 'ritual' : (page.slug.includes('drone') ? 'aerial' : 'cinematic-frame'),
                        isFeatured: j === 0,
                        order: j + 1,
                        isPublished: true,
                        status: 'published'
                    }
                },
                { upsert: true, new: true }
            );
            shotsMigrated++;
        }
    }
}

const totalVids = await ServiceVideo.countDocuments();
const totalShots = await ServiceShot.countDocuments();

console.log(`\n✓ Migration Complete!`);
console.log(`  - Total ServiceVideo documents in DB: ${totalVids}`);
console.log(`  - Total ServiceShot documents in DB: ${totalShots}`);

await mongoose.disconnect();
