
const mongoose = require('mongoose');

async function checkContent() {
    try {
        await mongoose.connect('mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0');
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const content = await Content.findOne();
        console.log("HOME CONTENT:", JSON.stringify(content?.home, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkContent();
