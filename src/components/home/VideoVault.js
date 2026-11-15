"use client";

import Image from "next/image";
import { openVideo } from "@/components/VideoModal";
import { getVideoThumbnail, normalizeVideoUrl } from "@/lib/media";

export default function VideoVault({ 
    videos = [], 
    title = "CINEMATIC REEL", 
    subtitle = "Video Vault.", 
    description = "15+ Years of Frames" 
}) {
    const defaultVideos = [
        {
            title: "News Documentary | BRUT",
            category: "Commercial & Line Production",
            image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
            videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4"
        },
        {
            title: "News Documentary | TRT World",
            category: "Global Broadcast",
            image: "",
            videoUrl: "https://youtube.com/watch?v=YCZNkMz9CS4"
        },
        {
            title: "Onam Celebration",
            category: "Cultural Commercial",
            image: "",
            videoUrl: "https://youtube.com/watch?v=-2PV88RyiI0"
        }
    ];

    const rawVideos = videos && videos.length > 0 ? videos : defaultVideos;
    const displayVideos = rawVideos.map(v => {
        const fullUrl = normalizeVideoUrl(v.videoUrl || "https://www.youtube.com/watch?v=ScMzIvxBSi4");
        const thumb = getVideoThumbnail(fullUrl, v.image, 'documentary');
        return {
            ...v,
            videoUrl: fullUrl,
            displayImage: thumb
        };
    });

    return (
        <section className="py-16 md:py-32 bg-black overflow-hidden border-t border-white/5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayVideos.map((video, index) => (
                        <div
                            key={index}
                            className="aspect-[16/10] relative group overflow-hidden cursor-pointer interactive bg-neutral-950 rounded-2xl border border-white/10 hover:border-[#c5a059]/50 transition-all duration-500 shadow-xl"
                            onClick={() => openVideo(video.videoUrl, video.title)}
                        >
                            <Image
                                src={video.displayImage}
                                alt={`${video.title} - ${video.category || "Cinematic film"} by Dreamline Production Kolkata`}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-70 group-hover:opacity-100"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Play Button Icon */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#c5a059] group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-black transition-all duration-300 shadow-2xl">
                                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Gradient Overlay & Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-80 transition-opacity p-6 flex flex-col justify-end z-10">
                                <p className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-1">
                                    {video.category || "Commercial"}
                                </p>
                                <h3 className="text-white font-heading text-lg md:text-xl font-black uppercase line-clamp-2">
                                    {video.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
