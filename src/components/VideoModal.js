"use client";

import { useEffect, useState } from "react";

export default function VideoModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        const handleOpen = (e) => {
            const { url, title: videoTitle } = e.detail;
            setVideoUrl(url);
            setTitle(videoTitle);
            setIsOpen(true);
        };

        window.addEventListener("openVideo", handleOpen);
        return () => window.removeEventListener("openVideo", handleOpen);
    }, []);

    if (!isOpen) return null;

    const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    const isVimeo = videoUrl.includes("vimeo.com");

    let embedUrl = videoUrl;
    if (isYouTube) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        if (match && match[2].length === 11) {
            embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
        }
    } else if (isVimeo) {
        const match = videoUrl.match(/vimeo.com\/(\d+)/);
        if (match) {
            embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        }
    }

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-500"
            onClick={() => setIsOpen(false)}
        >
            <button
                className="absolute top-10 right-10 text-white text-4xl interactive hover:text-[#c5a059] transition-colors"
                onClick={() => setIsOpen(false)}
            >
                &times;
            </button>

            <div className="w-[90%] max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                {isYouTube || isVimeo ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    <video src={videoUrl} controls autoPlay className="w-full h-full" />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-white font-heading text-xl font-black uppercase tracking-widest leading-none">
                        {title}
                    </h3>
                </div>
            </div>
        </div>
    );
}

// Helper to trigger modal
export const openVideo = (url, title) => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("openVideo", { detail: { url, title } }));
    }
};
