import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

const JournalSchema = new mongoose.Schema({ title: String }, { strict: false });
const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);

async function deduplicate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");
        
        // Sort by createdAt descending so we keep the newest one and delete the older duplicates
        const posts = await Journal.find({}).sort({ createdAt: -1 });
        const seenTitles = new Set();
        let deletedCount = 0;
        
        for (const post of posts) {
            if (seenTitles.has(post.title)) {
                await Journal.findByIdAndDelete(post._id);
                deletedCount++;
                console.log("Deleted duplicate:", post.title);
            } else {
                seenTitles.add(post.title);
            }
        }
        
        console.log("Total duplicates deleted:", deletedCount);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

deduplicate();
