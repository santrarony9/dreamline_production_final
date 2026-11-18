import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log("\n--- Searching for microphone image across collections ---");
    for (const c of collections) {
        const docs = await db.collection(c.name).find({
            $or: [
                { heroImage: /1478737270239/ },
                { image: /1478737270239/ },
                { banner: /1478737270239/ },
                { thumbnail: /1478737270239/ },
                { url: /1478737270239/ },
                { "gallery.url": /1478737270239/ }
            ]
        }).toArray();

        if (docs.length > 0) {
            console.log(`Found ${docs.length} match(es) in collection '${c.name}':`);
            docs.forEach(d => {
                console.log(` - ID: ${d._id}, Slug/Title: ${d.slug || d.title || d.name}`);
            });
        }
    }

    // Now remove heroImage from ServicePage for podcast-production-kolkata
    console.log("\n--- Removing heroImage from ServicePage 'podcast-production-kolkata' ---");
    const servicePages = db.collection('servicepages');
    const beforeDoc = await servicePages.findOne({ slug: 'podcast-production-kolkata' });
    console.log("Before update heroImage:", beforeDoc?.heroImage);

    const updateRes = await servicePages.updateOne(
        { slug: 'podcast-production-kolkata' },
        { 
            $set: { heroImage: "", heroImageAlt: "" }
        }
    );
    console.log(`Updated ServicePage document (modifiedCount: ${updateRes.modifiedCount})`);

    const afterDoc = await servicePages.findOne({ slug: 'podcast-production-kolkata' });
    console.log("After update heroImage:", afterDoc?.heroImage === "" ? "EMPTY STRING (Removed)" : afterDoc?.heroImage);

    await mongoose.disconnect();
    console.log("\nDone.");
}

run().catch(console.error);
