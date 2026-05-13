export const revalidate = 600; // Revalidate every 10 min (on-demand revalidation handles immediate updates)
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
  const weddings = await Wedding.find().sort({ order: 1 }).limit(6).lean();
  const journals = await Journal.find().sort({ order: 1 }).limit(3).lean();

  const homeData = JSON.parse(JSON.stringify(siteContent?.home || {}));

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
      <QuoteSection 
        key={homeData.quote?.backgroundImage || 'default-quote'}
        quote={homeData.quote?.text} 
        backgroundImage={homeData.quote?.backgroundImage} 
      />
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

