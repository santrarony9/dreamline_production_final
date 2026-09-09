"use client";

import Image from "next/image";
import { openVideo } from "@/components/VideoModal";

export default function ServiceVideoShowcase({ videos }) {
    if (!videos || videos.length === 0) return null;

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <section className="py-24 bg-[#050505] border-y border-white/5">
            <div className="px-8 md:px-16 mb-12">
                <h2 className="font-heading text-3xl font-black text-white uppercase italic tracking-tighter">
                    Cinematic <span className="text-[#c5a059]">Showcase.</span>
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 md:px-16">
                {videos.map((video, idx) => {
                    const ytId = !video.thumbnail ? getYouTubeId(video.url) : null;
                    const displayImage = video.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800");

                    return (
                    <div 
                        key={idx} 
                        className="group relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 cursor-pointer interactive"
                        onClick={() => openVideo(video.url, video.title)}
                    >
                        <Image 
                            src={displayImage} 
                            alt={video.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">{video.title}</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Watch Film</span>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </section>
    );
}
