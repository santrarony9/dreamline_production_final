import mongoose from 'mongoose';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServicePage from '../src/models/ServicePage.js';
import { syncServicePage } from '../src/lib/service-sync.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const reels = [
  {
    title: "Spark Blue Diamond — Haute Couture Fine Jewelry Reel",
    youtubeUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    youtubeId: "Df7AvoZznLb",
    videoUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    instagramId: "Df7AvoZznLb",
    thumbnail: "/uploads/fashion/reels/reel-df7avozznlb.svg",
    category: "FASHION",
    serviceSlug: "fashion-videography-kolkata",
    serviceTitle: "Fashion Videography in Kolkata",
    description: "Haute couture diamond jewelry styling and high-fashion model showcase in 9:16 vertical cinema.",
    videoType: "shorts",
    tag: "Instagram Reel",
    order: 1,
    isPublished: true,
    status: "published"
  },
  {
    title: "Spark Blue Diamond — Solitaire & Bridal Diamond Ring Reel",
    youtubeUrl: "https://www.instagram.com/sparkbluediamond/reel/DdTlOYYTS6l/",
    youtubeId: "DdTlOYYTS6l",
    videoUrl: "https://www.instagram.com/sparkbluediamond/reel/DdTlOYYTS6l/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/sparkbluediamond/reel/DdTlOYYTS6l/",
    instagramId: "DdTlOYYTS6l",
    thumbnail: "/uploads/fashion/reels/reel-ddtloyyts6l.svg",
    category: "FASHION",
    serviceSlug: "fashion-videography-kolkata",
    serviceTitle: "Fashion Videography in Kolkata",
    description: "Exquisite bridal craftsmanship and brilliant-cut diamond macro elegance.",
    videoType: "shorts",
    tag: "Instagram Reel",
    order: 2,
    isPublished: true,
    status: "published"
  },
  {
    title: "Spark Blue Diamond — Signature Diamond Bangle & Choker Showcase",
    youtubeUrl: "https://www.instagram.com/sparkbluediamond/reel/DctAtC-tnP0/",
    youtubeId: "DctAtC-tnP0",
    videoUrl: "https://www.instagram.com/sparkbluediamond/reel/DctAtC-tnP0/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/sparkbluediamond/reel/DctAtC-tnP0/",
    instagramId: "DctAtC-tnP0",
    thumbnail: "/uploads/fashion/reels/reel-dctatc-tnp0.svg",
    category: "FASHION",
    serviceSlug: "fashion-videography-kolkata",
    serviceTitle: "Fashion Videography in Kolkata",
    description: "Elegance in motion featuring bespoke diamond bangles and luxury evening choker collection.",
    videoType: "shorts",
    tag: "Instagram Reel",
    order: 3,
    isPublished: true,
    status: "published"
  },
  {
    title: "Spark Blue Diamond — Royal Emerald & Diamond Heritage Reel",
    youtubeUrl: "https://www.instagram.com/sparkbluediamond/reel/Dc2rMwGtPxd/",
    youtubeId: "Dc2rMwGtPxd",
    videoUrl: "https://www.instagram.com/sparkbluediamond/reel/Dc2rMwGtPxd/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/sparkbluediamond/reel/Dc2rMwGtPxd/",
    instagramId: "Dc2rMwGtPxd",
    thumbnail: "/uploads/fashion/reels/reel-dc2rmwgtpxd.svg",
    category: "FASHION",
    serviceSlug: "fashion-videography-kolkata",
    serviceTitle: "Fashion Videography in Kolkata",
    description: "Royal gemstone cuts paired with luminous natural diamonds in a cinematic aesthetic.",
    videoType: "shorts",
    tag: "Instagram Reel",
    order: 4,
    isPublished: true,
    status: "published"
  },
  {
    title: "Saundh India — Designer Ethnic & Festive Couture Collection Reel",
    youtubeUrl: "https://www.instagram.com/saundhindia/reel/DNSMl_EyhDL/",
    youtubeId: "DNSMl_EyhDL",
    videoUrl: "https://www.instagram.com/saundhindia/reel/DNSMl_EyhDL/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/saundhindia/reel/DNSMl_EyhDL/",
    instagramId: "DNSMl_EyhDL",
    thumbnail: "/uploads/fashion/reels/reel-dnsml_eyhdl.svg",
    category: "FASHION",
    serviceSlug: "fashion-videography-kolkata",
    serviceTitle: "Fashion Videography in Kolkata",
    description: "Vibrant ethnic silhouette motion, handcrafted embroidery details and festive designer elegance.",
    videoType: "shorts",
    tag: "Instagram Reel",
    order: 5,
    isPublished: true,
    status: "published"
  }
];

// Update existing standard video order to 6 and serviceTitle to "Fashion Videography in Kolkata"
await ServiceVideo.updateMany(
  { serviceSlug: "fashion-videography-kolkata", youtubeId: "kaQ1a36gTHQ" },
  { $set: { order: 6, serviceTitle: "Fashion Videography in Kolkata" } }
);

for (const reel of reels) {
  await ServiceVideo.findOneAndUpdate(
    { serviceSlug: reel.serviceSlug, instagramId: reel.instagramId },
    { $set: reel },
    { upsert: true, new: true }
  );
  console.log(`Upserted reel: ${reel.title} (${reel.instagramId})`);
}

// Update ServicePage section titles
await ServicePage.findOneAndUpdate(
  { slug: "fashion-videography-kolkata" },
  {
    $set: {
      videoSectionTitle: "Fashion Videography & Runway Reels",
      videoSectionSubtitle: "Explore our haute couture fashion reels, designer collection showcases and luxury jewelry films."
    }
  }
);

// Synchronize ServicePage
await syncServicePage("fashion-videography-kolkata");
console.log("Synchronized ServicePage for fashion-videography-kolkata");

const page = await ServicePage.findOne({ slug: "fashion-videography-kolkata" }, "slug title videos videoSectionTitle videoSectionSubtitle").lean();
console.log(`ServicePage now has ${page?.videos?.length} videos:`);
page?.videos?.forEach((v, i) => console.log(`  ${i+1}. [${v.platform || 'youtube'}/${v.type || 'standard'}] ${v.title} (${v.url})`));

await mongoose.disconnect();
