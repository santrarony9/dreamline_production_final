const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

// Define the Journal Schema roughly based on the app model
const JournalSchema = new mongoose.Schema({
    title: String,
    date: String,
    googleBusinessSync: String,
    lastSyncedAt: Date,
    category: String,
    image: String
}, { collection: 'journals' });

const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);

async function run() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        // Find today's date
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const todayStr = istDate.toISOString().split('T')[0];
        console.log("Today's date under IST:", todayStr);

        console.log("\n--- Searching for the target post ---");
        const specificPost = await Journal.findOne({ title: /Drone/i });
        if (specificPost) {
            console.log("Found post:");
            console.log("ID:", specificPost._id);
            console.log("Title:", specificPost.title);
            console.log("Date in DB:", specificPost.date);
            console.log("Sync Status:", specificPost.googleBusinessSync || "NONE");
            console.log("Last Synced At:", specificPost.lastSyncedAt || "NEVER");
        } else {
            console.log("Post with title containing 'Drone' NOT found.");
        }

        console.log("\n--- Searching for all posts scheduled for today ---");
        const todayPosts = await Journal.find({ date: todayStr });
        console.log(`Found ${todayPosts.length} posts for today:`);
        todayPosts.forEach(post => {
            console.log(`- Title: "${post.title}", Status: "${post.googleBusinessSync || "NONE"}"`);
        });

        console.log("\n--- Searching for last 5 journal entries in DB ---");
        const recentPosts = await Journal.find().sort({ date: -1 }).limit(5);
        recentPosts.forEach(post => {
            console.log(`- Date: "${post.date}", Title: "${post.title}", Sync: "${post.googleBusinessSync || "NONE"}"`);
        });

    } catch (err) {
        console.error("Database query failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("\nConnection closed.");
    }
}

run();
