import fs from 'fs';
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);
const uri = match[1].trim();

async function inspectDetails() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // Contents
  const content = await db.collection('contents').findOne();
  for (const [key, val] of Object.entries(content)) {
    const valStr = JSON.stringify(val);
    if (valStr.includes('amazonaws.com')) {
      console.log('Content section with S3:', key);
      if (typeof val === 'object' && val !== null) {
        for (const [subKey, subVal] of Object.entries(val)) {
          if (JSON.stringify(subVal).includes('amazonaws.com')) {
            console.log(`  -> ${key}.${subKey}`);
          }
        }
      }
    }
  }

  // Weddings
  const weddings = await db.collection('weddings').find().toArray();
  for (const w of weddings) {
    if (JSON.stringify(w).includes('amazonaws.com')) {
      console.log(`Wedding: id=${w.id}, title=${w.title}`);
      if (w.coverImage?.includes('amazonaws.com')) console.log('  coverImage:', w.coverImage);
      if (w.img?.includes('amazonaws.com')) console.log('  img:', w.img);
      const s3Images = (w.images || []).filter(img => img?.includes('amazonaws.com'));
      if (s3Images.length) console.log(`  images: ${s3Images.length} S3 items`);
    }
  }

  // Journals
  const journals = await db.collection('journals').find().toArray();
  for (const j of journals) {
    if (JSON.stringify(j).includes('amazonaws.com')) {
      console.log(`Journal: id=${j.id || j._id}, title=${j.title}, image=${j.image}`);
    }
  }

  await mongoose.disconnect();
}
inspectDetails().catch(console.error);
