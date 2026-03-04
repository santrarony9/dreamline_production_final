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

export const metadata = {
  title: "Dreamline Production | Best Wedding Photographer in Kolkata",
  description: "Dreamline Production is the leading wedding photographer and cinematic film house in Kolkata. Specializing in luxury weddings, commercial visuals, and emotional storytelling since 2010.",
  keywords: "Wedding Photographer Kolkata, Best Cinematic Films Kolkata, Luxury Wedding Photography Bengal, Dreamline Production, Commercial Video Production Kolkata, Tilottama Plaza Studio",
  openGraph: {
    title: "Dreamline Production | Premier Photography & Cinema",
    description: "Capture your moments with Kolkata's finest production house.",
    images: ["/logo.png"],
    url: "https://dreamlineproduction.in",
  },
};

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
