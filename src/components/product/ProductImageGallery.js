"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";

export default function ProductImageGallery({
    initialImages = [],
    initialCategories = [],
    heroTitle = "Product Showcase",
    heroSubtitle = "Commercial & E-Commerce Catalog Photography"
}) {
    const [images, setImages] = useState(initialImages);
    const [categories, setCategories] = useState(initialCategories);
    const [activeCategory, setActiveCategory] = useState("All");
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const lightboxRef = useRef(null);

    // Fetch latest gallery images on mount or when category changes
    useEffect(() => {
        let isMounted = true;
        const fetchImages = async () => {
            try {
                const url = activeCategory && activeCategory !== "All"
                    ? `/api/product-gallery?category=${encodeURIComponent(activeCategory)}`
                    : `/api/product-gallery`;
                const res = await fetch(url);
                const data = await res.json();
                if (isMounted && data.success) {
                    setImages(data.images || []);
                    if (data.categories && data.categories.length > 0) {
                        setCategories(data.categories);
                    }
                }
            } catch (err) {
                console.error("Failed to load product gallery:", err);
            }
        };

        fetchImages();
        return () => { isMounted = false; };
    }, [activeCategory]);

    // Filter images client-side for immediate response
    const filteredImages = useMemo(() => {
        if (!activeCategory || activeCategory === "All") return images;
        return images.filter(img => img.category === activeCategory);
    }, [images, activeCategory]);

    // Lightbox navigation
    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    }, []);

    const prevImage = useCallback(() => {
        if (lightboxIndex === null || filteredImages.length === 0) return;
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
    }, [lightboxIndex, filteredImages.length]);

    const nextImage = useCallback(() => {
        if (lightboxIndex === null || filteredImages.length === 0) return;
        setLightboxIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
    }, [lightboxIndex, filteredImages.length]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            if (lightboxRef.current?.requestFullscreen) {
                lightboxRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
            }
        }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "f" || e.key === "F") toggleFullscreen();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, closeLightbox, prevImage, nextImage, toggleFullscreen]);

    // Touch swipe support for mobile
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e) => {
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].screenX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
    };

    const currentImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

    return (
        <section className="w-full bg-black text-white py-8 sm:py-12 md:py-16">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* ── Category Filter Bar ── */}
                <div className="mb-8 md:mb-12">
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar scroll-smooth no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("All")}
                            className={`px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                                activeCategory === "All"
                                    ? "bg-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]"
                                    : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5"
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => {
                            const catName = cat.name || cat;
                            const isActive = activeCategory === catName;
                            return (
                                <button
                                    key={cat._id || cat.slug || catName}
                                    type="button"
                                    onClick={() => setActiveCategory(catName)}
                                    className={`px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                                        isActive
                                            ? "bg-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]"
                                            : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5"
                                    }`}
                                >
                                    {catName}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Symmetrical 4-Column Responsive Grid ── */}
                {filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
                        {filteredImages.map((image, idx) => (
                            <div
                                key={image._id || idx}
                                onClick={() => openLightbox(idx)}
                                className="group relative aspect-square bg-[#0a0a0a] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-[#c5a059]/60 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_10px_35px_rgba(197,160,89,0.18)]"
                            >
                                {/* High Quality Product Image */}
                                <Image
                                    src={image.imageUrl}
                                    alt={image.altText || image.title || "Product Photography"}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                    loading={idx < 8 ? "eager" : "lazy"}
                                />

                                {/* Subtle Luxury Hover Frame Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Discreet Center View Indicator on Hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 border border-[#c5a059]/50 flex items-center justify-center backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Minimal Luxury Empty State if Category Empty */
                    <div className="py-24 text-center">
                        <div className="inline-block p-4 rounded-full bg-white/[0.02] border border-white/10 mb-4 text-[#c5a059]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-widest font-medium">
                            No product photography found in this category
                        </p>
                    </div>
                )}
            </div>

            {/* ── Premium Lightbox Modal ── */}
            {currentImage && (
                <div
                    ref={lightboxRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Product Image Lightbox"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fadeIn"
                >
                    {/* Top Controls Bar */}
                    <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 z-20">
                        {/* Category Tag & Counter */}
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/25 px-3 py-1 rounded-full">
                                {currentImage.category || "Product"}
                            </span>
                            <span className="text-[10px] sm:text-xs font-mono font-bold text-white/50 tracking-widest">
                                {String(lightboxIndex + 1).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Control Actions: Fullscreen & Close */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                aria-label="Toggle Fullscreen"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-[#c5a059] hover:text-black border border-white/10 transition-colors flex items-center justify-center text-white"
                            >
                                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isFullscreen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m6 6l5 5m0 0l-5 0m5 0l0-5" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    )}
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={closeLightbox}
                                aria-label="Close Lightbox"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/10 transition-colors flex items-center justify-center text-white font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Main Image Center Stage */}
                    <div className="relative flex-1 w-full max-w-[1300px] flex items-center justify-center my-2 sm:my-4 overflow-hidden">
                        {/* Prev Button */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            aria-label="Previous Image"
                            className="absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#c5a059] hover:text-black border border-white/15 hover:border-[#c5a059] transition-all flex items-center justify-center text-white backdrop-blur-md shadow-2xl"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Image Canvas */}
                        <div 
                            className="relative max-h-[82vh] max-w-[90vw] aspect-square flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={currentImage.imageUrl}
                                alt={currentImage.altText || currentImage.title || "Product Shot"}
                                className="max-h-[82vh] max-w-[90vw] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10"
                            />
                        </div>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            aria-label="Next Image"
                            className="absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#c5a059] hover:text-black border border-white/15 hover:border-[#c5a059] transition-all flex items-center justify-center text-white backdrop-blur-md shadow-2xl"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="w-full text-center pb-2 z-20 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Press ESC to close • Arrow keys to navigate
                    </div>
                </div>
            )}
        </section>
    );
}
