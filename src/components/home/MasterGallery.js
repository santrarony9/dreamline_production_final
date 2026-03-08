"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function MasterGallery({ images = [] }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const containerRef = useRef(null);

    // Fallback images if none provided from global content
    const defaultImages = [
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1772417032378-b2770244f256ecaa93033b1d-Untitled_design__5_.webp",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1772417043885-3367fab3cee6eebf3ffbb0b6-Untitled_design__4_.webp",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668025915-KSR839_Cover.webp",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668027519-KSR1091_Cover.webp",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668028776-KSR1440_Cover.webp",
    ];

    const displayImages = images && images.length >= 6 ? images : defaultImages;

    // Split images into 3 columns
    const col1 = displayImages.filter((_, i) => i % 3 === 0);
    const col2 = displayImages.filter((_, i) => i % 3 === 1);
    const col3 = displayImages.filter((_, i) => i % 3 === 2);

    // Double up arrays to ensure enough height for parallax scrolling
    const getExtendedArray = (arr) => [...arr, ...arr];

    // Scroll Progress for True Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax Transforms: Column 1 moves UP, Column 2 moves DOWN, Column 3 moves UP slower
    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);
    const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

    return (
        <section ref={containerRef} className="bg-[#050505] border-t border-white/5 py-32 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 mb-20 relative z-10 text-center">
                <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">Our Portfolio</span>
                <h2 className="font-heading text-4xl md:text-6xl lg:text-[80px] font-black uppercase tracking-tighter leading-none mb-6">
                    MASTER<br /><span className="text-[#c5a059]">GALLERY.</span>
                </h2>
                <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.2em] max-w-xl mx-auto">
                    A multi-dimensional archive of emotion, light, and motion.
                </p>
            </div>

            {/* True Parallax Vertical Tracks */}
            <div className="h-[70vh] flex gap-4 md:gap-6 px-6 md:px-12 mt-16 relative">
                {/* Gradient Fades for Top/Bottom */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none"></div>

                {/* Column 1 - Parallax Up */}
                <div className="flex-1 flex flex-col gap-4 overflow-visible">
                    <motion.div style={{ y: y1 }} className="flex flex-col gap-4 whitespace-nowrap pt-20">
                        {getExtendedArray(col1).map((src, i) => (
                            <motion.div
                                layoutId={`gallery-img-${src}-${i}`}
                                key={`c1-${i}`}
                                onClick={() => setSelectedImage({ src, id: `gallery-img-${src}-${i}` })}
                                className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0 cursor-pointer"
                                data-cursor="VIEW"
                            >
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Column 2 - Parallax Down */}
                <div className="flex-1 flex flex-col gap-4 overflow-visible">
                    <motion.div style={{ y: y2 }} className="flex flex-col gap-4 whitespace-nowrap">
                        {getExtendedArray(col2).map((src, i) => (
                            <motion.div
                                layoutId={`gallery-img-${src}-c2-${i}`}
                                key={`c2-${i}`}
                                onClick={() => setSelectedImage({ src, id: `gallery-img-${src}-c2-${i}` })}
                                className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0 cursor-pointer"
                                data-cursor="VIEW"
                            >
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Column 3 - Parallax Up (Hidden on Mobile) */}
                <div className="hidden md:flex flex-1 flex-col gap-4 overflow-visible">
                    <motion.div style={{ y: y3 }} className="flex flex-col gap-4 whitespace-nowrap pt-10">
                        {getExtendedArray(col3).map((src, i) => (
                            <motion.div
                                layoutId={`gallery-img-${src}-c3-${i}`}
                                key={`c3-${i}`}
                                onClick={() => setSelectedImage({ src, id: `gallery-img-${src}-c3-${i}` })}
                                className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0 cursor-pointer"
                                data-cursor="VIEW"
                            >
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Full Screen Reveal Overlay */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-pointer"
                        onClick={() => setSelectedImage(null)}
                        data-cursor="CLOSE"
                    >
                        <motion.img
                            layoutId={selectedImage.id}
                            src={selectedImage.src}
                            alt="Expanded View"
                            className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        />
                        <div className="absolute top-8 right-8 text-white/50 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                            Close [X]
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
