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

// Define the model locally
const ContentSchema = new mongoose.Schema({
    global: {
        google: {
            mapsApiKey: String
        }
    }
}, { strict: false });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

async function inject() {
    try {
        if (!env.MONGODB_URI) throw new Error("MONGODB_URI not found in .env.local");
        await mongoose.connect(env.MONGODB_URI);
        console.log("Connected to MongoDB");
        
        const result = await Content.findOneAndUpdate({}, {
            $set: {
                'global.google.mapsApiKey': 'AIzaSyC3QuAZUBLr61uUmF5ZfJuuynPlaxDWSEo'
            }
        }, { upsert: true, new: true });
        
        console.log("MAPS_KEY_INJECTED_SUCCESSFULLY");
        process.exit(0);
    } catch (err) {
        console.error("Injection failed:", err);
        process.exit(1);
    }
}

inject();
