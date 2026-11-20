import mongoose from 'mongoose';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServicePage from '../src/models/ServicePage.js';
import { syncServicePage } from '../src/lib/service-sync.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const reels = [
  { shortcode: 'Df7AvoZznLb', file: '/uploads/fashion/reels/reel-df7avozznlb.jpg' },
  { shortcode: 'DdTlOYYTS6l', file: '/uploads/fashion/reels/reel-ddtloyyts6l.jpg' },
  { shortcode: 'DctAtC-tnP0', file: '/uploads/fashion/reels/reel-dctatc-tnp0.jpg' },
  { shortcode: 'Dc2rMwGtPxd', file: '/uploads/fashion/reels/reel-dc2rmwgtpxd.jpg' },
  { shortcode: 'DNSMl_EyhDL', file: '/uploads/fashion/reels/reel-dnsml_eyhdl.jpg' }
];

for (const r of reels) {
  const updated = await ServiceVideo.findOneAndUpdate(
    {
      serviceSlug: 'fashion-videography-kolkata',
      $or: [
        { instagramId: r.shortcode },
        { youtubeId: r.shortcode },
        { youtubeUrl: new RegExp(r.shortcode, 'i') }
      ]
    },
    {
      $set: {
        thumbnail: r.file,
        customThumbnail: r.file
      }
    },
    { returnDocument: 'after' }
  );
  console.log(`Updated ${r.shortcode} thumbnail to ${r.file}:`, Boolean(updated));
}

// Synchronize ServicePage
await syncServicePage('fashion-videography-kolkata');
console.log('Synchronized ServicePage for fashion-videography-kolkata');

const page = await ServicePage.findOne({ slug: 'fashion-videography-kolkata' }, 'videos').lean();
console.log('ServicePage.videos thumbnails:');
page?.videos?.forEach((v, i) => console.log(` ${i + 1}. ${v.title} -> ${v.thumbnail}`));

await mongoose.disconnect();
