"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Hero({ content }) {
    const { titleLine1, titleLine2, subtitle, backgroundImage, cta1Text, cta1Link, cta2Text, cta2Link } = content || {};
    const containerRef = useRef(null);

    // Use a cinematic wedding-themed fallback — never show generic stock photos
    // This image shows a bride/groom in golden light — matches brand identity
    const DEFAULT_HERO_IMAGE = "https://backend.dreamlineproduction.com/uploads/hero-default.jpg";
    const SAFE_FALLBACK = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80";
    const isCorporateBuilding = backgroundImage && (
        backgroundImage.includes("1790056541863") || 
        backgroundImage.includes("DREAMLINE-PRODUCTION-IMAGE-1") ||
        backgroundImage.includes("1492691527719") // mountain hiker — wrong image
    );
    const activeBackground = (!backgroundImage || isCorporateBuilding) ? SAFE_FALLBACK : backgroundImage;
    const activeSubtitle = (subtitle && subtitle !== "Loading Experience") ? subtitle : "EST. 2010 • DREAMLINE PRODUCTION";

    // Cleanly replace old legacy headings if encountered and fallback to specified hero heading
    const isLegacyLine1 = !titleLine1 || titleLine1 === "CINEMATIC MASTER" || titleLine1 === "Visionary" || titleLine1 === "VISIONARY";
    const isLegacyLine2 = !titleLine2 || titleLine2 === "Cinema" || titleLine2 === "CINEMA" || titleLine2 === "CINEMA." || titleLine2 === "Cinema.";
    
    const activeLine1 = isLegacyLine1 ? "Photography & Videography" : titleLine1;
    const activeLine2 = isLegacyLine2 ? "Production House in Kolkata" : titleLine2;

    // Smooth Parallax for Marquee and Background
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const xText = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

    return (
        <section ref={containerRef} className="relative min-h-[100svh] w-full flex flex-col justify-center items-center overflow-hidden py-24 sm:py-28 md:py-32 lg:py-36">
            {/* Background Media with Parallax */}
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />

                {/* Kinetic Scrolling Text */}
                <div className="absolute top-1/2 left-0 w-[200%] -translate-y-1/2 overflow-hidden pointer-events-none z-0 opacity-10 select-none">
                    <motion.div style={{ x: xText }} className="flex whitespace-nowrap animate-scroll-left">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <span className="font-heading text-[20vw] font-black text-outline-thin mx-20">CINEMATIC</span>
                                <span className="font-heading text-[20vw] font-black text-outline-thin mx-20">PRODUCTION</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {activeBackground && activeBackground.endsWith('.mp4') ? (
                    <video
                        src={activeBackground}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/logo-banner.jpg"
                        preload="metadata"
                        controlsList="nodownload"
                        disablePictureInPicture
                        className="h-full w-full object-cover scale-110"
                    />
                ) : activeBackground ? (
                    <Image
                        src={activeBackground}
                        alt="Dreamline Production cinematic wedding photography studio Kolkata"
                        fill
                        priority
                        className="object-cover scale-110"
                        sizes="100vw"
                    />
                ) : null}
            </motion.div>


            <div className="container mx-auto px-6 relative z-20 text-center my-auto">

                <div className="overflow-hidden mb-4">
                    <p className="text-xs md:text-sm font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] text-[#c5a059] animate-fade-up">
                        {activeSubtitle}
                    </p>
                </div>

                <h1 className="home-hero-title font-heading font-black leading-[1.12] sm:leading-[1.1] tracking-tight mb-6 uppercase break-words mx-auto pb-2 max-w-6xl">
                    <span className="block reveal-text text-white py-0.5">
                        <span className="reveal-inner-anim inline-block">
                            {activeLine1}
                        </span>
                    </span>
                    <span className="block reveal-text text-[#c5a059] mt-1 sm:mt-2 py-0.5">
                        <span className="reveal-inner-anim inline-block">
                            {activeLine2}
                        </span>
                    </span>
                </h1>

                {/* SEO: 2-line descriptive content for on-page relevance */}
                <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-normal">
                    Dreamline Production is a leading wedding photography and videography studio in Kolkata, specializing in cinematic storytelling. From breathtaking wedding photography to professionally edited wedding films with advanced color grading and sound design, we preserve every emotion beautifully.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pb-4">
                    <Link href={cta1Link || "/luxury"}>
                        <MagneticButton className="min-w-[200px] sm:min-w-[220px] px-8 sm:px-10 py-4 sm:py-5 bg-[#c5a059] border border-transparent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500">
                            {cta1Text || "Explore Weddings"}
                        </MagneticButton>
                    </Link>
                    <Link href={cta2Link || "/commercial"}>
                        <MagneticButton className="min-w-[200px] sm:min-w-[220px] px-8 sm:px-10 py-4 sm:py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-500">
                            {cta2Text || "Commercial Works"}
                        </MagneticButton>
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator - Safely positioned below or hidden on short screens */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none hidden sm:block opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-[1px] h-12 md:h-16 bg-gradient-to-t from-[#c5a059] to-transparent" />
            </div>
        </section>
    );
}
