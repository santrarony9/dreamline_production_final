"use client";

import { useState } from "react";
import Image from "next/image";

export default function WeddingVideoPlayer({ embedUrl, coverImage, title }) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!embedUrl) return null;

    // Append autoplay when clicked
    const autoPlayUrl = embedUrl.includes("?") 
        ? `${embedUrl}&autoplay=1` 
        : `${embedUrl}?autoplay=1`;

    return (
        <div className="max-w-6xl mx-auto aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
            {isPlaying ? (
                <iframe
                    src={autoPlayUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                />
            ) : (
                <div 
                    className="w-full h-full flex items-center justify-center bg-zinc-900 interactive group relative cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play wedding film: ${title}`}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsPlaying(true);
                        }
                    }}
                >
                    <Image 
                        src={coverImage || "/thumbnails/seo_thumb_holud.jpg"} 
                        fill 
                        className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        alt={`${title} cinematic wedding film by Dreamline Production`} 
                        sizes="(max-width: 768px) 100vw, 1200px" 
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-[0_0_40px_rgba(197,160,89,0.7)] group-hover:scale-110 group-hover:bg-white transition-all duration-300 z-10">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#c5a059] bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#c5a059]/30">
                            4K Cinematic Wedding Film
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/60 px-3 py-1 rounded-full">
                            Click to Play ▶
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
