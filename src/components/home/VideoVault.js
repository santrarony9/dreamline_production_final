"use client";

import { useState } from "react";

export default function VideoVault({ videos = [] }) {
    const [activeVideo, setActiveVideo] = useState(null);

    const defaultVideos = [
        {
            title: "Royal Grandeur",
            category: "Wedding Cinema",
            image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
            videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
        },
        {
            title: "Neon Pulse",
            category: "Music Video",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800",
            videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
        }
    ];

    const displayVideos = videos && videos.length > 0 ? videos : defaultVideos;

    return (
        <section className="py-32 bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-6">
                            CINEMATIC REEL
                        </p>
                        <h2 className="font-heading text-5xl md:text-8xl font-black text-white uppercase italic leading-[0.9]">
                            Video <span className="text-outline">Vault.</span>
                        </h2>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">
                        15+ Years of Frames
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {displayVideos.map((video, index) => (
                        <div
                            key={index}
                            className="aspect-video relative group overflow-hidden cursor-none interactive"
                            onClick={() => setActiveVideo(video.videoUrl)}
                        >
                            <img
                                src={video.image}
                                alt={video.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-100"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity p-8 flex flex-col justify-end">
                                <p className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {video.category}
                                </p>
                                <h3 className="text-white font-heading text-2xl font-black uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                    {video.title}
                                </h3>
                            </div>

                            {/* Play Button Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal (Simple implementation for paritiy) */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
                    onClick={() => setActiveVideo(null)}
                >
                    <button className="absolute top-10 right-10 text-white font-black text-2xl interactive">✕</button>
                    <div className="w-full h-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                        <iframe
                            src={activeVideo.includes('?') ? `${activeVideo}&autoplay=1` : `${activeVideo}?autoplay=1`}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
