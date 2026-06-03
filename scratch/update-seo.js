const mongoose = require('mongoose');
const fs = require('fs');

// Parse .env.local manually
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
    return acc;
}, {});

const uri = env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const contents = db.collection('contents'); // typically lowercase plural

    const seoUpdate = {
        title: "Dreamline Production | Best Wedding Photographer in Kolkata",
        description: "Looking for the best wedding photographer in Kolkata? Dreamline Production specializes in cinematic wedding films, pre-wedding photography, and premium events in West Bengal.",
        keywords: "Wedding Photographer Kolkata, Best Cinematic Films Kolkata, Pre-wedding shoot Kolkata, Top photographer West Bengal, professional photography"
    };

    const result = await contents.updateOne(
        {}, // match first document
        { $set: { "global.seo": seoUpdate } }
    );

    console.log('Update result:', result);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
