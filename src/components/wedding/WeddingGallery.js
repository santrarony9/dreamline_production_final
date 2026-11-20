"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function WeddingGallery({ images = [], altTexts = [], captions = [] }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const DEFAULT_WEDDING_ALTS = [
        "Candid emotional wedding moment captured during ceremony in Kolkata",
        "Traditional wedding rituals documentation by Dreamline Production",
        "Intimate couple portrait with cinematic lighting in Kolkata",
        "Bridal preparation and candid ceremony photography",
        "Sindoor daan and sacred wedding vows in Kolkata",
        "Grand reception celebration and wedding couple photography"
    ];

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImage(images[index]);
        if (typeof document !== "undefined") {
            document.body.style.overflow = "hidden";
        }
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        if (typeof document !== "undefined") {
            document.body.style.overflow = "auto";
        }
    };

    const nextImage = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (images.length === 0) return;
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (images.length === 0) return;
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    // Mobile touch swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diffX = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (diffX > minSwipeDistance) {
            nextImage();
        } else if (diffX < -minSwipeDistance) {
            prevImage();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Handle ESC key and arrow keys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage(e);
            if (e.key === "ArrowLeft") prevImage(e);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, images]);

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-20 border border-white/5 rounded-3xl bg-zinc-950/50">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                    No photographs uploaded for this wedding album yet.
                </p>
            </div>
        );
    }

    const currentAlt = altTexts[currentIndex] || DEFAULT_WEDDING_ALTS[currentIndex % DEFAULT_WEDDING_ALTS.length];
    const currentCaption = captions[currentIndex] || "";

    return (
        <>
            {/* 3-Column Responsive Masonry Layout */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((img, index) => {
                    const itemAlt = altTexts[index] || DEFAULT_WEDDING_ALTS[index % DEFAULT_WEDDING_ALTS.length];
                    const itemCaption = captions[index] || "";

                    return (
                        <div key={index} className="break-inside-avoid wedding-item-wrapper">
                            <noscript>
                                <style>{`.wedding-item-wrapper .wedding-item-motion { opacity: 1 !important; transform: none !important; }`}</style>
                            </noscript>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: (index % 6) * 0.05 }}
                                viewport={{ once: true }}
                                className="wedding-item-motion rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-white/5 hover:border-[#c5a059]/40 bg-zinc-900 group relative cursor-pointer shadow-xl"
                                onClick={() => openLightbox(index)}
                            >
                                <Image
                                    src={img}
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                                    alt={itemAlt}
                                    loading={index < 6 ? "eager" : "lazy"}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />

                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                                    <div className="self-end">
                                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                                            <svg className="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {(itemCaption || itemAlt) && (
                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            {itemCaption && (
                                                <p className="text-[#c5a059] text-xs font-bold uppercase tracking-wider line-clamp-1 mb-1">
                                                    {itemCaption}
                                                </p>
                                            )}
                                            <p className="text-gray-300 text-[11px] font-light line-clamp-2 leading-relaxed">
                                                {itemAlt}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Luxury Interactive Lightbox Overlay */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-hidden"
                    >
                        {/* Top Bar */}
                        <div 
                            className="w-full flex items-center justify-between z-[100] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    Wedding Album
                                </span>
                                <span className="text-white/60 text-[11px] font-black tracking-widest uppercase">
                                    Capture <span className="text-[#c5a059]">{currentIndex + 1}</span> of {images.length}
                                </span>
                            </div>

                            <button 
                                type="button"
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group cursor-pointer"
                                onClick={closeLightbox}
                                aria-label="Close Lightbox"
                            >
                                <span>Close</span>
                                <span className="text-[#c5a059] group-hover:rotate-90 transition-transform duration-300">✕</span>
                            </button>
                        </div>

                        {/* Center Stage with Prev/Next Controls */}
                        <div 
                            className="relative flex-1 w-full flex items-center justify-center my-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Previous Button */}
                            <button 
                                type="button"
                                className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/70 hover:bg-[#c5a059] border border-white/20 hover:border-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-300 z-[100] shadow-2xl cursor-pointer"
                                onClick={prevImage}
                                aria-label="Previous photograph"
                            >
                                <svg className="w-6 h-6 transform -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Next Button */}
                            <button 
                                type="button"
                                className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/70 hover:bg-[#c5a059] border border-white/20 hover:border-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-300 z-[100] shadow-2xl cursor-pointer"
                                onClick={nextImage}
                                aria-label="Next photograph"
                            >
                                <svg className="w-6 h-6 transform translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Image Container */}
                            <motion.div
                                key={currentIndex}
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.96, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative w-full h-[65vh] md:h-[75vh] max-w-6xl flex items-center justify-center"
                            >
                                <img
                                    src={selectedImage}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
                                    alt={currentAlt}
                                />
                            </motion.div>
                        </div>

                        {/* Bottom Information Drawer */}
                        <div 
                            className="w-full max-w-3xl mx-auto text-center z-[100] bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {currentCaption && (
                                <h4 className="text-[#c5a059] text-sm sm:text-base font-bold uppercase tracking-wider mb-1 line-clamp-1">
                                    {currentCaption}
                                </h4>
                            )}
                            <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                                {currentAlt}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
