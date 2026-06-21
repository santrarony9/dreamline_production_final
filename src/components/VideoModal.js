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

            // Add hash to window URL so browser's native back button closes the modal
            if (typeof window !== "undefined" && !window.location.hash.includes("watch")) {
                window.location.hash = "watch";
            }
        };

        const handleHashChange = () => {
            if (typeof window !== "undefined" && !window.location.hash.includes("watch")) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("openVideo", handleOpen);
        window.addEventListener("hashchange", handleHashChange);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("openVideo", handleOpen);
            window.removeEventListener("hashchange", handleHashChange);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleClose = () => {
        if (typeof window !== "undefined" && window.location.hash.includes("watch")) {
            window.history.back();
        } else {
            setIsOpen(false);
        }
    };

    if (!isOpen || !videoUrl) return null;

    const isYouTube = videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be");
    const isVimeo = videoUrl?.includes("vimeo.com");

    let embedUrl = videoUrl;
    if (isYouTube) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        if (match && match[2].length === 11) {
            const host = typeof window !== "undefined" ? window.location.origin : "";
            embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(host)}`;
        }
    } else if (isVimeo) {
        const match = videoUrl.match(/vimeo.com\/(\d+)/);
        if (match) {
            embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1&badge=0&autopause=0`;
        }
    }

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-500"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            {/* Highly visible, premium, laptop-friendly close button */}
            <button
                aria-label="Close video player"
                className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-3 bg-black/60 hover:bg-black/90 border border-white/10 px-5 py-2.5 rounded-full text-white text-xs font-black uppercase tracking-widest hover:text-[#c5a059] transition-all z-50 group backdrop-blur-md shadow-2xl interactive"
                onClick={handleClose}
            >
                <span>Close Player</span>
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-[#c5a059]/20 group-hover:text-[#c5a059] transition-colors text-[10px]">
                    ✕
                </span>
            </button>

            <div className="w-[90%] max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {isYouTube || isVimeo ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                ) : (
                    <video src={videoUrl} controls autoPlay className="w-full h-full" />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
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
