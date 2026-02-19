require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Wedding = require('./models/Wedding');
const Content = require('./models/Content');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        // Migrate Weddings
        const weddingsPath = path.join(__dirname, 'data', 'weddings.json');
        if (fs.existsSync(weddingsPath)) {
            const weddingsData = JSON.parse(fs.readFileSync(weddingsPath, 'utf8'));
            await Wedding.deleteMany({}); // Clear existing
            await Wedding.insertMany(weddingsData);
            console.log(`Migrated ${weddingsData.length} weddings.`);
        }

        // Migrate Content
        const contentPath = path.join(__dirname, 'data', 'content.json');
        if (fs.existsSync(contentPath)) {
            const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
            await Content.deleteMany({}); // Clear existing
            const newContent = new Content(contentData);
            await newContent.save();
            console.log('Migrated site content.');
        }

        console.log('Migration Complete!');
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}).catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
});
