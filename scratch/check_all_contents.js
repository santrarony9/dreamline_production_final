
const mongoose = require('mongoose');

async function checkContent() {
    try {
        await mongoose.connect('mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0');
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const contents = await Content.find();
        console.log("TOTAL DOCUMENTS:", contents.length);
        contents.forEach((c, i) => {
            console.log(`DOC ${i} KEYS:`, Object.keys(c.toObject()));
            if (c.services && c.services.length > 0) {
                console.log(`DOC ${i} SERVICES:`, JSON.stringify(c.services, null, 2));
            }
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkContent();
