import mongoose from 'mongoose';
import process from 'node:process';
process.loadEnvFile('.env.local');

const JournalSchema = new mongoose.Schema({}, { strict: false });
const Journal = mongoose.model('Journal', JournalSchema);

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const todayStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
    const post = await Journal.findOne({ date: todayStr });
    if (post) {
        post.googleBusinessSync = "PENDING";
        await post.save();
        console.log("Reset post to PENDING:", post.title);
    } else {
        console.log("No post found for today");
    }
    await mongoose.disconnect();
}
run();
