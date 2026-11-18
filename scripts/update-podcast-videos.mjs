import mongoose from 'mongoose';

const podcastVideos = [
  {
    title: 'Banglar gan with versatile singer Pousali Banerjee | Prompt With Paromita',
    url: 'https://youtu.be/rGCNP3nWC9Y',
    thumbnail: 'https://i.ytimg.com/vi/rGCNP3nWC9Y/maxresdefault.jpg'
  },
  {
    title: 'দীপান্বিতা অমাবস্যার নিয়ম! #shorts | Prompt With Paromita',
    url: 'https://youtube.com/shorts/hRnCf_evOZs',
    thumbnail: 'https://i.ytimg.com/vi/hRnCf_evOZs/maxresdefault.jpg'
  },
  {
    title: 'দুর্গাপুজোর বোধন,বিসর্জন,সিঁদুর খেলা—কেন এই রীতি ? | Kholapata ebong Arpita',
    url: 'https://youtu.be/t4YqQvedLkE',
    thumbnail: 'https://i.ytimg.com/vi/t4YqQvedLkE/maxresdefault.jpg'
  },
  {
    title: 'মাত্র ৪৮ মিনিট! কেন এই সময়টাই এত গুরুত্বপূর্ণ? | Kholapata ebong Arpita',
    url: 'https://youtube.com/shorts/qtp9vJ0xzFY',
    thumbnail: 'https://i.ytimg.com/vi/qtp9vJ0xzFY/hqdefault.jpg'
  },
  {
    title: 'শান্তিপুরের ঐতিহ্য: বড় গোস্বামী বাড়ি ও আগমেশ্বরী মাতার অজানা ইতিহাস | ANI In Search For Truth',
    url: 'https://youtu.be/fLturgnZcMw',
    thumbnail: 'https://i.ytimg.com/vi/fLturgnZcMw/maxresdefault.jpg'
  },
  {
    title: 'মারণ ক্রিয়া কি ? তন্ত্র দিয়ে কি সত্যিই ক্ষতি করা যায়? | ANI In Search For Truth',
    url: 'https://youtube.com/shorts/p-AOOftRg_E',
    thumbnail: 'https://i.ytimg.com/vi/p-AOOftRg_E/maxresdefault.jpg'
  }
];

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const result = await db.collection('servicepages').updateOne(
    { slug: 'podcast-production-kolkata' },
    { $set: { videos: podcastVideos } }
  );

  console.log('MongoDB update result:', result);
  const doc = await db.collection('servicepages').findOne({ slug: 'podcast-production-kolkata' });
  console.log('Verified videos count in MongoDB:', doc.videos ? doc.videos.length : 0);
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
