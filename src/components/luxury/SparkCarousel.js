"use client";

import { useState, useEffect } from "react";

export default function SparkCarousel({ images }) {
    // Premium diamond/wedding fallback array
    const defaultImages = [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200"
    ];

    const displayImages = images?.length >= 3 ? images : defaultImages;
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % displayImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [displayImages.length]);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    return (
        <section className="py-32 bg-[#050505] overflow-hidden relative border-t border-white/5">
            <div className="container mx-auto px-6 mb-16 text-center z-10 relative">
                <span className="text-[#c5a059] font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Signature Frames</span>
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                    The Diamond <span className="text-[#c5a059]">Cut.</span>
                </h2>
            </div>

            {/* 3D Carousel Container */}
            <div className="relative h-[50vh] md:h-[70vh] w-full flex items-center justify-center max-w-7xl mx-auto perspective-[1000px]">
                {displayImages.map((img, index) => {
                    let offset = index - activeIndex;
                    const len = displayImages.length;

                    if (offset < -Math.floor(len / 2)) offset += len;
                    if (offset > Math.floor(len / 2)) offset -= len;

                    const isCenter = offset === 0;
                    const isLeft = offset === -1;
                    const isRight = offset === 1;
                    const isFarLeft = offset < -1;
                    const isFarRight = offset > 1;

                    let transform = 'translateX(0) scale(1) rotateY(0deg)';
                    let zIndex = 0;
                    let opacity = 0;

                    if (isCenter) {
                        transform = 'translateX(0) scale(1) rotateY(0deg)';
                        zIndex = 30;
                        opacity = 1;
                    } else if (isLeft) {
                        transform = 'translateX(-55%) scale(0.8) rotateY(15deg)';
                        zIndex = 20;
                        opacity = 0.6;
                    } else if (isRight) {
                        transform = 'translateX(55%) scale(0.8) rotateY(-15deg)';
                        zIndex = 20;
                        opacity = 0.6;
                    } else if (isFarLeft) {
                        transform = 'translateX(-80%) scale(0.6) rotateY(25deg)';
                        zIndex = 10;
                        opacity = 0;
                    } else if (isFarRight) {
                        transform = 'translateX(80%) scale(0.6) rotateY(-25deg)';
                        zIndex = 10;
                        opacity = 0;
                    }

                    return (
                        <div
                            key={index}
                            className="absolute w-[80%] md:w-[50%] h-full rounded-3xl overflow-hidden transition-all duration-1000 cubic-bezier(0.25, 1, 0.5, 1) cursor-pointer shadow-2xl border border-white/10"
                            style={{
                                transform,
                                zIndex,
                                opacity,
                                pointerEvents: (isCenter || isLeft || isRight) ? 'auto' : 'none'
                            }}
                            onClick={() => (isLeft || isRight) && setActiveIndex(index)}
                        >
                            <img src={img} className="w-full h-full object-cover" alt={`Frame ${index}`} />
                            <div className={`absolute inset-0 bg-black/50 transition-opacity duration-1000 ${isCenter ? 'opacity-0' : 'opacity-100'}`} />
                        </div>
                    );
                })}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-12 gap-3 relative z-10">
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`transition-all duration-500 rounded-full bg-[#c5a059] ${index === activeIndex ? "w-10 h-2 opacity-100" : "w-2 h-2 opacity-30 hover:opacity-100"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
