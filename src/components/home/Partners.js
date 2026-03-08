"use client";

import { motion } from "framer-motion";

export default function Partners({ partners = [] }) {
    if (!partners || partners.length === 0) return null;

    // Duplicate partners for infinite scroll effect
    const displayPartners = [...partners, ...partners, ...partners];

    return (
        <section className="py-20 bg-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 mb-12">
                <h2 className="text-[10px] uppercase font-black text-[#c5a059] tracking-[0.5em] mb-4 text-center">
                    Trusted By Industry Leaders
                </h2>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex whitespace-nowrap gap-12 sm:gap-24 items-center"
                >
                    {displayPartners.map((partner, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 flex flex-col items-center group"
                        >
                            <div className="h-12 sm:h-16 w-32 sm:w-48 relative grayscale group-hover:grayscale-0 transition-all duration-500 opacity-30 group-hover:opacity-100 transform group-hover:scale-110">
                                {partner.image ? (
                                    <img
                                        src={partner.image}
                                        alt={partner.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-white/20 font-black uppercase text-xs tracking-widest">
                                        {partner.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient Overlays for smooth fade */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            </div>
        </section>
    );
}
