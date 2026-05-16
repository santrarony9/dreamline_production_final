import { Instrument_Sans, Unbounded } from "next/font/google";
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

export async function generateMetadata() {
  try {
    const conn = await dbConnect();
    if (!conn) throw new Error("No DB connection");

    // Fetch global SEO from database
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com'),
      title: {
        default: globalSeo.title || "Dreamline Production | The Art of Cinematic Storytelling",
        template: `%s | ${globalSeo.title || "Dreamline Production"}`
      },
      description: globalSeo.description || "Kolkata's premier cinematic house. Specializing in luxury weddings and commercial films across India. Preserving emotions through a visionary lens.",
      keywords: globalSeo.keywords || "Wedding Photographer Kolkata, Best Cinematic Films Kolkata, Luxury Wedding Photography Bengal",
      openGraph: {
        title: globalSeo.title || "Dreamline Production | The Art of Cinematic Storytelling",
        description: globalSeo.description || "Kolkata's premier cinematic house. Specializing in luxury weddings and commercial films across India.",
        siteName: "Dreamline Production",
        images: [
          {
            url: globalSeo.ogImage || "/logo.png",
            width: 1200,
            height: 630,
          }
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: globalSeo.title || "Dreamline Production | The Art of Cinematic Storytelling",
        description: globalSeo.description || "Kolkata's premier cinematic house specializing in luxury weddings and commercial films.",
        images: [globalSeo.ogImage || "/logo.png"],
      },
      icons: {
        icon: globalSeo.favicon || "/favicon.png",
        shortcut: globalSeo.favicon || "/favicon.png",
        apple: globalSeo.favicon || "/favicon.png",
      },
      robots: {
        index: process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com',
        follow: true,
        googleBot: {
          index: process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com',
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
      title: "Dreamline Production | International Wedding Photographer & Cinema",
      description: "Dreamline Production is a premier production house in Kolkata providing luxury wedding photography and cinematic films globally.",
      alternates: { canonical: 'https://dreamlineproduction.com' }
    };
  }
}

import Script from "next/script";

export default async function RootLayout({ children }) {
  let jsonLd = {};
  
  try {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const company = siteContent?.global?.company || {};
    const contact = siteContent?.global?.contact || {};
    const social = siteContent?.global?.social || {};
    const seo = siteContent?.global?.seo || {};

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Dreamline Production",
      "image": seo.ogImage || "https://dreamlineproduction.com/logo.png",
      "description": seo.description || "Dreamline Production is a premier cinematic visual house in Kolkata.",
      "@id": "https://dreamlineproduction.com",
      "url": "https://dreamlineproduction.com",
      "telephone": contact.phone || "+91 82400 54002",
      "email": contact.email || "info.dreamlineproduction@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": contact.address?.split('.')[0] || "85 Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "postalCode": "700082",
        "addressCountry": "IN"
      },
      "serviceArea": {
        "@type": "Country",
        "name": "India"
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
      "sameAs": [
        social.facebook,
        social.instagram,
        social.youtube
      ].filter(Boolean),
      "priceRange": "₹₹₹"
    };
  } catch (e) {
    console.warn("Schema Generation Fallback");
  }

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="google-site-verification" content="O9Fv4kQ5G9No4pKGwO90np7zJNinRSHA3Yt2Ap006Q0" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; frame-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;" />
        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </head>
      <body className={`${instrumentSans.variable} ${unbounded.variable} antialiased overflow-x-hidden`}>
        <AuthProvider>
          <ThemeProvider>
            <SmoothScroll>
              <MediaProtection />
              <AnalyticsTracker />
              <PublicLayoutWrapper>
                {children}
              </PublicLayoutWrapper>
            </SmoothScroll>
          </ThemeProvider>
        </AuthProvider>

      </body>
    </html>
  );
}

