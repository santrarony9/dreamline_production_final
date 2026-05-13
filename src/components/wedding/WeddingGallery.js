"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function WeddingGallery({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImage(images[index]);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = "auto";
    };

    const nextImage = (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage(e);
            if (e.key === "ArrowLeft") prevImage(e);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex]);

    return (
        <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((img, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="break-inside-avoid rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-white/5 bg-zinc-900 group relative cursor-pointer"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={img}
                            width={800}
                            height={600}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt={`Wedding Capture ${index + 1}`}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                    >
                        {/* Close Button */}
                        <button 
                            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[100]"
                            onClick={closeLightbox}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation Buttons */}
                        <button 
                            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[100]"
                            onClick={prevImage}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button 
                            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[100]"
                            onClick={nextImage}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative max-w-full max-h-full aspect-auto">
                                <img
                                    src={selectedImage}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                    alt="Enlarged wedding capture"
                                />
                                <div className="absolute -bottom-10 left-0 right-0 text-center">
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                                        Capture {currentIndex + 1} of {images.length}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
