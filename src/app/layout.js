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
      "url": "https://dreamlineproduction.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dreamlineproduction.com/logo.png",
        "width": 512,
        "height": 512
      },
      "image": seo.ogImage || "https://dreamlineproduction.com/logo-banner.png",
      "description": "Dreamline Production is Kolkata's premier cinematic production house, founded by Rony Santra. With 15+ years of experience, we offer corporate films, ad films, luxury wedding photography, podcast production, line production, drone videography, 3D area mapping, 2D animation, and professional interview setups for news channels and agencies across India.",
      "foundingDate": "2010",
      "founder": {
        "@type": "Person",
        "name": "Rony Santra",
        "jobTitle": "Founder & Lead Cinematographer"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": contact.phone || "+91 82400 54002",
        "contactType": "customer service",
        "email": contact.email || "support@dreamlineproduction.com",
        "availableLanguage": ["English", "Hindi", "Bengali"],
        "areaServed": "IN"
      },
      "sameAs": sameAsLinks
    });

    // Schema 3: ProfessionalService (LocalBusiness subtype) — main business entity
    jsonLdGraph.push({
      "@type": "ProfessionalService",
      "@id": "https://dreamlineproduction.com/#business",
      "name": "Dreamline Production",
      "image": seo.ogImage || "https://dreamlineproduction.com/logo-banner.png",
      "description": "Dreamline Production is Kolkata's premier cinematic production house. We offer corporate films, ad films, luxury wedding photography & cinematography, podcast production, line production for agencies and channels, drone videography, 3D area mapping, 2D animation, live streaming, and professional interview setups for news channels like Al Jazeera, ABP Network, and TV Today. 15+ years of experience across India.",
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
      "serviceArea": [
        { "@type": "Country", "name": "India" },
        { "@type": "City", "name": "Kolkata" },
        { "@type": "State", "name": "West Bengal" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Photography & Production Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Luxury Wedding Photography & Cinematography",
              "description": "Cinematic wedding documentation with candid photography, storytelling, drone coverage, and premium editing. Both-side wedding packages start from ₹40,000 per day.",
              "url": "https://dreamlineproduction.com/luxury"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Films & Ad Films",
              "description": "End-to-end corporate film production — concept, scripting, shooting, editing, and color grading. Ad campaigns, brand films, product videos, and corporate documentaries.",
              "url": "https://dreamlineproduction.com/commercial"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Podcast Production",
              "description": "Complete podcast production services including multi-camera recording, professional audio engineering, editing, and post-production for video podcasts."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Line Production",
              "description": "Full line production services in Kolkata and eastern India — crew hiring, location scouting, equipment, permits, and on-ground logistics for ad agencies, news channels, and international crews."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "News Channel & Agency Interviews",
              "description": "Professional interview setups for national and international news channels and media agencies. Broadcast-ready camera crews, lighting, and audio. Worked with Al Jazeera, ABP Network, TV Today."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Drone Videography & 3D Area Mapping",
              "description": "Professional drone aerial shoots, 3D area mapping for construction and real estate, drone surveys, and cinematic aerial footage with DGCA-certified pilots.",
              "url": "https://dreamlineproduction.com/tech"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "2D Animation & Motion Graphics",
              "description": "2D motion graphics, explainer videos, animated logos, title sequences, and promotional animations for brands and businesses.",
              "url": "https://dreamlineproduction.com/tech"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Event Coverage & Live Streaming",
              "description": "Professional event photography, conference coverage, corporate headshots, and live streaming & broadcast services."
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
      "knowsAbout": [
        "Corporate Films",
        "Ad Films",
        "Wedding Photography",
        "Cinematic Wedding Films",
        "Podcast Production",
        "Line Production",
        "Drone Videography",
        "3D Area Mapping",
        "2D Animation",
        "Motion Graphics",
        "News Channel Interviews",
        "Live Streaming",
        "Corporate Event Coverage",
        "Fashion Photography",
        "Brand Photography"
      ]
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

