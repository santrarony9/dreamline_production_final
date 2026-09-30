const mongoose = require('mongoose');

// Add your MongoDB URI here
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dreamline";

// The old S3 bucket URLs to replace
const OLD_S3_PREFIXES = [
    "https://dreamlinepro.s3.ap-south-2.amazonaws.com/",
    "https://dreamlinepro.s3.ap-south-1.amazonaws.com/",
    "https://dreamlinepro.s3.amazonaws.com/"
];

// The new VPS URL prefix
const NEW_VPS_PREFIX = "https://dreamlineproduction.com/uploads/";

async function migrateUrls() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // 1. Migrate Weddings
    console.log("\n--- Migrating Weddings ---");
    const db = mongoose.connection.db;
    const weddings = await db.collection('weddings').find({}).toArray();
    let updatedWeddings = 0;

    for (const w of weddings) {
        let needsUpdate = false;
        let updateDoc = { $set: {} };

        // Helper to replace URL
        const replaceUrl = (url) => {
            if (!url) return url;
            for (const prefix of OLD_S3_PREFIXES) {
                if (url.startsWith(prefix)) {
                    needsUpdate = true;
                    return url.replace(prefix, NEW_VPS_PREFIX);
                }
            }
            return url;
        };

        if (w.coverImage) updateDoc.$set.coverImage = replaceUrl(w.coverImage);
        if (w.img) updateDoc.$set.img = replaceUrl(w.img);
        
        if (w.images && Array.isArray(w.images)) {
            const newImages = w.images.map(replaceUrl);
            if (JSON.stringify(newImages) !== JSON.stringify(w.images)) {
                needsUpdate = true;
                updateDoc.$set.images = newImages;
            }
        }

        if (needsUpdate) {
            await db.collection('weddings').updateOne({ _id: w._id }, updateDoc);
            updatedWeddings++;
            console.log(`Updated Wedding: ${w.title}`);
        }
    }
    console.log(`Completed Weddings. Total updated: ${updatedWeddings}`);

    // Add similar blocks for Journals, ServicePages, etc., if needed

    console.log("\nMigration finished.");
    process.exit(0);
}

migrateUrls().catch(console.error);
