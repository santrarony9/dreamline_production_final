import mongoose from 'mongoose';

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const allPages = await db.collection('servicepages').find({}).toArray();
    for (const p of allPages) {
        if (p.videos && p.videos.length > 0) {
            console.log(`\n======================================================`);
            console.log(`PAGE: [${p.slug}] "${p.title}" (Total Videos: ${p.videos.length})`);
            console.log(`======================================================`);
            p.videos.forEach((v, i) => {
                console.log(`[${i + 1}] Title: ${v.title}`);
                console.log(`    URL: ${v.url}`);
                console.log(`    Category Tag: ${v.category || 'N/A'}`);
                console.log(`    Thumbnail: ${v.thumbnail || 'N/A'}`);
            });
        }
    }
    await mongoose.disconnect();
}

main().catch(console.error);
