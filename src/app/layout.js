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
  await dbConnect();

  // Fetch global SEO from database
  const siteContent = await Content.findOne().lean();
  const globalSeo = siteContent?.global?.seo || {};

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com'),
    title: {
      default: globalSeo.title || "Dreamline Production | Best Wedding Photographer in Kolkata",
      template: `%s | ${globalSeo.title || "Dreamline Production"}`
    },
    description: globalSeo.description || "Dreamline Production is the leading wedding photographer and cinematic film house in Kolkata.",
    keywords: globalSeo.keywords || "Wedding Photographer Kolkata, Best Cinematic Films Kolkata, Luxury Wedding Photography Bengal",
    openGraph: {
      title: globalSeo.title || "Dreamline Production | Premier Photography & Cinema",
      description: globalSeo.description || "Capture your moments with Kolkata's finest production house.",
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
      title: globalSeo.title || "Dreamline Production | Premier Photography & Cinema",
      description: globalSeo.description || "Capture your moments with Kolkata's finest production house.",
      images: [globalSeo.ogImage || "/logo.png"],
    },
    icons: {
      icon: globalSeo.favicon || "/logo.svg",
      shortcut: globalSeo.favicon || "/logo.svg",
      apple: globalSeo.favicon || "/logo.svg",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

import Script from "next/script";

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Dreamline Production",
    "image": "https://dreamlineproduction.com/logo.png",
    "description": "Dreamline Production is a premier cinematic visual house in Kolkata, specializing in wedding photography, corporate films, and commercial storytelling.",
    "@id": "https://dreamlineproduction.com",
    "url": "https://dreamlineproduction.com",
    "telephone": "+919886679945",
    "email": "santrarony9@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Haridevpur",
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
    "sameAs": [
      "https://www.facebook.com/dreamlineproduction",
      "https://www.instagram.com/dreamlineproduction",
      "https://www.youtube.com/dreamlineproduction"
    ],
    "priceRange": "$$"
  };

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17805539120"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17805539120');
          `}
        </Script>
        {/* JSON-LD Structured Data */}
        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </head>
      <body className={`${instrumentSans.variable} ${unbounded.variable} antialiased overflow-x-hidden`}>
        <AuthProvider>
          <ThemeProvider>
            <SmoothScroll>
              <MediaProtection />
              {/* <AnalyticsTracker /> */}
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

