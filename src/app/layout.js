import { Instrument_Sans, Unbounded } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthProvider from "@/context/AuthProvider";
import CustomCursor from "@/components/CustomCursor";
import VideoModal from "@/components/VideoModal";
import AnalyticsTracker from "@/components/AnalyticsTracker";
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${instrumentSans.variable} ${unbounded.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <ThemeProvider>
            <AnalyticsTracker />
            <CustomCursor />
            <VideoModal />
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>

        {/* Custom Cursor Dot & Outline */}
        <div id="cursor-dot"></div>
        <div id="cursor-outline"></div>
      </body>
    </html>
  );
}
