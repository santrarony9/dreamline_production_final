import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import ServicePage from '../src/models/ServicePage.js';
import ServiceCategory from '../src/models/ServiceCategory.js';
import MediaAsset from '../src/models/MediaAsset.js';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServiceShot from '../src/models/ServiceShot.js';

await mongoose.connect(process.env.MONGODB_URI);

const backupDir = path.join(process.cwd(), 'backups');
await fs.mkdir(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

const servicePages = await ServicePage.find({}).lean();
const categories = await ServiceCategory.find({}).lean();
const mediaAssets = await MediaAsset.find({}).lean();
const serviceVideos = await ServiceVideo.find({}).lean();
const serviceShots = await ServiceShot.find({}).lean();

const backupData = {
    timestamp: new Date().toISOString(),
    servicePages,
    categories,
    mediaAssets,
    serviceVideos,
    serviceShots
};

await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

console.log(`✓ Backup successfully created at: ${backupFile}`);
console.log(`  - Service Pages: ${servicePages.length}`);
console.log(`  - Categories: ${categories.length}`);
console.log(`  - Media Assets: ${mediaAssets.length}`);
console.log(`  - Service Videos: ${serviceVideos.length}`);
console.log(`  - Service Shots: ${serviceShots.length}`);

await mongoose.disconnect();
