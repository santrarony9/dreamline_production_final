const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        value = value.trim().replace(/^"|"$/g, '');
        env[match[1]] = value;
    }
});

// Define models locally
const Journal = mongoose.models.Journal || mongoose.model('Journal', new mongoose.Schema({ title: String }));
const Wedding = mongoose.models.Wedding || mongoose.model('Wedding', new mongoose.Schema({ title: String }));

async function findPosts() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        const journal = await Journal.findOne();
        const wedding = await Wedding.findOne();
        
        console.log("POST_FOUND");
        if (journal) console.log("JOURNAL_ID:", journal._id);
        if (wedding) console.log("WEDDING_ID:", wedding._id);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findPosts();
