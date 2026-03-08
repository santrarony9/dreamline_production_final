"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const websites = [
    {
        id: 1,
        title: "Aura Aesthetics",
        category: "E-Commerce",
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200",
        url: "#",
    },
    {
        id: 2,
        title: "Nexus Financial",
        category: "Corporate",
        img: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200",
        url: "#",
    },
    {
        id: 3,
        title: "Luminex Studios",
        category: "Portfolio",
        img: "https://images.unsplash.com/photo-1507238692062-5a042e9e18c4?auto=format&fit=crop&w=1200",
        url: "#",
    },
    {
        id: 4,
        title: "Velocity Motors",
        category: "Automotive",
        img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200",
        url: "#",
    },
    {
        id: 5,
        title: "Noir Fashion",
        category: "Fashion & Retail",
        img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200",
        url: "#",
    },
    {
        id: 6,
        title: "Apex Fitness",
        category: "Health & Wellness",
        img: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200",
        url: "#",
    }
];

export default function TechPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            {/* Cinematic Hero */}
            <section ref={containerRef} className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/80 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000"
                        alt="Tech Background"
                        className="w-full h-full object-cover filter grayscale"
                    />
                </motion.div>

                <div className="relative z-10 text-center px-6 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.165, 0.84, 0.44, 1] }}
                    >
                        <p className="text-[#c5a059] text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mb-6">
                            DIGITAL PRODUCT STUDIO
                        </p>
                        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
                            TECH<span className="text-[#c5a059]">.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-400 font-medium">
                            Beyond cinematic filmmaking, Dreamline Production engineers high-performance digital experiences.
                            We design and develop premium websites that elevate brands to their peak potential.
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-[1px] h-20 bg-gradient-to-t from-[#c5a059] to-transparent" />
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white/10 pb-8 gap-4">
                    <h2 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                        Selected Works.
                    </h2>
                    <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2">
                        {websites.length} Projects Live
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    {websites.map((site, i) => (
                        <motion.div
                            key={site.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: i % 2 === 0 ? 0 : 0.2 }}
                            className="group relative"
                        >
                            <div
                                className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 relative mb-6 cursor-pointer"
                                data-cursor="VIEW SITE"
                            >
                                <motion.img
                                    src={site.img}
                                    alt={site.title}
                                    className="w-full h-full object-cover filter grayscale-[40%] brightness-75"
                                    whileHover={{ scale: 1.05, filter: "grayscale(0%) brightness(1.1)" }}
                                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>

                            <div className="flex justify-between items-start px-2">
                                <div>
                                    <h3 className="font-heading text-xl sm:text-2xl font-black uppercase text-white mb-2">{site.title}</h3>
                                    <p className="text-[#c5a059] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{site.category}</p>
                                </div>
                                <MagneticButton>
                                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors rotate-45 group-hover:rotate-0 duration-500">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </a>
                                </MagneticButton>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
