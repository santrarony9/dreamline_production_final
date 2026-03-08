"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function QuoteSection() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Parallax for background image
    const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    // Parallax for text (scrolls slightly faster)
    const yText = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={sectionRef}
            className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden border-t border-white/5"
        >
            {/* Background Parallax Layer */}
            <motion.div
                style={{
                    y: yBg,
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80")'
                }}
                className="absolute inset-0 z-0 bg-center bg-cover scale-110"
            />

            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.h2
                    style={{ y: yText, opacity }}
                    className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-[70px] font-black text-white italic leading-[1.1] max-w-6xl mx-auto drop-shadow-2xl uppercase"
                >
                    "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard."
                </motion.h2>
            </div>
        </section>
    );
}
