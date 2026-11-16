"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

const AUTHENTIC_FALLBACK_IMAGES = [
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg",
        title: "Candid Bengali Bridal Portrait",
        caption: "Emotional candid bridal portrait during wedding preparations in Kolkata",
        category: "weddings"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg",
        title: "Royal Couple Evening Reception",
        caption: "Luxury couple portrait during grand evening wedding reception",
        category: "weddings"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
        title: "Sunset at Prinsep Ghat",
        caption: "Romantic pre-wedding couple photoshoot at historic Prinsep Ghat Kolkata",
        category: "pre-wedding"
    },
    {
        src: "/thumbnails/seo_sindoor_daan.jpg",
        title: "Traditional Sindoor Daan Ritual",
        caption: "Traditional sindoor daan wedding ceremony captured with cinematic lighting",
        category: "rituals"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg",
        title: "Intimate Heritage Narrative",
        caption: "Intimate pre-wedding destination narrative amidst historic heritage architecture",
        category: "pre-wedding"
    },
    {
        src: "/thumbnails/seo_thumb_drishti.jpg",
        title: "Shubho Drishti Ceremony",
        caption: "Traditional auspicious Shubho Drishti betel leaf ceremony captured candidly",
        category: "rituals"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg",
        title: "Golden Hour Couple Portrait",
        caption: "Cinematic bride and groom golden hour portrait in Kolkata",
        category: "weddings"
    },
    {
        src: "/thumbnails/seo_thumb_holud.jpg",
        title: "Vibrant Gaye Holud Moments",
        caption: "Vibrant haldi ceremony moments filled with genuine laughter and family celebrations",
        category: "rituals"
    },
    {
        src: "/thumbnails/seo_saat_paak.jpg",
        title: "Saat Paak Sacred Circles",
        caption: "Seven sacred circumambulations of Saat Paak wedding ritual",
        category: "rituals"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861480620-WhatsApp_Image_2026-.jpeg",
        title: "Sacred Garland Exchange Vows",
        caption: "Cinematic wedding vows and exchange of floral garlands ritual in Kolkata",
        category: "rituals"
    },
    {
        src: "/thumbnails/seo_bridal_makeup.jpg",
        title: "Bridal Preparation Artistry",
        caption: "Meticulous bridal preparation with traditional Benarasi saree and sandalwood art",
        category: "weddings"
    },
    {
        src: "/thumbnails/banquets-kolkata.jpg",
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude DGCA-certified drone view of luxury wedding banquet estate in Kolkata",
        category: "drone"
    }
];

export default function MasterGallery({ images = [] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Format input images into structured objects
    const baseItems = (images && images.length >= 6) 
        ? images.map((img, i) => {
            const fallback = AUTHENTIC_FALLBACK_IMAGES[i % AUTHENTIC_FALLBACK_IMAGES.length];
            return typeof img === "string" 
                ? { 
                    imageUrl: img, 
                    title: fallback.title, 
                    caption: fallback.caption, 
                    category: fallback.category 
                  }
                : img;
        })
        : AUTHENTIC_FALLBACK_IMAGES.map(item => ({ ...item, imageUrl: item.src }));

    // Filter by selected category
    const activeItems = selectedCategory === "all"
        ? baseItems
        : baseItems.filter(item => item.category === selectedCategory);

    // Hash routing for lightbox back-button support
    useEffect(() => {
        const handleHashChange = () => {
            if (typeof window !== "undefined" && !window.location.hash.includes("mastergallery")) {
                setLightboxIndex(null);
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        if (typeof window !== "undefined" && !window.location.hash.includes("mastergallery")) {
            window.location.hash = "mastergallery";
        }
    };

    const closeLightbox = () => {
        if (typeof window !== "undefined" && window.location.hash.includes("mastergallery")) {
            window.history.back();
        } else {
            setLightboxIndex(null);
        }
    };

    const nextImage = () => {
        if (lightboxIndex === null || activeItems.length === 0) return;
        setLightboxIndex((prev) => (prev + 1) % activeItems.length);
    };

    const prevImage = () => {
        if (lightboxIndex === null || activeItems.length === 0) return;
        setLightboxIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
    };

    // Split active items into 3 columns for seamless vertical parallax
    const col1 = activeItems.filter((_, i) => i % 3 === 0);
    const col2 = activeItems.filter((_, i) => i % 3 === 1);
    const col3 = activeItems.filter((_, i) => i % 3 === 2);

    const getSeamlessArray = (arr) => {
        if (arr.length === 0) return [];
        if (arr.length < 3) return [...arr, ...arr, ...arr, ...arr];
        return [...arr, ...arr];
    };

    const categories = [
        { key: "all", label: "All Archives" },
        { key: "weddings", label: "Weddings" },
        { key: "pre-wedding", label: "Pre-Wedding" },
        { key: "rituals", label: "Traditional Rituals" }
    ];

    return (
        <section className="bg-[#050505] border-t border-white/5 py-16 md:py-32 overflow-hidden relative">
            <div className="container mx-auto px-6 md:px-12 mb-8 md:mb-14 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
                            The Master Visual Archive
                        </span>
                        <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-black uppercase tracking-tighter leading-[0.88] mb-4">
                            MASTER<br /><span className="text-[#c5a059]">GALLERY.</span>
                        </h2>
                        <p className="text-gray-400 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                            A multi-dimensional archive of emotion, light, and motion. Click any frame to explore full-screen portraits and ceremony rituals.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Homepage Category Filter Pills */}
                        <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-full border border-white/10">
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.key)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                            isActive
                                                ? "bg-[#c5a059] text-black shadow-md"
                                                : "text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Direct Link to Complete Archive */}
                        <Link
                            href="/gallery/"
                            className="px-6 py-2.5 rounded-full border border-[#c5a059]/40 hover:border-[#c5a059] text-[#c5a059] hover:text-black hover:bg-[#c5a059] text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shadow-lg flex items-center gap-2 group"
                        >
                            <span>Full Archive</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Vertical Scroll Tracks */}
            <div className="h-[60vh] md:h-[70vh] flex gap-4 md:gap-6 px-4 md:px-12 mt-6 md:mt-12 group relative">
                {/* Gradient Fades for Top/Bottom */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />

                {/* Column 1 - Tracks Up */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col1).map((item, i) => {
                            const originalIdx = activeItems.findIndex(x => (x.imageUrl || x.src) === (item.imageUrl || item.src));
                            const targetIdx = originalIdx >= 0 ? originalIdx : 0;
                            return (
                                <div
                                    key={`c1-${i}`}
                                    onClick={() => openLightbox(targetIdx)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(targetIdx); }}
                                    aria-label={`View expanded image: ${item.title}`}
                                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] group/card shadow-xl"
                                >
                                    <Image 
                                        src={item.imageUrl || item.src} 
                                        fill 
                                        sizes="(max-width: 768px) 50vw, 33vw" 
                                        className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" 
                                        alt={item.caption || item.title || "Dreamline Production Master Gallery"} 
                                        loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <span className="text-[#c5a059] text-[8px] font-black uppercase tracking-widest">{item.category}</span>
                                        <p className="text-white text-xs font-bold uppercase truncate">{item.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Column 2 - Tracks Down */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden pt-12 md:pt-20">
                    <div className="flex flex-col gap-4 v-track-down group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col2.length > 0 ? col2 : col1).map((item, i) => {
                            const originalIdx = activeItems.findIndex(x => (x.imageUrl || x.src) === (item.imageUrl || item.src));
                            const targetIdx = originalIdx >= 0 ? originalIdx : 0;
                            return (
                                <div
                                    key={`c2-${i}`}
                                    onClick={() => openLightbox(targetIdx)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(targetIdx); }}
                                    aria-label={`View expanded image: ${item.title}`}
                                    className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] group/card shadow-xl"
                                >
                                    <Image 
                                        src={item.imageUrl || item.src} 
                                        fill 
                                        sizes="(max-width: 768px) 50vw, 33vw" 
                                        className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" 
                                        alt={item.caption || item.title || "Dreamline Production Master Gallery"} 
                                        loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <span className="text-[#c5a059] text-[8px] font-black uppercase tracking-widest">{item.category}</span>
                                        <p className="text-white text-xs font-bold uppercase truncate">{item.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Column 3 - Tracks Up */}
                <div className="hidden sm:flex flex-1 flex-col gap-4 overflow-hidden pt-6 md:pt-10">
                    <div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col3.length > 0 ? col3 : col1).map((item, i) => {
                            const originalIdx = activeItems.findIndex(x => (x.imageUrl || x.src) === (item.imageUrl || item.src));
                            const targetIdx = originalIdx >= 0 ? originalIdx : 0;
                            return (
                                <div
                                    key={`c3-${i}`}
                                    onClick={() => openLightbox(targetIdx)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(targetIdx); }}
                                    aria-label={`View expanded image: ${item.title}`}
                                    className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c5a059] group/card shadow-xl"
                                >
                                    <Image 
                                        src={item.imageUrl || item.src} 
                                        fill 
                                        sizes="(max-width: 768px) 50vw, 33vw" 
                                        className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" 
                                        alt={item.caption || item.title || "Dreamline Production Master Gallery"} 
                                        loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <span className="text-[#c5a059] text-[8px] font-black uppercase tracking-widest">{item.category}</span>
                                        <p className="text-white text-xs font-bold uppercase truncate">{item.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Interactive Lightbox */}
            <GalleryLightbox
                isOpen={lightboxIndex !== null}
                images={activeItems}
                currentIndex={lightboxIndex || 0}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
                onSelectIndex={(idx) => setLightboxIndex(idx)}
            />
        </section>
    );
}
