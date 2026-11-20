"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

export default function JewelleryPureGallery({ initialItems = [] }) {
    const [items, setItems] = useState(initialItems);
    const [selectedIndex, setSelectedIndex] = useState(null); // Index of jewellery design item
    const [activeAngleIndex, setActiveAngleIndex] = useState(0); // Index of photo within that design
    const [isZoomed, setIsZoomed] = useState(false);
    const modalRef = useRef(null);

    // If initialItems is empty, fetch from API
    useEffect(() => {
        if (!initialItems || initialItems.length === 0) {
            fetch('/api/jewellery-gallery')
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.items)) {
                        setItems(data.items);
                    }
                })
                .catch(err => console.error("Failed to load jewellery gallery:", err));
        }
    }, [initialItems]);

    // Open lightbox
    const openLightbox = (itemIndex) => {
        setSelectedIndex(itemIndex);
        setActiveAngleIndex(0);
        setIsZoomed(false);
    };

    // Close lightbox
    const closeLightbox = useCallback(() => {
        setSelectedIndex(null);
        setActiveAngleIndex(0);
        setIsZoomed(false);
    }, []);

    // Navigate to previous jewellery design
    const showPrev = useCallback(() => {
        if (selectedIndex === null || items.length === 0) return;
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        setActiveAngleIndex(0);
        setIsZoomed(false);
    }, [selectedIndex, items.length]);

    // Navigate to next jewellery design
    const showNext = useCallback(() => {
        if (selectedIndex === null || items.length === 0) return;
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        setActiveAngleIndex(0);
        setIsZoomed(false);
    }, [selectedIndex, items.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "ArrowRight") showNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, closeLightbox, showPrev, showNext]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedIndex]);

    const currentItem = selectedIndex !== null ? items[selectedIndex] : null;
    const itemPhotos = currentItem ? (currentItem.images || [currentItem.coverImage]) : [];
    const currentPhotoUrl = itemPhotos[activeAngleIndex] || currentItem?.coverImage;

    return (
        <section className="relative w-full py-12 md:py-16 bg-[#030303]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Pure Image-Only Gallery Grid: Exactly ONE thumbnail card per unique jewellery design */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {items.map((item, index) => (
                        <div
                            key={item.id || item._id || index}
                            onClick={() => openLightbox(index)}
                            className="group relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-[#c5a059]/40 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-[#c5a059]/10"
                        >
                            <Image
                                src={item.coverImage}
                                alt=""
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                priority={index < 8}
                                quality={90}
                            />
                            {/* Subtle dark gold luxury sheen on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pure Visual Lightbox Modal (ZERO text, ZERO labels, ZERO video) */}
            {currentItem && (
                <div
                    ref={modalRef}
                    onClick={(e) => {
                        if (e.target === modalRef.current) closeLightbox();
                    }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6"
                >
                    {/* Top Controls Bar */}
                    <div className="w-full max-w-7xl flex items-center justify-end gap-3 z-10">
                        {/* Zoom toggle button */}
                        <button
                            type="button"
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-200 border border-white/10 shadow-lg"
                            title="Zoom"
                            aria-label="Zoom"
                        >
                            {isZoomed ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                            )}
                        </button>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#c5a059] text-white hover:text-black flex items-center justify-center transition-all duration-200 border border-white/10 shadow-lg"
                            title="Close"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Main Stage with Prev / Next Navigation */}
                    <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto overflow-hidden">
                        {/* Prev Button */}
                        <button
                            type="button"
                            onClick={showPrev}
                            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl"
                            aria-label="Previous"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Active Image (Pure High-Resolution Photograph) */}
                        <div
                            className={`relative max-w-full max-h-[72vh] flex items-center justify-center transition-transform duration-300 ${
                                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                            }`}
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <img
                                src={currentPhotoUrl}
                                alt=""
                                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl select-none"
                            />
                        </div>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={showNext}
                            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl"
                            aria-label="Next"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Bottom Strip: Thumbnails of the SAME jewellery item angles */}
                    {itemPhotos.length > 1 && (
                        <div className="w-full max-w-4xl py-2 flex items-center justify-center gap-3 overflow-x-auto z-10 custom-scrollbar">
                            {/* Photo thumbnails */}
                            {itemPhotos.map((photoUrl, pIdx) => {
                                const isActive = pIdx === activeAngleIndex;
                                return (
                                    <button
                                        key={photoUrl + pIdx}
                                        type="button"
                                        onClick={() => {
                                            setActiveAngleIndex(pIdx);
                                            setIsZoomed(false);
                                        }}
                                        className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                            isActive
                                                ? "border-[#c5a059] scale-105 shadow-md shadow-[#c5a059]/30"
                                                : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/50"
                                        }`}
                                    >
                                        <img
                                            src={photoUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
