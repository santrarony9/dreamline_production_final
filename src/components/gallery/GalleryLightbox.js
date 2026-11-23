"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryLightbox({
    isOpen,
    images = [],
    currentIndex = 0,
    onClose,
    onNext,
    onPrev,
    onSelectIndex
}) {
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const currentItem = images[currentIndex] || null;

    // Keyboard navigation: Escape to close, Left/Right arrows to navigate
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose?.();
            } else if (e.key === "ArrowRight") {
                onNext?.();
            } else if (e.key === "ArrowLeft") {
                onPrev?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        // Lock body scroll while lightbox is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onNext, onPrev, onClose]);

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
            // Swiped Left -> Next image
            onNext?.();
        } else if (diffX < -minSwipeDistance) {
            // Swiped Right -> Previous image
            onPrev?.();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!isOpen || !currentItem) return null;

    const imgSrc = currentItem.imageUrl || currentItem.src || currentItem.img || currentItem;
    const imgTitle = currentItem.title || "Visual Masterpiece";
    const imgCaption = currentItem.caption || "";
    const imgCategory = currentItem.category || "wedding";
    const imgAlt = currentItem.altText || currentItem.alt || imgTitle;
    const targetProjectUrl = currentItem.projectUrl || (currentItem.weddingId ? `/wedding/${currentItem.weddingId}/` : (
        imgCategory === "weddings" || imgCategory === "wedding" ? (
            imgTitle?.toLowerCase().includes("sid") ? "/wedding/sid-trina-luxury-bengali-wedding/" :
            imgTitle?.toLowerCase().includes("diandra") || imgTitle?.toLowerCase().includes("surjo") ? "/wedding/zamindar-soul/" :
            imgTitle?.toLowerCase().includes("rajlaxmi") || imgTitle?.toLowerCase().includes("mohit") ? "/wedding/rajlaxmi-mohit-royal-wedding-kolkata/" : ""
        ) : ""
    ));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-hidden"
                onClick={onClose}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                role="dialog"
                aria-modal="true"
                aria-label={`Gallery Lightbox: ${imgTitle}`}
            >
                {/* Top Control Bar */}
                <div 
                    className="w-full flex items-center justify-between z-[10000] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            {imgCategory}
                        </span>
                        <span className="text-white/60 text-[11px] font-black tracking-widest uppercase">
                            Capture <span className="text-[#c5a059]">{currentIndex + 1}</span> of {images.length}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                        aria-label="Close Lightbox"
                    >
                        <span>Close</span>
                        <span className="text-[#c5a059] group-hover:rotate-90 transition-transform duration-300">✕</span>
                    </button>
                </div>

                {/* Main Image Stage with Next / Prev Controls */}
                <div 
                    className="relative flex-1 w-full flex items-center justify-center my-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrev?.();
                        }}
                        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/70 hover:bg-[#c5a059] border border-white/20 hover:border-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-300 shadow-2xl group focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        aria-label="Previous Image"
                    >
                        <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Active Image Container */}
                    <div className="relative w-full h-[65vh] md:h-[75vh] max-w-6xl flex items-center justify-center">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {typeof imgSrc === "string" && (
                                <Image
                                    src={imgSrc}
                                    alt={imgAlt}
                                    fill
                                    priority
                                    className="object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                                    sizes="(max-width: 1024px) 95vw, 1200px"
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext?.();
                        }}
                        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/70 hover:bg-[#c5a059] border border-white/20 hover:border-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-300 shadow-2xl group focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        aria-label="Next Image"
                    >
                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Bottom Caption and Info Bar */}
                <div 
                    className="w-full max-w-4xl mx-auto text-center z-[10000] relative bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-white font-heading text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight mb-1.5">
                        {imgTitle}
                    </h3>
                    {imgCaption && (
                        <p className="text-gray-400 text-xs sm:text-sm font-light max-w-2xl mx-auto leading-relaxed">
                            {imgCaption}
                        </p>
                    )}
                    {targetProjectUrl && (
                        <div className="mt-3.5 flex items-center justify-center">
                            <Link
                                href={targetProjectUrl}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(197,160,89,0.35)]"
                            >
                                <span>Explore Wedding Story &amp; Full Gallery</span>
                                <span>&rarr;</span>
                            </Link>
                        </div>
                    )}
                    <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-white/40 uppercase tracking-widest font-black">
                        <span>← Swipe / Use Arrow Keys →</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
