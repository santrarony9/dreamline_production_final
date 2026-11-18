import mongoose from 'mongoose';

async function testUpdateAndFetch() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }), 'contents');
  
  // 1. Update titleLine1 to 'Iconic Test'
  await Content.updateOne({}, { $set: { 'home.hero.titleLine1': 'Iconic Test' } });
  console.log('1. Updated DB to "Iconic Test"');

  // 2. Fetch HTML from localhost:3000
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  const hasIconic = html.includes('Iconic Test');
  const hasVisionary = html.includes('Visionary');
  console.log('2. HTML contains "Iconic Test":', hasIconic);
  console.log('2. HTML contains "Visionary":', hasVisionary);

  // 3. Revert back to 'Visionary'
  await Content.updateOne({}, { $set: { 'home.hero.titleLine1': 'Visionary' } });
  console.log('3. Reverted DB to "Visionary"');

  // 4. Fetch again
  const resRevert = await fetch('http://localhost:3000/');
  const htmlRevert = await resRevert.text();
  const hasVisionaryReverted = htmlRevert.includes('Visionary');
  console.log('4. HTML after revert contains "Visionary":', hasVisionaryReverted);

  await mongoose.disconnect();
}

testUpdateAndFetch();
