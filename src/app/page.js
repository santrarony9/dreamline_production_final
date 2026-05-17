// On-demand revalidation handles immediate updates
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import Wedding from "@/models/Wedding";

import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Stats from "@/components/home/Stats";
import Expertise from "@/components/home/Expertise";
import MotionGallery from "@/components/home/MotionGallery";
import ProjectGallery from "@/components/home/ProjectGallery";
import ReviewSlider from "@/components/home/ReviewSlider";
import ServicesCategories from "@/components/home/ServicesCategories";
import QuoteSection from "@/components/home/QuoteSection";
import VideoVault from "@/components/home/VideoVault";
import JournalSection from "@/components/home/JournalSection";
import MasterGallery from "@/components/home/MasterGallery";
import LetsCreate from "@/components/home/LetsCreate";
import Partners from "@/components/home/Partners";
import Journal from "@/models/Journal";

export default async function Home() {
  await dbConnect();

  // Fetch site content for the home page
  const siteContent = await Content.findOne().lean();
  // Get today's date in IST format (YYYY-MM-DD)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const istDate = new Date(now.getTime() + istOffset);
  const todayStr = istDate.toISOString().split('T')[0];

  const weddings = await Wedding.find().sort({ order: 1 }).limit(6).lean();
  
  // Only fetch published journals (date <= today)
  const journals = await Journal.find({
      $or: [
          { date: { $lte: todayStr } },
          { date: null },
          { date: "" },
          { date: { $exists: false } }
      ]
  }).sort({ date: -1 }).limit(3).lean();

  const homeData = {
    hero: siteContent?.home?.hero || siteContent?.hero || {},
    marquee: (siteContent?.home?.marquee?.length > 0) ? siteContent.home.marquee : (siteContent?.marquee || []),
    stats: (siteContent?.home?.stats?.length > 0) ? siteContent.home.stats : (siteContent?.stats || []),
    partners: (siteContent?.home?.partners?.length > 0) ? siteContent.home.partners : (siteContent?.partners || []),
    services: (siteContent?.home?.services?.length > 0) ? siteContent.home.services : (siteContent?.services || []),
    reviews: siteContent?.home?.reviews || siteContent?.reviews || { list: [] },
    quote: siteContent?.home?.quote || siteContent?.quote || { text: "", backgroundImage: "" },
    expertise: siteContent?.home?.expertise || siteContent?.expertise || {},
    motionArchive: siteContent?.home?.motionArchive || siteContent?.motionArchive || { images: [] }
  };

  // Serialize data for client components
  const serializedWeddings = weddings.map(w => ({
    ...JSON.parse(JSON.stringify(w)),
    id: w._id.toString(),
    type: "wedding"
  }));

  const commercialProjects = (siteContent?.projects || [])
    .filter(p => p.type === "commercial" || p.category === "commercial")
    .map(p => ({
      ...JSON.parse(JSON.stringify(p)),
      id: p._id?.toString() || Math.random().toString(),
      type: "commercial"
    }));

  const allProjects = [...serializedWeddings, ...commercialProjects];

  const serializedJournals = journals.map(j => ({
    ...JSON.parse(JSON.stringify(j)),
    id: j.id || j._id.toString()
  }));

  return (
    <main className="bg-black">
      <Hero content={homeData.hero} />
      <Marquee items={homeData.marquee} />
      <Stats stats={homeData.stats} />
      <Partners partners={homeData.partners} />
      {/* Quote Section with forced data refresh logic */}
      <QuoteSection 
        key={`quote-${homeData?.quote?.backgroundImage || 'default'}`}
        quote={homeData?.quote?.text} 
        backgroundImage={homeData?.quote?.backgroundImage} 
      />
      {/* Debug marker: {homeData?.quote?.backgroundImage ? 'Custom Image Loaded' : 'Using Fallback'} */}
      <Expertise expertise={homeData.expertise} />
      <ServicesCategories services={homeData.services} />
      <MotionGallery 
        images={homeData.motionArchive?.images} 
        title={homeData.motionArchive?.title}
        subtitle={homeData.motionArchive?.subtitle}
        description={homeData.motionArchive?.description}
      />
      <VideoVault 
        videos={siteContent?.videoVault} 
        title={homeData.motionArchive?.title === "The Motion" ? "CINEMATIC REEL" : homeData.motionArchive?.title}
        subtitle={homeData.motionArchive?.subtitle === "Archive." ? "Video Vault." : homeData.motionArchive?.subtitle}
        description={homeData.motionArchive?.description}
      />
      <MasterGallery images={siteContent?.splitGallery} />
      <ProjectGallery initialProjects={allProjects} />
      <JournalSection journals={serializedJournals} />
      <ReviewSlider 
        reviews={homeData.reviews?.list} 
        averageRating={homeData.reviews?.averageRating}
        totalReviewsText={homeData.reviews?.totalReviewsText}
        sectionTitle={homeData.reviews?.sectionTitle}
        sectionSubtitle={homeData.reviews?.sectionSubtitle}
      />
      <LetsCreate global={siteContent?.global} />
    </main>
  );
}

