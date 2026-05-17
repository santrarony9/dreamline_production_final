const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
    
    // Load actual Content model
    const Content = require('../src/models/Content').default;
    
    // Get current doc
    const doc = await Content.findOne().lean();
    const globalObj = doc.global;
    
    // Update ogImage in memory to a dummy S3 URL
    globalObj.seo.ogImage = "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1772984316059-test-og.webp";
    
    console.log("Attempting to save global object with ogImage...");
    
    try {
        const updated = await Content.findOneAndUpdate(
            {},
            { $set: { global: globalObj } },
            { new: true, runValidators: true }
        );
        console.log("SUCCESS! Global saved successfully!");
        console.log("Saved ogImage in DB:", updated.global.seo.ogImage);
    } catch (err) {
        console.error("FAIL! Save failed with error:", err);
    }
    
    await mongoose.disconnect();
}

test().catch(console.error);
