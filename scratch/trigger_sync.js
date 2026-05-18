const axios = require('axios');

const SYNC_URL = "https://dreamlineproduction.com/api/admin/automation/daily-sync?secret=dreamline_auto_2026";
const LOCAL_URL = "http://localhost:3000/api/admin/automation/daily-sync?secret=dreamline_auto_2026";

async function run() {
    console.log("Attempting to trigger LIVE production Daily Sync...");
    try {
        const response = await axios.get(SYNC_URL, {
            headers: {
                'User-Agent': 'Dreamline-Diagnostic-Trigger/1.0'
            }
        });
        console.log("--- PRODUCTION SYNC RESPONSE ---");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (err) {
        console.log("\nLive Production sync trigger failed or site is in maintenance/local. Error:", err.message);
        if (err.response) {
            console.log("Response Status:", err.response.status);
            console.log("Response Data:", err.response.data);
        }
        
        console.log("\nAttempting to run a direct local db-based trigger sync (simulating the api behavior)...");
        await runLocalDirectSync();
    }
}

// In case the production domain is not reachable/custom, we can run the database update locally!
async function runLocalDirectSync() {
    const mongoose = require('mongoose');
    const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";
    const FALLBACK_IMAGE = "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG";
    const WEBHOOK_URL = "https://hook.eu1.make.com/kqorky35l699m65mla8dzcut3alkczg7";

    const JournalSchema = new mongoose.Schema({
        title: String,
        date: String,
        googleBusinessSync: String,
        lastSyncedAt: Date,
        category: String,
        image: String,
        excerpt: String,
        content: String
    }, { collection: 'journals' });

    const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);

    try {
        console.log("Connecting directly to MongoDB for local fallback sync...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        // Get IST today date
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const todayStr = istDate.toISOString().split('T')[0];

        const post = await Journal.findOne({ 
            date: todayStr,
            googleBusinessSync: { $ne: "SYNCED" }
        });

        if (!post) {
            console.log("No pending post found for today in the database.");
            return;
        }

        console.log(`Found post: "${post.title}". Syncing directly to Make.com Webhook...`);

        let imageUrl = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
        const isOptimizable = imageUrl.includes('dreamlinepro.s3') || imageUrl.includes('unsplash.com');
        if (isOptimizable) {
            imageUrl = `https://dreamlineproduction.com/api/images/cover.jpg?url=${encodeURIComponent(imageUrl)}`;
        }

        function stripHtml(html) {
            if (!html) return "";
            return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        }
        const postSummary = stripHtml(post.excerpt || post.content).substring(0, 1500);

        const payload = {
            type: 'JOURNAL_POST',
            action: 'AUTOMATED_SYNC',
            post: {
                _id: post._id,
                title: post.title,
                date: post.date,
                category: post.category || "Wedding",
                image: imageUrl,
                summary: postSummary,
                publicUrl: `https://dreamlineproduction.com/journal/${post._id || post.id}`,
                excerpt: post.excerpt || postSummary.substring(0, 300)
            }
        };

        const res = await axios.post(WEBHOOK_URL, payload);
        console.log("Make.com Webhook trigger response status:", res.status);

        post.googleBusinessSync = "SYNCED";
        post.lastSyncedAt = new Date();
        await post.save();

        console.log("Database updated successfully to SYNCED!");

    } catch (err) {
        console.error("Local direct sync failed:", err.message);
    } finally {
        await mongoose.connection.close();
        console.log("Local database connection closed.");
    }
}

run();
