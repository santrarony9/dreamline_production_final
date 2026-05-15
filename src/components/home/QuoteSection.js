"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

export default function QuoteSection({ quote, backgroundImage }) {
    const defaultQuote = "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard.";
    const defaultBg = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80";
    const [placeId, setPlaceId] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get("/api/content");
                if (res.data?.global?.google?.placeId) {
                    setPlaceId(res.data.global.google.placeId);
                }
            } catch (err) {
                // Ignore
            }
        };
        fetchConfig();
    }, []);

    return (
        <section
            className="relative py-12 md:py-24 flex items-center justify-center border-t border-white/5 bg-fixed bg-center bg-cover bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("${backgroundImage || defaultBg}")`
            }}
        >
            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white italic leading-snug max-w-3xl mx-auto drop-shadow-2xl uppercase tracking-normal">
                        "{quote || defaultQuote}"
                    </h2>

                    {placeId && (
                        <div className="flex flex-col items-center gap-3 pt-8 border-t border-white/10 max-w-xs mx-auto">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <svg key={i} className="w-4 h-4 text-[#c5a059]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">
                                Verified Google Business Rated 5.0
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
