const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
    
    const ContentSchema = new mongoose.Schema({
        global: mongoose.Schema.Types.Mixed
    }, { strict: false });
    
    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);
    
    const doc = await Content.findOne().lean();
    console.log("Global SEO in DB:", JSON.stringify(doc?.global?.seo || "undefined", null, 2));
    console.log("Full Global Object in DB:", JSON.stringify(doc?.global || "undefined", null, 2));
    
    await mongoose.disconnect();
}

test().catch(console.error);
