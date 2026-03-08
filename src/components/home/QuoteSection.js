"use client";

import { motion } from "framer-motion";

export default function QuoteSection() {
    return (
        <section
            className="relative py-20 md:py-48 flex items-center justify-center border-t border-white/5 bg-fixed bg-center bg-cover bg-no-repeat"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80")'
            }}
        >
            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white italic leading-relaxed max-w-4xl mx-auto drop-shadow-2xl uppercase tracking-wider">
                    "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard."
                </h2>
            </div>
        </section>
    );
}
