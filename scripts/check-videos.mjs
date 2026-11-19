import mongoose from 'mongoose';
import ServicePage from '../src/models/ServicePage.js';

await mongoose.connect(process.env.MONGODB_URI);

const pages = await ServicePage.find({ 'videos.0': { $exists: true } }, 'slug title videos').lean();

console.log('Services with videos count:', pages.length);
for (const p of pages) {
    console.log(`\n=== ${p.title} (slug: ${p.slug}) [${p.videos.length} videos] ===`);
    p.videos.forEach((v, idx) => {
        console.log(`  ${idx + 1}. [${v.category || '-'}] ${v.title} | ${v.url}`);
    });
}

await mongoose.disconnect();
