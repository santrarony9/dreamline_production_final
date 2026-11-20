import mongoose from 'mongoose';
import ServicePage from '../src/models/ServicePage.js';
import ServiceCategory from '../src/models/ServiceCategory.js';
import ServiceVideo from '../src/models/ServiceVideo.js';
import { syncServicePage } from '../src/lib/service-sync.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

// 1. Ensure FASHION category exists
await ServiceCategory.findOneAndUpdate(
  { slug: 'fashion' },
  {
    $set: {
      name: 'FASHION',
      slug: 'fashion',
      description: 'Editorial fashion photography, runway videography and designer fashion films',
      order: 5,
      isActive: true,
      isPublished: true,
      showInMegaMenu: true
    }
  },
  { upsert: true, returnDocument: 'after' }
);
console.log('✓ Ensured FASHION category');

// 2. Ensure Category Hub `fashion`
await ServicePage.findOneAndUpdate(
  { slug: 'fashion' },
  {
    $set: {
      slug: 'fashion',
      title: 'Fashion Photography & Film Production Kolkata',
      subtitle: 'Editorial, Runway & Luxury Campaigns',
      category: 'FASHION',
      description: 'Premier fashion photography, runway videography, and cinematic fashion films in Kolkata for designers, luxury labels, and models.',
      shortDescription: 'Editorial lookbooks, runway videography & high-fashion film campaigns',
      seoTitle: 'Fashion Photography & Film Production in Kolkata — Dreamline Production',
      metaDescription: 'Kolkata luxury fashion production house. Editorial fashion photography, runway videography, model reels, and designer campaigns.',
      order: 17,
      active: true,
      isPublished: true
    }
  },
  { upsert: true, returnDocument: 'after' }
);
console.log('✓ Ensured fashion category hub');

// 3. Ensure ServicePage `fashion-videography-kolkata`
const svcPage = await ServicePage.findOneAndUpdate(
  { slug: 'fashion-videography-kolkata' },
  {
    $set: {
      slug: 'fashion-videography-kolkata',
      title: 'Fashion Videography in Kolkata',
      subtitle: 'Runway & Model Reels',
      category: 'FASHION',
      description: 'Professional runway videography, designer collection coverage, high-speed slow motion, and dynamic Instagram reels in Kolkata.',
      shortDescription: 'Runway videography, fashion week coverage & dynamic stylized model reels',
      seoTitle: 'Fashion Videography in Kolkata | Runway & Model Reels — Dreamline Production',
      metaDescription: 'Top-rated fashion videographers in Kolkata for fashion shows, runway events, model lookbook reels, and designer campaigns.',
      videoSectionTitle: 'Fashion Videography & Runway Reels',
      videoSectionSubtitle: 'Explore our haute couture fashion reels, designer collection showcases and luxury jewelry films.',
      order: 18,
      active: true,
      isPublished: true
    }
  },
  { upsert: true, returnDocument: 'after' }
);
console.log('✓ Ensured fashion-videography-kolkata page:', svcPage.slug);

// 4. Ensure the 5 Instagram Reels in ServiceVideo
const reels = [
  {
    title: "Spark Blue Diamond — Haute Couture Fine Jewelry Reel",
    youtubeUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    youtubeId: "Df7AvoZznLb",
    videoUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    platform: "instagram",
    instagramUrl: "https://www.instagram.com/sparkbluediamond/reel/Df7AvoZznLb/",
    instagramId: "Df7AvoZznLb",
    thumbnail: "/uploads/fashion/reels/reel-df7avozznlb.jpg",
    customThumbnail: "/uploads/fashion/reels/reel-df7avozznlb.jpg",
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
    thumbnail: "/uploads/fashion/reels/reel-ddtloyyts6l.jpg",
    customThumbnail: "/uploads/fashion/reels/reel-ddtloyyts6l.jpg",
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
    thumbnail: "/uploads/fashion/reels/reel-dctatc-tnp0.jpg",
    customThumbnail: "/uploads/fashion/reels/reel-dctatc-tnp0.jpg",
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
    thumbnail: "/uploads/fashion/reels/reel-dc2rmwgtpxd.jpg",
    customThumbnail: "/uploads/fashion/reels/reel-dc2rmwgtpxd.jpg",
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
    thumbnail: "/uploads/fashion/reels/reel-dnsml_eyhdl.jpg",
    customThumbnail: "/uploads/fashion/reels/reel-dnsml_eyhdl.jpg",
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

for (const reel of reels) {
  await ServiceVideo.findOneAndUpdate(
    { serviceSlug: reel.serviceSlug, instagramId: reel.instagramId },
    { $set: reel },
    { upsert: true, returnDocument: 'after' }
  );
  console.log(`✓ Upserted reel ${reel.instagramId}`);
}

// 5. Synchronize ServicePage
await syncServicePage('fashion-videography-kolkata');
console.log('✓ Synchronized ServicePage for fashion-videography-kolkata');

// Verify ServicePage
const finalPage = await ServicePage.findOne({ slug: 'fashion-videography-kolkata' }).lean();
console.log(`✓ Verification: ${finalPage.title} has ${finalPage.videos?.length} videos:`);
finalPage.videos?.forEach((v, idx) => {
  console.log(`   ${idx + 1}. [${v.platform}] ${v.title} (${v.thumbnail})`);
});

await mongoose.disconnect();
console.log('Done!');
