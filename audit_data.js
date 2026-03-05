
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const Wedding = mongoose.model('Wedding', new mongoose.Schema({}, { strict: false }));
        const Journal = mongoose.model('Journal', new mongoose.Schema({}, { strict: false }));

        const content = await Content.findOne();
        const weddingsCount = await Wedding.countDocuments();
        const journalsCount = await Journal.countDocuments();

        console.log("--- DATABASE AUDIT ---");
        console.log("Weddings count:", weddingsCount);
        console.log("Journals count:", journalsCount);
        console.log("Content document present:", !!content);

        if (content) {
            console.log("Content Structure Keys:", Object.keys(content.toObject()));
            if (content.home) {
                console.log("Home Section Keys:", Object.keys(content.home));
            }
        }

        const allWeddings = await Wedding.find({}, { title: 1 });
        console.log("Wedding Titles:", allWeddings.map(w => w.title));

        const allJournals = await Journal.find({}, { title: 1 });
        console.log("Journal Titles:", allJournals.map(j => j.title));

        await mongoose.disconnect();
    } catch (err) {
        console.error("Audit failed:", err);
        process.exit(1);
    }
}

checkData();
