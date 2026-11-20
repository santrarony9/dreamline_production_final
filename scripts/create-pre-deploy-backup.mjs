// scripts/create-pre-deploy-backup.mjs
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            let val = trimmed.slice(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    }
}

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in environment');
    process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const collections = await mongoose.connection.db.listCollections().toArray();
const backup = {
    timestamp: new Date().toISOString(),
    collections: {}
};

for (const col of collections) {
    const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
    backup.collections[col.name] = docs;
    console.log(`Backed up ${col.name}: ${docs.length} records`);
}

const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-predeploy-${timestampStr}.json`);
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log(`\n✓ Full backup successfully saved to: ${backupPath}`);
await mongoose.disconnect();
