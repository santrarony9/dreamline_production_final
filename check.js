const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0").then(async () => {
    const db = mongoose.connection.db;
    const content = await db.collection('contents').findOne({});
    console.log(JSON.stringify(content.videoVault, null, 2));
    process.exit();
}).catch(console.error);
