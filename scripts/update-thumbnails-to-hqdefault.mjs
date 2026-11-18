import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    process.exit(1);
}

async function updateThumbnails() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const podcastVideosCollection = db.collection('podcastvideos');
    const servicePagesCollection = db.collection('servicepages');

    const videos = await podcastVideosCollection.find({}).toArray();
    console.log(`Found ${videos.length} podcast videos.`);

    for (const v of videos) {
        if (v.youtubeId) {
            const hqThumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
            await podcastVideosCollection.updateOne(
                { _id: v._id },
                { $set: { thumbnail: hqThumb } }
            );
        }
    }
    console.log("Updated all podcast videos in DB to use https://img.youtube.com/vi/ID/hqdefault.jpg");

    // Also update ServicePage.videos for slug 'podcast-production-kolkata'
    const updatedVideos = await podcastVideosCollection.find({ status: 'published' }).sort({ displayOrder: 1 }).toArray();
    const serviceVideos = updatedVideos.map(v => ({
        title: v.title,
        url: v.youtubeUrl,
        thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
    }));

    await servicePagesCollection.updateOne(
        { slug: "podcast-production-kolkata" },
        { $set: { videos: serviceVideos } }
    );
    console.log("Updated ServicePage.videos with hqdefault thumbnails.");

    await mongoose.disconnect();
    console.log("Done.");
}

updateThumbnails().catch(console.error);
