import mongoose from 'mongoose';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServicePage from '../src/models/ServicePage.js';
import { syncServicePage } from '../src/lib/service-sync.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

// Remove kaQ1a36gTHQ from fashion-videography-kolkata
const result = await ServiceVideo.deleteOne({
  serviceSlug: 'fashion-videography-kolkata',
  $or: [
    { _id: '6afec26c4b2e3d4f9237d0fc' },
    { youtubeId: 'kaQ1a36gTHQ' }
  ]
});
console.log('Deleted video from fashion-videography-kolkata:', result);

// Synchronize ServicePage
await syncServicePage('fashion-videography-kolkata');
console.log('Synchronized ServicePage for fashion-videography-kolkata');

// Check remaining videos
const remainingVideos = await ServiceVideo.find({ serviceSlug: 'fashion-videography-kolkata' }).lean();
console.log('Remaining ServiceVideo count:', remainingVideos.length);
remainingVideos.forEach((v, idx) => {
  console.log(` ${idx + 1}. [${v.platform}/${v.videoType}] ${v.title} (${v.youtubeUrl || v.videoUrl})`);
});

const page = await ServicePage.findOne({ slug: 'fashion-videography-kolkata' }).lean();
console.log('ServicePage.videos count:', page?.videos?.length);
page?.videos?.forEach((v, idx) => {
  console.log(` ${idx + 1}. [${v.platform}/${v.type}] ${v.title} (${v.url})`);
});

await mongoose.disconnect();
