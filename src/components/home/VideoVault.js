"use client";

import Image from "next/image";
import { openVideo } from "@/components/VideoModal";

export default function VideoVault({ 
    videos = [], 
    title = "CINEMATIC REEL", 
    subtitle = "Video Vault.", 
    description = "15+ Years of Frames" 
}) {
    // No local state needed for activeVideo anymore
    
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
        <section className="py-16 md:py-32 bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-20 gap-8">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-6">
                            {title}
                        </p>
                        <h2 className="font-heading text-5xl md:text-8xl font-black text-white uppercase italic leading-[0.9]">
                            {subtitle.includes('.') ? (
                                <>{subtitle.split('.')[0]} <span className="text-outline">{subtitle.split('.')[1]}.</span></>
                            ) : subtitle}
                        </h2>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {displayVideos.map((video, index) => (
                        <div
                            key={index}
                            className="aspect-[4/5] md:aspect-video relative group overflow-hidden cursor-none interactive bg-neutral-900"
                            onClick={() => openVideo(video.videoUrl, video.title)}
                        >
                            {video.image ? (
                                <Image
                                    src={video.image}
                                    alt={video.title}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-60 group-hover:opacity-100"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                // Fallback: If no image, try to show the video itself as a muted preview if it's a direct link
                                video.videoUrl?.match(/\.(mp4|webm|ogg|mov)$|video/i) ? (
                                    <video 
                                        src={video.videoUrl} 
                                        muted 
                                        loop 
                                        playsInline 
                                        className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-700"
                                        onMouseOver={e => e.target.play()}
                                        onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">No Preview</span>
                                    </div>
                                )
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 md:opacity-60 group-hover:opacity-90 transition-opacity p-8 flex flex-col justify-end">
                                <p className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-2 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {video.category}
                                </p>
                                <h3 className="text-white font-heading text-2xl font-black uppercase transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                    {video.title}
                                </h3>
                            </div>

                            {/* Play Button Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-500 scale-100 md:scale-75 group-hover:scale-100">
                                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
