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
import MasterGallery from "@/components/home/MasterGallery";
import LetsCreate from "@/components/home/LetsCreate";

export default async function Home() {
  await dbConnect();

  // Fetch site content for the home page
  const siteContent = await Content.findOne().lean();
  const weddings = await Wedding.find().sort({ order: 1 }).limit(6).lean();
  const homeData = JSON.parse(JSON.stringify(siteContent?.home || {}));

  // Serialize data for client components
  const serializedWeddings = weddings.map(w => ({
    ...JSON.parse(JSON.stringify(w)),
    id: w._id.toString(),
    type: "wedding"
  }));

  return (
    <main className="bg-black">
      <Hero content={homeData.hero} />
      <Marquee items={homeData.marquee} />
      <Stats stats={homeData.stats} />
      <QuoteSection />
      <Expertise expertise={homeData.expertise} />
      <ServicesCategories services={homeData.services} />
      <MotionGallery images={homeData.motionArchive?.images} />
      <MasterGallery images={siteContent?.splitGallery} />
      <ProjectGallery initialProjects={serializedWeddings} />
      <ReviewSlider reviews={homeData.reviews?.list} />
      <LetsCreate />

      {/* Journal/Blog Section Placeholder - Implement if needed */}
      <section className="py-32 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl font-black text-white italic mb-12">
            Journal.
          </h2>
          <p className="text-white/40 uppercase tracking-widest text-xs font-black">
            Coming Soon to Next.js
          </p>
        </div>
      </section>
    </main>
  );
}
