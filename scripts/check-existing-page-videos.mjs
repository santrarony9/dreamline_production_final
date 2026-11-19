import mongoose from 'mongoose';

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const pages = await db.collection('servicepages').find({ "videos.0": { $exists: true } }).toArray();
    console.log(`Found ${pages.length} pages with videos:`);
    for (const p of pages) {
        console.log(`\n=== SLUG: ${p.slug} (${p.title}) ===`);
        for (const [i, v] of (p.videos || []).entries()) {
            console.log(`  ${i+1}. [${v.url}] "${v.title}"`);
        }
    }
    await mongoose.disconnect();
}

main().catch(console.error);
