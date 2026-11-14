import fs from 'fs';
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);
if (!match) process.exit(1);
const uri = match[1].trim();

async function findS3() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const content = await db.collection('contents').findOne();
  const contentStr = JSON.stringify(content);
  const contentS3 = contentStr.match(/https?:\/\/[^\s"']*(?:amazonaws\.com)[^\s"']*/g) || [];
  console.log('Contents S3 URLs:', contentS3.length);
  console.log('Unique Content S3:', [...new Set(contentS3)]);

  const weddings = await db.collection('weddings').find().toArray();
  const weddingsStr = JSON.stringify(weddings);
  const weddingsS3 = weddingsStr.match(/https?:\/\/[^\s"']*(?:amazonaws\.com)[^\s"']*/g) || [];
  console.log('Weddings S3 URLs:', weddingsS3.length);
  console.log('Unique Wedding S3:', [...new Set(weddingsS3)]);

  const journals = await db.collection('journals').find().toArray();
  const journalsStr = JSON.stringify(journals);
  const journalsS3 = journalsStr.match(/https?:\/\/[^\s"']*(?:amazonaws\.com)[^\s"']*/g) || [];
  console.log('Journals S3 URLs:', journalsS3.length);
  console.log('Unique Journal S3:', [...new Set(journalsS3)]);

  await mongoose.disconnect();
}
findS3().catch(console.error);
