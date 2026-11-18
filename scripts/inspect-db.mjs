import mongoose from 'mongoose';

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const allPages = await db.collection('servicepages').find({}).toArray();
    console.log('Total servicepages:', allPages.length);
    for (const p of allPages) {
        console.log(`- Slug: "${p.slug}", Title: "${p.title}", Videos: ${(p.videos || []).length}, Gallery: ${(p.gallery || []).length}`);
    }

    const podcastVideos = await db.collection('podcastvideos').find({}).toArray();
    console.log('\nTotal podcastvideos in DB:', podcastVideos.length);
    podcastVideos.forEach((v, idx) => {
        console.log(` [${idx + 1}] ${v.title} | ${v.url} | type: ${v.type} | published: ${v.isPublished}`);
    });

    await mongoose.disconnect();
}

main().catch(console.error);
