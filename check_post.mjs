import mongoose from 'mongoose';
import process from 'node:process';
process.loadEnvFile('.env.local');

const JournalSchema = new mongoose.Schema({}, { strict: false });
const Journal = mongoose.model('Journal', JournalSchema);

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const todayStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log("Checking for date:", todayStr);
    const posts = await Journal.find({ date: todayStr });
    console.log("Found posts:");
    posts.forEach(p => {
        console.log(`- Title: ${p.title}`);
        console.log(`  Sync Status: ${p.googleBusinessSync}`);
        console.log(`  Last Synced At: ${p.lastSyncedAt}`);
    });
    await mongoose.disconnect();
}
run();
