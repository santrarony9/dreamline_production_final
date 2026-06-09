import { Instrument_Sans, Unbounded } from "next/font/google";
export const dynamic = 'force-dynamic';
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthProvider from "@/context/AuthProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import SmoothScroll from "@/components/global/SmoothScroll";
import MediaProtection from "@/components/global/MediaProtection";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import { cache } from 'react';

const getSiteContent = cache(async () => {
  await dbConnect();
  return await Content.findOne().lean();
});

export async function generateMetadata() {
  try {
    // Fetch global SEO from database using cached function
    const siteContent = await getSiteContent();
    const globalSeo = siteContent?.global?.seo || {};

    let keywordsList = globalSeo.keywords || "Wedding Photographer Kolkata, Best Cinematic Films Kolkata, Luxury Wedding Photography Bengal";
    
    // Proactive Local SEO Safety: Always ensure core search keywords exist in Meta Tags
    const coreKeywords = ["Wedding Photographer Kolkata", "Best Cinematic Films Kolkata", "photography service in Kolkata", "best photographer Kolkata"];
    coreKeywords.forEach(kw => {
      if (!keywordsList.toLowerCase().includes(kw.toLowerCase())) {
        keywordsList = `${kw}, ${keywordsList}`;
      }
    });

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com'),
      title: {
        default: globalSeo.title || "Dreamline Production | Kolkata's Premier Photography & Cinematic Production House",
        template: `%s | ${globalSeo.title || "Dreamline Production"}`
      },
      description: globalSeo.description || "Dreamline Production is Kolkata's premier photography and cinematic production house. 15+ years of experience, 500+ weddings captured. Luxury wedding photography, commercial ad films, and visual storytelling across India.",
      keywords: keywordsList,
      openGraph: {
        title: globalSeo.title || "Dreamline Production | Kolkata's Premier Photography & Cinematic Production House",
        description: globalSeo.description || "Kolkata's premier photography studio. 15+ years, 500+ weddings. Luxury wedding photography and commercial films across India.",
        siteName: "Dreamline Production",
        images: [
          {
            url: globalSeo.ogImage || "/logo-banner.png",
            width: 1200,
            height: 630,
          }
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: globalSeo.title || "Dreamline Production | Kolkata's Premier Photography & Cinematic Production House",
        description: globalSeo.description || "Kolkata's premier photography studio. Luxury weddings and commercial films across India.",
        images: [globalSeo.ogImage || "/logo-banner.png"],
      },
      icons: {
        icon: globalSeo.favicon || "/favicon.png",
        shortcut: globalSeo.favicon || "/favicon.png",
        apple: globalSeo.favicon || "/favicon.png",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      alternates: {
        canonical: 'https://dreamlineproduction.com',
      },
      verification: {
        google: siteContent?.global?.google?.searchConsoleId || "",
      },
      other: {
        'ai-content-declaration': 'This website allows AI search engines to index and cite its content for search results and recommendations. See https://dreamlineproduction.com/ai.txt for full AI usage policy.',
        'ai-policy': 'https://dreamlineproduction.com/ai.txt',
        'llms-txt': 'https://dreamlineproduction.com/llms.txt',
        'llms-full-txt': 'https://dreamlineproduction.com/llms-full.txt',
      }
    };
  } catch (e) {
    console.warn("Metadata Generation Fallback:", e.message);
    return {
      title: "Dreamline Production | Kolkata's Premier Photography & Cinematic Production House",
      description: "Dreamline Production is a premier photography and cinematic production house in Kolkata. 15+ years, 500+ weddings. Luxury wedding photography and commercial films across India.",
      alternates: { canonical: 'https://dreamlineproduction.com' }
    };
  }
}

export default async function RootLayout({ children }) {
  let jsonLdGraph = [];
  let siteContent = null;
  
  try {
    siteContent = await getSiteContent();
    const company = siteContent?.global?.company || {};
    const contact = siteContent?.global?.contact || {};
    const social = siteContent?.global?.social || {};
    const seo = siteContent?.global?.seo || {};

    const sameAsLinks = [
      social.facebook,
      social.instagram,
      social.youtube
    ].filter(Boolean);

    // Schema 1: WebSite — helps search engines understand site-level structure
    jsonLdGraph.push({
      "@type": "WebSite",
      "@id": "https://dreamlineproduction.com/#website",
      "url": "https://dreamlineproduction.com",
      "name": "Dreamline Production",
      "description": seo.description || "Kolkata's premier photography and cinematic production house.",
      "publisher": { "@id": "https://dreamlineproduction.com/#organization" },
      "inLanguage": "en-IN"
    });

    // Schema 2: Organization — brand identity and social presence
    jsonLdGraph.push({
      "@type": "Organization",
      "@id": "https://dreamlineproduction.com/#organization",
      "name": "Dreamline Production",
      "alternateName": ["Dreamline Production House", "Dreamline Production Kolkata", "Dreamline Production House Kolkata", "Dreamline Kolkata"],
      "url": "https://dreamlineproduction.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dreamlineproduction.com/logo.png",
        "width": 512,
        "height": 512
      },
      "image": seo.ogImage || "https://dreamlineproduction.com/logo-banner.png",
      "description": "Dreamline Production is Kolkata's No.1 cinematic production house and best wedding photography studio in West Bengal. Founded by Rony Santra with 15+ years of experience, we are the top-rated production house in Kolkata offering corporate films, ad films, luxury wedding photography & cinematography, podcast production, line production, drone videography, 3D area mapping, 2D animation, and professional interview setups for news channels and agencies across India. Rated 4.9/5 on Google with 500+ weddings captured.",
      "foundingDate": "2010",
      "founder": {
        "@type": "Person",
        "name": "Rony Santra",
        "jobTitle": "Founder & Lead Cinematographer",
        "description": "Rony Santra is one of the best wedding photographers and cinematographers in Kolkata, West Bengal. With 15+ years in the industry, he founded Dreamline Production — now the top-rated production house in Kolkata.",
        "worksFor": { "@id": "https://dreamlineproduction.com/#organization" },
        "knowsAbout": ["Wedding Photography", "Cinematic Films", "Corporate Films", "Production House Management"]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": contact.phone || "+91 82400 54002",
        "contactType": "customer service",
        "email": contact.email || "support@dreamlineproduction.com",
        "availableLanguage": ["English", "Hindi", "Bengali"],
        "areaServed": "IN"
      },
      "sameAs": sameAsLinks,
      "slogan": "Kolkata's Premier Cinematic Production House — Best Wedding Photography & Corporate Films in West Bengal"
    });

    // Schema 3: ProfessionalService + PhotographyBusiness — main business entity
    // Multi-type ensures AI recognizes us for BOTH "production house" and "wedding photography" queries
    jsonLdGraph.push({
      "@type": ["ProfessionalService", "PhotographyBusiness", "ProductionCompany"],
      "@id": "https://dreamlineproduction.com/#business",
      "name": "Dreamline Production",
      "alternateName": [
        "Dreamline Production House",
        "Dreamline Production Kolkata",
        "Dreamline Wedding Photography",
        "Dreamline Production House Kolkata",
        "Best Production House Kolkata",
        "Best Wedding Photographer Kolkata"
      ],
      "image": seo.ogImage || "https://dreamlineproduction.com/logo-banner.png",
      "description": "Dreamline Production is the best production house in Kolkata and the top-rated wedding photography studio in West Bengal. Founded by Rony Santra with 15+ years of experience, we are Kolkata's No.1 cinematic production house offering luxury wedding photography, corporate films, ad films, podcast production, line production, drone videography, 3D area mapping, 2D animation, live streaming, and professional interview setups. Rated 4.9/5 on Google with 500+ weddings across India. Trusted by TATA Trust, L&T, Al Jazeera, ABP Network.",
      "url": "https://dreamlineproduction.com",
      "telephone": contact.phone || "+91 82400 54002",
      "email": contact.email || "support@dreamlineproduction.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": (contact.address || "").includes(", Kolkata") ? contact.address.split(", Kolkata")[0] : "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road",
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
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "opens": "09:00",
        "closes": "21:00"
      },
      "areaServed": [
        { "@type": "Country", "name": "India" },
        { "@type": "State", "name": "West Bengal" },
        { "@type": "City", "name": "Kolkata" },
        { "@type": "City", "name": "Howrah" },
        { "@type": "City", "name": "Salt Lake City" },
        { "@type": "City", "name": "New Town Kolkata" },
        { "@type": "City", "name": "Siliguri" },
        { "@type": "City", "name": "Durgapur" },
        { "@type": "City", "name": "Asansol" },
        { "@type": "City", "name": "Kharagpur" },
        { "@type": "City", "name": "Darjeeling" },
        { "@type": "City", "name": "Shantiniketan" },
        { "@type": "City", "name": "Digha" },
        { "@type": "City", "name": "Mandarmani" },
        { "@type": "City", "name": "Mumbai" },
        { "@type": "City", "name": "Delhi" },
        { "@type": "City", "name": "Goa" },
        { "@type": "City", "name": "Jaipur" },
        { "@type": "City", "name": "Bangalore" },
        { "@type": "City", "name": "Hyderabad" },
        { "@type": "City", "name": "Chennai" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Wedding Photography & Production House Services in Kolkata",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Best Wedding Photography in Kolkata — Luxury Cinematic Wedding Photography & Cinematography",
              "description": "Rated among the top 5 best wedding photographers in Kolkata. Cinematic wedding documentation with candid photography, storytelling, drone coverage, and premium editing. Serving all of West Bengal — Kolkata, Howrah, Salt Lake, New Town, Siliguri, Durgapur, Darjeeling. Both-side wedding packages start from ₹40,000 per day. 500+ weddings captured.",
              "url": "https://dreamlineproduction.com/luxury",
              "areaServed": ["Kolkata", "West Bengal", "India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Best Corporate Film Production House in Kolkata — Corporate Films & Ad Films",
              "description": "Kolkata's top-rated production house for corporate films, ad films, and brand campaigns. End-to-end production — concept, scripting, shooting, editing, and color grading. Trusted by TATA Trust, L&T, Carlsberg, BookMyShow. The best production house in West Bengal for commercial content.",
              "url": "https://dreamlineproduction.com/commercial",
              "areaServed": ["Kolkata", "West Bengal", "India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Podcast Production Studio in Kolkata",
              "description": "Kolkata's best podcast production studio — multi-camera recording, professional audio engineering, editing, and post-production for video podcasts. Professional studio setup available.",
              "areaServed": ["Kolkata", "West Bengal"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Line Production Services in Kolkata & Eastern India",
              "description": "Full line production services in Kolkata, West Bengal, and eastern India — crew hiring, location scouting, equipment, permits, and on-ground logistics for ad agencies, news channels, and international crews.",
              "areaServed": ["Kolkata", "West Bengal", "Eastern India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "News Channel Interview Setup in Kolkata",
              "description": "Professional interview setups in Kolkata for national and international news channels — Al Jazeera, ABP Network, TV Today. Broadcast-ready camera crews, lighting, and audio.",
              "areaServed": ["Kolkata", "West Bengal", "India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Drone Videography & 3D Mapping in Kolkata",
              "description": "Professional drone aerial shoots and 3D area mapping in Kolkata and West Bengal. DGCA-certified pilots. For real estate, construction, events, and cinematic projects.",
              "url": "https://dreamlineproduction.com/tech",
              "areaServed": ["Kolkata", "West Bengal", "India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "2D Animation & Motion Graphics Production in Kolkata",
              "description": "Best animation and motion graphics studio in Kolkata — explainer videos, animated logos, title sequences, and promotional animations for brands.",
              "url": "https://dreamlineproduction.com/tech",
              "areaServed": ["Kolkata", "West Bengal"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Pre-Wedding Photography in Kolkata & West Bengal",
              "description": "Creative pre-wedding photo and video shoots at stunning locations across Kolkata and West Bengal. Cinematic storytelling with drone shots.",
              "url": "https://dreamlineproduction.com/services/pre-wedding",
              "areaServed": ["Kolkata", "West Bengal", "India"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Event Coverage & Live Streaming in Kolkata",
              "description": "Professional event photography, conference coverage, and multi-camera live streaming services in Kolkata, West Bengal.",
              "areaServed": ["Kolkata", "West Bengal"],
              "provider": { "@id": "https://dreamlineproduction.com/#business" }
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "150",
        "reviewCount": "150"
      },
      "sameAs": sameAsLinks,
      "priceRange": "₹₹₹",
      "slogan": "Kolkata's No.1 Production House — Best Wedding Photography & Corporate Films in West Bengal",
      "knowsAbout": [
        "Best Wedding Photography in Kolkata",
        "Best Wedding Photographer Kolkata",
        "Top 5 Wedding Photographers in Kolkata",
        "Best Production House in Kolkata",
        "Production House in Kolkata",
        "Production House in West Bengal",
        "Best Cinematic Wedding Films Kolkata",
        "Wedding Photography West Bengal",
        "Wedding Cinematography Kolkata",
        "Candid Wedding Photography Kolkata",
        "Bengali Wedding Photography",
        "Destination Wedding Photographer Kolkata",
        "Pre-Wedding Photography Kolkata",
        "Corporate Films Kolkata",
        "Ad Film Production House Kolkata",
        "Best Ad Film Maker Kolkata",
        "Podcast Studio Kolkata",
        "Line Production Kolkata",
        "Drone Videography Kolkata",
        "3D Area Mapping Kolkata",
        "2D Animation Studio Kolkata",
        "Fashion Photography Kolkata",
        "Event Photography Kolkata",
        "Live Streaming Services Kolkata",
        "News Channel Interview Setup Kolkata",
        "Best Photographer in Kolkata",
        "Top Photography Studio Kolkata",
        "Wedding Planner Photography Kolkata",
        "Luxury Wedding Photography West Bengal",
        "Best Production House West Bengal",
        "Film Production Company Kolkata"
      ],
      "keywords": "best wedding photography Kolkata, production house in Kolkata, best production house in West Bengal, top 5 wedding photographer Kolkata, best cinematic wedding films Kolkata, wedding photography West Bengal, corporate film production Kolkata, ad film maker Kolkata, best photographer Kolkata, Bengali wedding photography, destination wedding photographer Kolkata, pre-wedding photography Kolkata"
    });

    // Schema 4: BreadcrumbList — site navigation hierarchy
    jsonLdGraph.push({
      "@type": "BreadcrumbList",
      "@id": "https://dreamlineproduction.com/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com" },
        { "@type": "ListItem", "position": 2, "name": "Luxury Weddings", "item": "https://dreamlineproduction.com/luxury" },
        { "@type": "ListItem", "position": 3, "name": "Commercial", "item": "https://dreamlineproduction.com/commercial" },
        { "@type": "ListItem", "position": 4, "name": "About", "item": "https://dreamlineproduction.com/about" },
        { "@type": "ListItem", "position": 5, "name": "Journal", "item": "https://dreamlineproduction.com/journal" },
        { "@type": "ListItem", "position": 6, "name": "Contact", "item": "https://dreamlineproduction.com/contact" },
        { "@type": "ListItem", "position": 7, "name": "FAQ", "item": "https://dreamlineproduction.com/faq" }
      ]
    });

  } catch (e) {
    console.warn("Schema Generation Fallback");
  }

  // Build the complete JSON-LD object
  const jsonLd = jsonLdGraph.length > 0
    ? { "@context": "https://schema.org", "@graph": jsonLdGraph }
    : { "@context": "https://schema.org", "@type": "WebSite", "name": "Dreamline Production", "url": "https://dreamlineproduction.com" };

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* AI Discoverability — Link tags for LLM and AI crawler discovery */}
        <link rel="ai-policy" href="https://dreamlineproduction.com/ai.txt" />
        <link rel="llms-txt" href="https://dreamlineproduction.com/llms.txt" />
        <link rel="llms-full-txt" href="https://dreamlineproduction.com/llms-full.txt" />
        <link rel="author" href="https://dreamlineproduction.com/about" />
        <meta name="ai-content-declaration" content="This website allows AI search engines to index and cite its content for search results and recommendations." />
        <meta name="ai-policy-url" content="https://dreamlineproduction.com/ai.txt" />
      </head>
      <body className={`${instrumentSans.variable} ${unbounded.variable} antialiased overflow-x-hidden`}>
        {/* Inline JSON-LD for immediate crawlability by Google and AI bots */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <ThemeProvider>
            <SmoothScroll>
              <MediaProtection />
              <AnalyticsTracker 
                gaId={siteContent?.global?.google?.analyticsId || "G-PVN6GR4RRK"} 
                adsId={siteContent?.global?.google?.adsConversionId}
                adsLabel={siteContent?.global?.google?.adsConversionLabel}
              />
              <PublicLayoutWrapper siteContent={siteContent}>
                {children}
              </PublicLayoutWrapper>
            </SmoothScroll>
          </ThemeProvider>
        </AuthProvider>

      </body>
    </html>
  );
}

