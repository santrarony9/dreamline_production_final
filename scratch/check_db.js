const mongoose = require('mongoose');

const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

async function checkDb() {
    try {
        await mongoose.connect(uri);
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const contents = await Content.find();
        console.log(`Found ${contents.length} documents`);
        contents.forEach((c, i) => {
            console.log(`Document ${i}:`);
            console.log(JSON.stringify(c, null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
