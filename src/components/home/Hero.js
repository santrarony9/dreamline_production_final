"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Hero({ content }) {
    const { titleLine1, titleLine2, subtitle, backgroundImage, cta1Text, cta1Link, cta2Text, cta2Link } = content || {};
    const containerRef = useRef(null);

    // Smooth Parallax for Marquee and Background
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const xText = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

    return (
        <section ref={containerRef} className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden">
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

                {backgroundImage && backgroundImage.endsWith('.mp4') ? (
                    <video
                        src={backgroundImage}
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
                ) : backgroundImage ? (
                    <Image
                        src={backgroundImage}
                        alt="Hero Background"
                        fill
                        priority
                        className="object-cover scale-110"
                        sizes="100vw"
                    />
                ) : null}
            </motion.div>


            <div className="container mx-auto px-6 relative z-20 text-center">
                {/* SEO: Primary h1 with target keyword — visually hidden but fully crawlable */}
                <h1 className="sr-only">Best Bengali Wedding Photographer In Kolkata</h1>

                <div className="overflow-hidden mb-4">
                    <p className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-[#c5a059] animate-fade-up">
                        {subtitle || "EST. 2010 • DREAMLINE PRODUCTION"}
                    </p>
                </div>

                <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black text-white leading-[1.1] md:leading-tight tracking-tighter mb-6 uppercase">
                    <span className="block reveal-text">
                        <span className="reveal-inner-anim inline-block">{titleLine1 || "VISIONARY"}</span>
                    </span>
                    <span className="block italic text-outline reveal-text">
                        <span className="reveal-inner-anim inline-block">{titleLine2 || "CINEMA."}</span>
                    </span>
                </h2>

                {/* SEO: 2-line descriptive content for on-page relevance */}
                <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto mb-10 leading-relaxed">
                    Dreamline Production is a leading wedding photography and videography studio in Kolkata, specializing in cinematic storytelling. From breathtaking wedding photography to professionally edited wedding films with advanced color grading and sound design, we preserve every emotion beautifully.
                </p>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <Link href={cta1Link || "/luxury"}>
                        <MagneticButton className="min-w-[220px] px-10 py-5 bg-[#c5a059] border border-transparent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500">
                            {cta1Text || "Explore Weddings"}
                        </MagneticButton>
                    </Link>
                    <Link href={cta2Link || "/commercial"}>
                        <MagneticButton className="min-w-[220px] px-10 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-500">
                            {cta2Text || "Commercial Works"}
                        </MagneticButton>
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <div className="w-[1px] h-20 bg-gradient-to-t from-[#c5a059] to-transparent" />
            </div>
        </section>
    );
}
