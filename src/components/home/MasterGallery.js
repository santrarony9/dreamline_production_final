"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

const AUTHENTIC_FALLBACK_IMAGES = [
    {
        src: "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
        title: "Sid & Trina - Luxury Bengali Wedding Ceremony",
        caption: "Sacred vows and floral garland exchange from Sid & Trina's luxury wedding film in Kolkata",
        category: "weddings",
        weddingId: "wedding-1771743825332",
        projectUrl: "/wedding/wedding-1771743825332"
    },
    {
        src: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        title: "Rajlaxmi & Mohit - Shubho Drishti Ceremony",
        caption: "Bride Rajlaxmi holding sacred betel leaves during traditional Shubho Drishti ritual in Kolkata",
        category: "weddings",
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    {
        src: "/thumbnails/seo_thumb_holud.jpg",
        title: "Diandra & Surjo - Heritage Mandap Sunset at Howrah",
        caption: "Royal heritage wedding celebration overlooking the iconic Howrah Bridge at golden hour sunset",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        src: "/thumbnails/seo_sindoor_daan.jpg",
        title: "Rajlaxmi & Mohit - Sacred Bengali Sindoor Daan",
        caption: "Sacred sindoor daan wedding ceremony before the holy Agni fire captured with warm ambient lighting",
        category: "weddings",
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    {
        src: "/thumbnails/seo_thumb_drishti.jpg",
        title: "Diandra & Surjo - Royal Heritage Mandap Embrace",
        caption: "Intimate black-and-white couple portrait under luxury floral wedding mandap",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        src: "/thumbnails/seo_thumb_1.jpg",
        title: "Diandra & Surjo - Palace Courtyard Mandap Celebration",
        caption: "Grand floral garland exchange under heritage palace courtyard mandap with festive illuminations",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        src: "/thumbnails/seo_thumb_2.jpg",
        title: "Diandra & Surjo - Cinematic Wedding Aisle Entry",
        caption: "Cinematographer tracking bride and groom aisle entrance with Ronin gimbal stabilizer",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        src: "/thumbnails/seo_thumb_11.jpg",
        title: "Diandra & Surjo - Royal Palace Heritage Estate at Twilight",
        caption: "Architectural twilight view of illuminated heritage palace courtyard and wedding reflection pool",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        src: "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
        title: "Cinematic Pre-Wedding Gimbal Shoot",
        caption: "On-location Ronin gimbal camera tracking shot during romantic outdoor couple pre-wedding film",
        category: "pre-wedding"
    },
    {
        src: "/thumbnails/prinsep-ghat.jpg",
        title: "Prinsep Ghat Monument Aerial Sweep",
        caption: "DGCA-certified drone aerial perspective over Vidyasagar Setu and Prinsep Ghat riverside memorial",
        category: "drone"
    },
    {
        src: "/thumbnails/banquets-kolkata.jpg",
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude certified drone view of luxury wedding banquet estate in Kolkata",
        category: "drone"
    },
    {
        src: "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg",
        title: "L&T Mobile Air Classifier Documentary",
        caption: "High-precision industrial documentary film for L&T Construction & Mining Machinery",
        category: "commercial"
    },
    {
        src: "https://img.youtube.com/vi/zFWNx12dg3c/maxresdefault.jpg",
        title: "TATA Genrobotics Bandicoot Film",
        caption: "Social robotics innovation documentary film produced for TATA Trusts",
        category: "commercial"
    },
    {
        src: "https://img.youtube.com/vi/UqnXM7lm4qE/maxresdefault.jpg",
        title: "Chandra Udyog Plant Cinematography",
        caption: "Industrial plant machinery operations and manufacturing corporate brand video",
        category: "commercial"
    },
    {
        src: "https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg",
        title: "Atlas Foundries Precision Shoot",
        caption: "Heavy casting and engineering foundry manufacturing commercial documentary",
        category: "commercial"
    }
];

const KNOWN_IMAGE_METADATA = {
    "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg": {
        title: "Sid & Trina - Luxury Bengali Wedding Ceremony",
        caption: "Sacred vows and floral garland exchange from Sid & Trina's luxury wedding film in Kolkata",
        category: "weddings",
        weddingId: "wedding-1771743825332",
        projectUrl: "/wedding/wedding-1771743825332"
    },
    "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg": {
        title: "Rajlaxmi & Mohit - Shubho Drishti Ceremony",
        caption: "Bride Rajlaxmi holding sacred betel leaves during traditional Shubho Drishti ritual in Kolkata",
        category: "weddings",
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    "/thumbnails/seo_thumb_holud.jpg": {
        title: "Diandra & Surjo - Heritage Mandap Sunset at Howrah",
        caption: "Royal heritage wedding celebration overlooking the iconic Howrah Bridge at golden hour sunset",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    "/thumbnails/seo_sindoor_daan.jpg": {
        title: "Rajlaxmi & Mohit - Sacred Bengali Sindoor Daan",
        caption: "Sacred sindoor daan wedding ceremony before the holy Agni fire",
        category: "weddings",
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg": {
        title: "Cinematic Pre-Wedding Gimbal Shoot",
        caption: "On-location Ronin gimbal tracking shot during romantic outdoor couple pre-wedding film",
        category: "pre-wedding"
    },
    "/thumbnails/seo_thumb_drishti.jpg": {
        title: "Diandra & Surjo - Royal Heritage Mandap Embrace",
        caption: "Intimate black-and-white couple portrait under luxury floral wedding mandap",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    "/thumbnails/seo_thumb_1.jpg": {
        title: "Diandra & Surjo - Palace Courtyard Mandap Celebration",
        caption: "Grand floral garland exchange under heritage palace courtyard mandap with festive illuminations",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    "/thumbnails/seo_thumb_2.jpg": {
        title: "Diandra & Surjo - Cinematic Wedding Aisle Entry",
        caption: "Cinematographer tracking bride and groom aisle entrance with Ronin gimbal stabilizer",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    "/thumbnails/seo_thumb_11.jpg": {
        title: "Diandra & Surjo - Royal Palace Heritage Estate at Twilight",
        caption: "Architectural twilight view of illuminated heritage palace courtyard and wedding reflection pool",
        category: "weddings",
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    "/thumbnails/prinsep-ghat.jpg": {
        title: "Prinsep Ghat Monument Aerial",
        caption: "Aerial sweep over Vidyasagar Setu and Prinsep Ghat riverside memorial",
        category: "drone"
    },
    "/thumbnails/banquets-kolkata.jpg": {
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude DGCA-certified drone view of luxury wedding banquet estate in Kolkata",
        category: "drone"
    },
    "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg": {
        title: "L&T Mobile Air Classifier Documentary",
        caption: "High-precision commercial documentary for L&T Construction & Mining Machinery",
        category: "commercial"
    },
    "https://img.youtube.com/vi/zFWNx12dg3c/maxresdefault.jpg": {
        title: "TATA Genrobotics Bandicoot Film",
        caption: "Documentary innovation film highlighting social robotics for TATA Trusts",
        category: "commercial"
    },
    "https://img.youtube.com/vi/UqnXM7lm4qE/maxresdefault.jpg": {
        title: "Chandra Udyog Factory Cinematography",
        caption: "Manufacturing plant process documentation and brand storytelling",
        category: "commercial"
    },
    "https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg": {
        title: "Atlas Foundries Precision Shoot",
        caption: "Heavy casting and foundry manufacturing commercial cinematography",
        category: "commercial"
    },
    "https://img.youtube.com/vi/8NpSypsTCbs/maxresdefault.jpg": {
        title: "L&T Breaking Barriers Corporate Film",
        caption: "Corporate brand cinema showcasing heavy machinery innovation and human stories",
        category: "commercial"
    },
    "https://img.youtube.com/vi/LynqHXnCqVg/maxresdefault.jpg": {
        title: "KSW Eco Saras Corporate Video",
        caption: "Brand story and sustainability profile film for KSW Eco Saras",
        category: "commercial"
    },
    "https://img.youtube.com/vi/F6dg5pDtC_U/maxresdefault.jpg": {
        title: "CONNEQT Kolkata Corporate Showcase",
        caption: "Modern corporate workspace cinematography and employee stories for CONNEQT Kolkata",
        category: "commercial"
    },
    "https://img.youtube.com/vi/naGtj-8iHuM/maxresdefault.jpg": {
        title: "Brut India News Documentary",
        caption: "In-depth documentary film covering human resilience and inspiring sports narratives",
        category: "commercial"
    },
    "https://img.youtube.com/vi/YCZNkMz9CS4/maxresdefault.jpg": {
        title: "TRT World International Feature",
        caption: "International news investigative feature documented on-location in Kolkata",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg": {
        title: "Live Broadcast Multi-Cam Control Room",
        caption: "Multi-camera live video mixing console and field broadcast desk",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg": {
        title: "ATEM Mini Multi-Camera Switcher",
        caption: "Live production switching rig and preview monitor during grand ceremony broadcast",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg": {
        title: "Sony Alpha 4K Multi-Track Podcast Recording",
        caption: "On-camera monitor feed during professional studio podcast interview recording",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg": {
        title: "Think Big Studio Talk Show Production",
        caption: "Full studio wide shot during multi-guest corporate interview and podcast production",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861480620-WhatsApp_Image_2026-.jpeg": {
        title: "Think Big Studio Talk Show Production",
        caption: "Full studio wide shot during multi-guest corporate interview and podcast production",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861489175-WhatsApp_Image_2026-.jpeg": {
        title: "Outdoor Documentary Dialogue Filming",
        caption: "Cinematographer filming natural garden documentary interview with directional audio",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861508628-WhatsApp_Image_2026-.jpeg": {
        title: "Executive Acoustic Studio Interview",
        caption: "Interior corporate interview capture with dedicated microphones and ambient styling",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861522772-WhatsApp_Image_2026-.jpeg": {
        title: "Live News & Documentary Field Filming",
        caption: "Gimbal-stabilized dynamic street documentary recording amidst high-energy crowd rally",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861531176-WhatsApp_Image_2026-.jpeg": {
        title: "High-Profile Broadcast Dialogue Production",
        caption: "Studio dialogue setup with broadcast microphones and reference field monitor",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861544533-WhatsApp_Image_2026-.jpeg": {
        title: "Broadcast Studio Multi-Light Setup",
        caption: "Comprehensive studio filming floor showing three-point softbox lighting and tripods",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861604584-WhatsApp_Image_2026-.jpeg": {
        title: "Location Commercial Film Filming",
        caption: "Field documentary crew directing landscape commercial shoot with monitor and gimbal",
        category: "commercial"
    },
    "https://backend.dreamlineproduction.com/uploads/1790861615934-WhatsApp_Image_2026-.jpeg": {
        title: "On-Location Investigative Video Journalism",
        caption: "Field video journalist and gimbal camera operator documenting live investigation",
        category: "commercial"
    }
};

export default function MasterGallery({ images = [] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Format input images into structured objects using verified metadata
    const baseItems = (images && images.length > 0) 
        ? images.map((img, i) => {
            if (typeof img === "object" && img !== null) {
                return img;
            }
            const url = img;
            const meta = KNOWN_IMAGE_METADATA[url] || AUTHENTIC_FALLBACK_IMAGES[i % AUTHENTIC_FALLBACK_IMAGES.length];
            return { 
                imageUrl: url, 
                title: meta.title, 
                caption: meta.caption, 
                category: meta.category 
            };
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
<div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused]">
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
                    <div className="flex flex-col gap-4 v-track-down group-hover:[animation-play-state:paused]">
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
                    <div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused]">
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
