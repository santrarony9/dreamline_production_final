
const mongoose = require('mongoose');

async function checkCollections() {
    try {
        await mongoose.connect('mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("COLLECTIONS:", collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCollections();
