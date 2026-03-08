export const dynamic = 'force-dynamic';
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
      <QuoteSection />
      <Expertise expertise={homeData.expertise} />
      <ServicesCategories services={homeData.services} />
      <MotionGallery images={homeData.motionArchive?.images} />
      <VideoVault videos={siteContent?.videoVault} />
      <MasterGallery images={siteContent?.splitGallery} />
      <ProjectGallery initialProjects={serializedWeddings} />
      <JournalSection journals={serializedJournals} />
      <ReviewSlider reviews={homeData.reviews?.list} />
      <LetsCreate />
    </main>
  );
}

