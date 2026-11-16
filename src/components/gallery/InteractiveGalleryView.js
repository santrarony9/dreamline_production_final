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

export default function InteractiveGalleryView({ initialItems = [], counts = {}, weddingAlbums = [] }) {
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

            {/* Dedicated Wedding Albums Showcase (Featured in Weddings Category) */}
            {selectedCategory === "weddings" && weddingAlbums && weddingAlbums.length > 0 && (
                <div className="mb-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                        <div>
                            <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em] block mb-1">
                                Complete Couple Portfolios
                            </span>
                            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                                Published Wedding <span className="text-[#c5a059] italic">Albums</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                {weddingAlbums.length} Published Albums
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {weddingAlbums.map((album) => {
                            const albumSlug = album.weddingId || album.albumId;
                            const photoCount = Array.isArray(album.photos) 
                                ? album.photos.length 
                                : (album.photosCount || 1);

                            return (
                                <Link
                                    key={album.albumId || album.weddingId}
                                    href={`/wedding/${albumSlug}`}
                                    className="group relative rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-[#c5a059] transition-all duration-500 shadow-2xl flex flex-col hover:-translate-y-1"
                                >
                                    {/* Album Cover Container */}
                                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                                        <Image
                                            src={album.coverImage || "/thumbnails/seo_thumb_holud.jpg"}
                                            alt={`${album.title} Wedding Album by Dreamline Production`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover filter grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                            <span className="bg-black/80 backdrop-blur-md border border-[#c5a059]/40 text-[#c5a059] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                                Wedding Album
                                            </span>
                                        </div>

                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {photoCount} {photoCount === 1 ? 'Photograph' : 'Photographs'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-6 flex flex-col flex-1 justify-between bg-zinc-950/90">
                                        <div>
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-1">
                                                {album.location || "Kolkata, India"}
                                            </span>
                                            <h3 className="font-heading text-xl sm:text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#c5a059] transition-colors mb-2">
                                                {album.title}
                                            </h3>
                                            {album.subtitle && (
                                                <p className="text-gray-400 text-xs font-light line-clamp-2 leading-relaxed mb-4">
                                                    {album.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[#c5a059] text-[11px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                Open Album &amp; Photos &rarr;
                                            </span>
                                            <span className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#c5a059] group-hover:text-black flex items-center justify-center text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Section divider before individual ritual captures */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between mb-8">
                        <div>
                            <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em] block mb-1">
                                Curated Ritual Highlights
                            </span>
                            <h3 className="font-heading text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                                Sacred Moments &amp; <span className="text-[#c5a059] italic">Ceremonies</span>
                            </h3>
                        </div>
                    </div>
                </div>
            )}

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
