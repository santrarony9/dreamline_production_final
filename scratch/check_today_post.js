const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas...\n");
        const db = client.db("dreamline");
        const journals = db.collection("journals");

        // Get today's date in IST
        const istOffset = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const istDate = new Date(now.getTime() + istOffset);
        const todayStr = istDate.toISOString().split('T')[0];
        
        console.log("Current IST DateTime:", istDate.toISOString());
        console.log("Today's Date String:", todayStr);
        console.log("-----------------------------------\n");

        // Check today's post
        const todayPost = await journals.findOne({ date: todayStr });
        if (todayPost) {
            console.log("TODAY'S POST FOUND:");
            console.log("  Title:", todayPost.title);
            console.log("  Date:", todayPost.date);
            console.log("  GBP Sync Status:", todayPost.gbpSyncStatus || "NONE");
            console.log("  Published:", todayPost.published);
            console.log("  Public URL:", todayPost.publicUrl || "MISSING");
            console.log("  Image:", todayPost.image || "MISSING");
        } else {
            console.log("NO POST SCHEDULED FOR TODAY (" + todayStr + ")");
        }

        console.log("\n--- LAST 5 POSTS (with sync status) ---");
        const recent = await journals.find({}).sort({ date: -1 }).limit(5).toArray();
        recent.forEach((j, i) => {
            console.log(`[${i+1}] Date: ${j.date} | Status: ${j.gbpSyncStatus || 'NONE'} | Title: ${j.title?.substring(0, 50)}`);
        });

    } catch(e) {
        console.error("Error:", e.message);
    } finally {
        await client.close();
    }
}
main();
