"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

const CATEGORIES = [
    { key: "all", label: "All Archives" },
    { key: "weddings", label: "Weddings" },
    { key: "pre-wedding", label: "Pre-Wedding" },
    { key: "rituals", label: "Traditional Rituals" },
    { key: "commercial", label: "Commercial" },
    { key: "drone", label: "Drone & Aerial" }
];

export default function InteractiveGalleryView({ initialItems = [], counts = {} }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const filteredItems = selectedCategory === "all"
        ? initialItems
        : initialItems.filter(item => item.category === selectedCategory);

    // Hash routing for lightbox back-button support
    useEffect(() => {
        const handleHashChange = () => {
            if (typeof window !== "undefined" && !window.location.hash.includes("lightbox")) {
                setLightboxIndex(null);
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        if (typeof window !== "undefined" && !window.location.hash.includes("lightbox")) {
            window.location.hash = "lightbox";
        }
    };

    const closeLightbox = () => {
        if (typeof window !== "undefined" && window.location.hash.includes("lightbox")) {
            window.history.back();
        } else {
            setLightboxIndex(null);
        }
    };

    const nextImage = () => {
        if (lightboxIndex === null || filteredItems.length === 0) return;
        setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
    };

    const prevImage = () => {
        if (lightboxIndex === null || filteredItems.length === 0) return;
        setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };

    return (
        <section className="w-full">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
                {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.key;
                    const count = counts[cat.key] !== undefined 
                        ? counts[cat.key] 
                        : (cat.key === "all" ? initialItems.length : initialItems.filter(i => i.category === cat.key).length);

                    return (
                        <button
                            key={cat.key}
                            type="button"
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border select-none ${
                                isActive
                                    ? "bg-[#c5a059] text-black border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.35)] scale-105"
                                    : "bg-white/[0.03] text-gray-400 border-white/10 hover:border-[#c5a059]/40 hover:text-white"
                            }`}
                        >
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isActive ? "bg-black/20 text-black" : "bg-white/5 text-gray-500"
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Gallery Masonry / Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-24 border border-white/5 rounded-3xl bg-white/[0.01]">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                        No production captures found in this category.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, index) => {
                            const isHorizontal = item.aspectRatio === "horizontal";
                            const targetProjectUrl = item.projectUrl || (item.weddingId ? `/wedding/${item.weddingId}` : (
                                item.category === "weddings" ? (
                                    item.title?.toLowerCase().includes("sid") ? "/wedding/wedding-1771743825332" :
                                    item.title?.toLowerCase().includes("diandra") || item.title?.toLowerCase().includes("surjo") ? "/wedding/zamindar-soul" :
                                    item.title?.toLowerCase().includes("rajlaxmi") || item.title?.toLowerCase().includes("mohit") ? "/wedding/wedding-1778663588915" : ""
                                ) : ""
                            ));

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                    key={item._id || item.imageUrl || index}
                                    onClick={() => openLightbox(index)}
                                    className={`group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 hover:border-[#c5a059]/40 cursor-pointer transition-all duration-500 shadow-xl ${
                                        isHorizontal ? "aspect-video sm:col-span-2 lg:col-span-2" : "aspect-[4/5]"
                                    }`}
                                >
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.altText || item.title || "Dreamline Production Gallery"}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                        className="object-cover filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                        loading={index < 8 ? "eager" : "lazy"}
                                    />

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                    {/* Category Pill Badge on Card */}
                                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                        <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[#c5a059] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            {item.category}
                                        </span>
                                    </div>

                                    {/* Hover Eye View Indicator */}
                                    <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                        <svg className="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>

                                    {/* Bottom Title & Caption Box */}
                                    <div className="absolute bottom-0 inset-x-0 p-6 z-10 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white font-heading text-lg font-black uppercase tracking-tight group-hover:text-[#c5a059] transition-colors duration-300 line-clamp-1 mb-1">
                                            {item.title}
                                        </h3>
                                        {item.caption && (
                                            <p className="text-gray-400 text-xs line-clamp-2 font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                {item.caption}
                                            </p>
                                        )}
                                        {targetProjectUrl && (
                                            <div className="mt-3 flex items-center">
                                                <Link
                                                    href={targetProjectUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-wider hover:bg-white transition-all shadow-md"
                                                >
                                                    <span>View Story &amp; Gallery</span>
                                                    <span>&rarr;</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Interactive Luxury Lightbox */}
            <GalleryLightbox
                isOpen={lightboxIndex !== null}
                images={filteredItems}
                currentIndex={lightboxIndex || 0}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
                onSelectIndex={(idx) => setLightboxIndex(idx)}
            />
        </section>
    );
}
