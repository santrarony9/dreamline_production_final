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
import StructuredData from "@/components/seo/StructuredData";


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
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "PhotographyBusiness", "ProductionCompany"],
        "@id": "https://dreamlineproduction.com",
        "name": "Dreamline Production",
        "alternateName": ["Dreamline Production House", "Dreamline Production Kolkata", "Dreamline Wedding Photography Kolkata", "Best Production House Kolkata", "Best Wedding Photographer Kolkata"],
        "description": "Dreamline Production is the best production house in Kolkata and top-rated wedding photography studio in West Bengal, India. Founded by Rony Santra with 15+ years of experience. We are one of the top 5 wedding photographers in Kolkata, specializing in luxury Bengali wedding photography, cinematic wedding films, pre-wedding shoots, destination wedding photography, and corporate film production. Rated 4.9/5 on Google with 500+ weddings captured across India. Also offering corporate films, ad films, podcast production, drone videography, and line production. Trusted by TATA Trust, L&T, Al Jazeera, ABP Network, BookMyShow, Carlsberg.",
        "url": "https://dreamlineproduction.com",
        "telephone": "+91-82400-54002",
        "email": "info.dreamlineproduction@gmail.com",
        "image": "https://dreamlineproduction.com/logo-banner.png",
        "logo": "https://dreamlineproduction.com/logo.png",
        "priceRange": "₹₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, UPI, Bank Transfer, Credit Card",
        "slogan": "Kolkata's No.1 Production House — Best Wedding Photography & Corporate Films in West Bengal",
        "foundingDate": "2010",
        "founder": {
          "@type": "Person",
          "name": "Rony Santra",
          "jobTitle": "Founder & Lead Cinematographer",
          "description": "One of the best wedding photographers and cinematographers in Kolkata with 15+ years of experience"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road",
          "addressLocality": "Kolkata",
          "addressRegion": "West Bengal",
          "postalCode": "700082",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.498,
          "longitude": 88.357
        },
        "areaServed": [
          { "@type": "City", "name": "Kolkata" },
          { "@type": "State", "name": "West Bengal" },
          { "@type": "Country", "name": "India" },
          { "@type": "City", "name": "Howrah" },
          { "@type": "City", "name": "Salt Lake City" },
          { "@type": "City", "name": "New Town Kolkata" },
          { "@type": "City", "name": "Siliguri" },
          { "@type": "City", "name": "Durgapur" },
          { "@type": "City", "name": "Darjeeling" },
          { "@type": "City", "name": "Shantiniketan" },
          { "@type": "City", "name": "Mumbai" },
          { "@type": "City", "name": "Delhi" },
          { "@type": "City", "name": "Goa" }
        ],
        "serviceType": [
          "Wedding Photography",
          "Best Wedding Photography in Kolkata",
          "Marriage Photography",
          "Wedding Videography",
          "Cinematic Wedding Films",
          "Wedding Video Production",
          "Candid Wedding Photography",
          "Bridal Photography",
          "Pre-Wedding Photography",
          "Engagement Photography",
          "Haldi Ceremony Photography",
          "Mehendi Photography",
          "Reception Photography",
          "Same Day Edit Wedding",
          "Wedding Album Design",
          "Destination Wedding Photography",
          "Bengali Wedding Photography",
          "Corporate Film Production",
          "Ad Film Production",
          "Commercial Videography",
          "Factory Videography",
          "Industrial Videography",
          "Manufacturing Unit Video",
          "Factory Tour Video",
          "Product Video Production",
          "Brand Film Production",
          "Company Profile Video",
          "Promotional Video",
          "Podcast Production",
          "Drone Videography",
          "Line Production",
          "Event Photography",
          "Fashion Photography",
          "Live Streaming"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Best Wedding Photography & Production House Services in Kolkata",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Best Wedding Photography in Kolkata",
                "description": "Top-rated luxury wedding photography and cinematography in Kolkata. Candid, cinematic, and traditional styles. Bridal photography, haldi, mehendi, reception coverage, engagement shoots, same-day edits, and premium wedding albums. Both-side packages from ₹40,000/day. 500+ weddings captured across West Bengal and India.",
                "url": "https://dreamlineproduction.com/luxury"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Wedding Video & Marriage Film Production Kolkata",
                "description": "Best wedding videography and marriage film production in Kolkata. Cinematic wedding highlight reels, full ceremony coverage, same-day edits, and destination wedding films. Complete wedding video packages with drone coverage.",
                "url": "https://dreamlineproduction.com/luxury"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Best Production House in Kolkata for Corporate Films",
                "description": "Kolkata's top production house for corporate films, ad films, brand videos. Clients: TATA Trust, L&T, Carlsberg, BookMyShow.",
                "url": "https://dreamlineproduction.com/commercial"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Factory Videography & Industrial Shoot Kolkata",
                "description": "Professional factory videography, industrial plant shoots, manufacturing unit video production, factory tour videos, and industrial documentary filming in Kolkata and West Bengal. Trusted by TATA Trust, L&T, and major manufacturing companies.",
                "url": "https://dreamlineproduction.com/commercial"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Commercial Videography & Brand Films Kolkata",
                "description": "Product videos, brand films, TV commercials, promotional videos, company profile videos, and social media video content production in Kolkata.",
                "url": "https://dreamlineproduction.com/commercial"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Pre-Wedding Photography Kolkata",
                "description": "Creative pre-wedding shoots at stunning locations across Kolkata and West Bengal.",
                "url": "https://dreamlineproduction.com/services/pre-wedding"
              }
            }
          ]
        },
        "knowsAbout": [
          "Best Wedding Photography in Kolkata",
          "Top 5 Wedding Photographers Kolkata",
          "Production House in Kolkata",
          "Best Production House in West Bengal",
          "Wedding Photography West Bengal",
          "Corporate Films Kolkata",
          "Bengali Wedding Photography"
        ],
        "keywords": "best wedding photography Kolkata, production house in Kolkata, best production house West Bengal, top 5 wedding photographer Kolkata, wedding photography West Bengal, best photographer Kolkata, corporate film production house Kolkata",
        "sameAs": [
          "https://www.instagram.com/dreamlineproduction",
          "https://www.facebook.com/dreamlineproduction"
        ],
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "09:00",
          "closes": "21:00"
        }
      }} />
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Dreamline Production",
        "url": "https://dreamlineproduction.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://dreamlineproduction.com/journal?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }} />
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

