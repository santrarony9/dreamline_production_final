"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

// Pre-configured rich metadata for Podcast Production videos
const PODCAST_METADATA = {
    "yleEJrCNEf0": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "কেন টেলিভিশন ইন্ডাস্ট্রিকে Soulless Job বললেন বরুণ চন্দ - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/yleEJrCNEf0/hqdefault.jpg"
    },
    "KSivcLWbdnA": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "সঙ্গীতে সফলতার টিপস - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/KSivcLWbdnA/hqdefault.jpg"
    },
    "gV2eKL_RTrc": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "সুন্দর বাংলা গান - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/gV2eKL_RTrc/hqdefault.jpg"
    },
    "9nrOL-qhBf0": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "শতরূপে মা দুর্গা - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/9nrOL-qhBf0/hqdefault.jpg"
    },
    "n1-LSS_uzJQ": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "Calcutta's Mini Lucknow - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/n1-LSS_uzJQ/hqdefault.jpg"
    },
    "5bINCVdismM": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "Get Healed Through Recitation by Sangita Saha - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/5bINCVdismM/hqdefault.jpg"
    },
    "JV_yYXVIgjo": {
        show: "Sbd Lifestyle",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "ডায়মন্ড কি শুধুই হাই-সোসাইটির জন্য? - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/JV_yYXVIgjo/hqdefault.jpg"
    },
    "vTQLIoqQPGU": {
        show: "Kholapata ebong Arpita",
        type: "standard",
        tag: "Full Episode",
        accessibleTitle: "ভবানীপুর কী deciding factor? West Bengal Elections Analysis - Full Episode Podcast by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/vTQLIoqQPGU/hqdefault.jpg"
    },
    "TU6KUw_55ic": {
        show: "Kholapata ebong Arpita",
        type: "standard",
        tag: "Full Episode",
        accessibleTitle: "অল্প বয়সেও হতে পারে Prostate Problem! Dr. Avishek Mukherjee - Full Episode Podcast by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/TU6KUw_55ic/hqdefault.jpg"
    },
    "J_s5AIP-hFY": {
        show: "Kholapata ebong Arpita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "ভারতীয় মেয়েদের বিশ্বজয় লড়াই শুরু হয়েছিল বহুদিন আগে মিঠু মুখোপাধ্যায় - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/J_s5AIP-hFY/hqdefault.jpg"
    },
    "f2_paHV562A": {
        show: "Kholapata ebong Arpita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "রাজনীতিতে কে থাকবে আর কে যাবে predict করা খুব মুশকিল জওহর সরকার - Podcast Short by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/f2_paHV562A/hqdefault.jpg"
    },
    "rGCNP3nWC9Y": {
        show: "Prompt With Paromita",
        type: "standard",
        tag: "Full Episode",
        accessibleTitle: "Banglar gan with versatile singer Pousali Banerjee - Full Episode Podcast by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/rGCNP3nWC9Y/hqdefault.jpg"
    },
    "hRnCf_evOZs": {
        show: "Prompt With Paromita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "দীপান্বিতা অমাবস্যার নিয়ম - Podcast Short Highlight by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/hRnCf_evOZs/hqdefault.jpg"
    },
    "t4YqQvedLkE": {
        show: "Kholapata ebong Arpita",
        type: "standard",
        tag: "Full Episode",
        accessibleTitle: "দুর্গাপুজোর বোধন, বিসর্জন, সিঁদুর খেলা — কেন এই রীতি? - Full Episode Podcast by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/t4YqQvedLkE/hqdefault.jpg"
    },
    "qtp9vJ0xzFY": {
        show: "Kholapata ebong Arpita",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "মাত্র ৪৮ মিনিট! কেন এই সময়টাই এত গুরুত্বপূর্ণ? - Podcast Short Highlight by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/qtp9vJ0xzFY/hqdefault.jpg"
    },
    "fLturgnZcMw": {
        show: "ANI In Search For Truth",
        type: "standard",
        tag: "Full Episode",
        accessibleTitle: "শান্তিপুরের ঐতিহ্য: বড় গোস্বামী বাড়ি ও আগমেশ্বরী মাতার অজানা ইতিহাস - Full Episode Podcast by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/fLturgnZcMw/hqdefault.jpg"
    },
    "p-AOOftRg_E": {
        show: "ANI In Search For Truth",
        type: "shorts",
        tag: "Podcast Short",
        accessibleTitle: "মারণ ক্রিয়া কি ? তন্ত্র দিয়ে কি সত্যিই ক্ষতি করা যায়? - Podcast Short Highlight by Dreamline Production",
        fallbackThumbnail: "https://img.youtube.com/vi/p-AOOftRg_E/hqdefault.jpg"
    }
};

export default function ServiceVideoShowcase({ videos, title, subtitle, pageSlug }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [playingVideoId, setPlayingVideoId] = useState(null);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [thumbnailErrorCount, setThumbnailErrorCount] = useState({});

    // Resilient fallback mechanism if a thumbnail fails to load
    const handleThumbnailError = useCallback((id) => {
        setThumbnailErrorCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }, []);

    if (!videos || videos.length === 0) return null;

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.trim().match(regExp);
        if (match && match[2].length === 11) return match[2];
        if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
        return null;
    };

    // Enrich video items with type (standard or shorts) and metadata
    const enrichedVideos = videos.map((video, idx) => {
        const ytId = getYouTubeId(video.url);
        const meta = ytId && PODCAST_METADATA[ytId] ? PODCAST_METADATA[ytId] : null;
        const isShort = video.type === "shorts" || (meta ? (meta.type === "shorts") : (video.url?.includes("/shorts/")));
        const isBirthdayPage = pageSlug === "birthday-photography-kolkata" || pageSlug?.includes("birthday");
        const isOtherSocialPage = pageSlug === "other-social-events-kolkata" || pageSlug?.includes("social-events");
        const show = video.category || meta?.show || (isBirthdayPage ? "Birthday Photography" : isOtherSocialPage ? "Social Events" : (pageSlug === "podcast-production-kolkata" ? "Dreamline Podcast" : "Dreamline Film"));
        const tag = video.tag || (isShort ? "Short Highlight" : (pageSlug === "podcast-production-kolkata" ? "Full Episode" : "4K Cinematic"));
        const accessibleTitle = meta?.accessibleTitle || `${video.title} - Video production by Dreamline Production Kolkata`;
        
        // Prefer reliable hqdefault thumbnail with automatic resilient fallbacks
        let primaryThumbnail = "";
        if (video.thumbnail && video.thumbnail.trim()) {
            primaryThumbnail = video.thumbnail.trim();
        } else if (ytId) {
            primaryThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        } else {
            primaryThumbnail = "/logo-banner.png";
        }

        // Canonical original YouTube watch URL
        const originalWatchUrl = isShort 
            ? `https://youtube.com/shorts/${ytId}` 
            : `https://www.youtube.com/watch?v=${ytId}`;

        return {
            ...video,
            ytId,
            isShort,
            show,
            tag,
            accessibleTitle,
            primaryThumbnail,
            originalWatchUrl,
            idx
        };
    });

    const standardVideos = enrichedVideos.filter(v => !v.isShort);
    const shortVideos = enrichedVideos.filter(v => v.isShort);
    const hasBothTypes = standardVideos.length > 0 && shortVideos.length > 0;

    const getThumbnailSrc = (video) => {
        const errors = thumbnailErrorCount[video.ytId] || 0;
        if (errors === 0) {
            return video.primaryThumbnail;
        } else if (errors === 1 && video.ytId) {
            return `https://i.ytimg.com/vi/${video.ytId}/hqdefault.jpg`;
        } else if (errors === 2 && video.ytId) {
            return `https://img.youtube.com/vi/${video.ytId}/mqdefault.jpg`;
        }
        return video.primaryThumbnail;
    };

    // Click-to-Play handlers
    const handlePlay = (id) => {
        setIframeLoading(true);
        setPlayingVideoId(id);
    };

    const handleClose = (e) => {
        if (e) e.stopPropagation();
        setPlayingVideoId(null);
        setIframeLoading(false);
    };

    // Filter change handler: stop playing videos when switching view to avoid background audio
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setPlayingVideoId(null);
        setIframeLoading(false);
    };

    // Standard 16:9 Cinema Card - Unobstructed Thumbnail with Decoupled Metadata Card
    const renderStandardCard = (video) => {
        const isPlaying = playingVideoId === video.ytId;
        const imageSrc = getThumbnailSrc(video);
        const watchUrl = video.originalWatchUrl || `https://www.youtube.com/watch?v=${video.ytId}`;

        return (
            <div className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] hover:border-[#c5a059]/80 transition-all duration-500 shadow-2xl flex flex-col justify-between h-full w-full">
                {/* TOP: 16:9 Cinema Frame - Strictly 16:9, Unobstructed Thumbnail & Embedded Player */}
                <div className="relative aspect-video w-full overflow-hidden bg-black flex-shrink-0">
                    {isPlaying ? (
                        <div className="relative w-full h-full bg-black">
                            {/* Smooth Loading Indicator while YouTube Player initializes */}
                            {iframeLoading && (
                                <div 
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
                                    aria-live="polite"
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-[#c5a059]/30 border-t-[#c5a059] animate-spin mb-3 shadow-[0_0_25px_rgba(197,160,89,0.4)]"></div>
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#c5a059]">
                                        Connecting Cinema Player...
                                    </span>
                                </div>
                            )}

                            {/* Standard YouTube Embed Iframe - Click to Play */}
                            <iframe
                                src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                title={video.accessibleTitle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                                loading="lazy"
                                onLoad={() => setIframeLoading(false)}
                                className="w-full h-full border-0 relative z-10"
                            />

                            {/* Top Controls Overlay: Close & Watch on YouTube fallback */}
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2">
                                <a
                                    href={watchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open and watch video directly on YouTube in a new tab"
                                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/85 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 hover:border-[#c5a059] text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-xl interactive"
                                >
                                    <span>YouTube</span>
                                    <span className="text-xs sm:text-sm">↗</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    aria-label={`Close ${video.title}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/85 hover:bg-red-600 text-white border border-white/20 hover:border-red-500 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-xl interactive"
                                >
                                    <span>Close</span>
                                    <span className="text-xs sm:text-sm">✕</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative w-full h-full cursor-pointer interactive"
                            onClick={() => handlePlay(video.ytId)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Play cinema film: ${video.title}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handlePlay(video.ytId);
                                }
                            }}
                        >
                            {/* Background Thumbnail Image - Unobstructed, Crisp 1080p */}
                            <Image
                                src={imageSrc}
                                alt={`${video.title} - Video production thumbnail by Dreamline Production Kolkata`}
                                fill
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                                onError={() => handleThumbnailError(video.ytId)}
                            />

                            {/* Subtle edge vignette (does NOT obscure center footage) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none group-hover:opacity-60 transition-opacity duration-300"></div>

                            {/* Large Centered Golden Play Button with Luxury Glow */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-[0_0_35px_rgba(197,160,89,0.65)] group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_0_50px_rgba(255,255,255,0.7)] transition-all duration-300">
                                    <svg
                                        className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bottom-Right Corner Format Pill */}
                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 pointer-events-none">
                                <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-[#c5a059] shadow-md">
                                    4K UHD
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM: Dedicated Metadata Card (Decoupled from 16:9 Frame) */}
                <div className="p-5 sm:p-6 md:p-7 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#111111] to-[#070707] border-t border-white/5 space-y-4">
                    {/* Row 1: Category badge pill & Format tag - Dedicated row, NEVER overlaps title */}
                    <div className="flex items-center justify-between gap-3">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#c5a059] shadow-sm">
                            {video.show}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/50">
                            {video.tag}
                        </span>
                    </div>

                    {/* Row 2: Video Title with min-height & line-clamp-2 for strict baseline alignment */}
                    <div>
                        <h4 className="font-heading text-base sm:text-lg md:text-xl font-bold uppercase tracking-tight line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                            {video.title}
                        </h4>
                    </div>

                    {/* Row 3: Action bar / Footer */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={() => handlePlay(video.ytId)}
                            className="flex items-center gap-2 text-white/70 hover:text-[#c5a059] transition-colors interactive"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
                            <span>{isPlaying ? "Now Playing" : "Watch Film ▶"}</span>
                        </button>
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black border border-white/10 hover:border-[#c5a059] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all interactive shadow-sm"
                        >
                            YouTube ↗
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    // 9:16 Vertical Short Card (used for podcast shorts)
    const renderShortCard = (video) => {
        const isPlaying = playingVideoId === video.ytId;
        const imageSrc = getThumbnailSrc(video);
        const watchUrl = video.originalWatchUrl || `https://youtube.com/shorts/${video.ytId}`;

        return (
            <div
                key={video.ytId || video.idx}
                className="group relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] hover:border-[#c5a059]/80 transition-all duration-500 shadow-2xl flex flex-col justify-between w-full max-w-[340px] mx-auto h-full"
            >
                {/* TOP: 9:16 Vertical Video Frame */}
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-black flex-shrink-0">
                    {isPlaying ? (
                        <div className="relative w-full h-full bg-black">
                            {iframeLoading && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm pointer-events-none">
                                    <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin mb-3"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                                        Loading Short...
                                    </span>
                                </div>
                            )}
                            <iframe
                                src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                title={video.accessibleTitle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                                loading="lazy"
                                onLoad={() => setIframeLoading(false)}
                                className="w-full h-full border-0 relative z-10"
                            />
                            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                                <a
                                    href={watchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-xl"
                                >
                                    ↗
                                </a>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-red-600 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative w-full h-full cursor-pointer interactive"
                            onClick={() => handlePlay(video.ytId)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Play short: ${video.title}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handlePlay(video.ytId);
                                }
                            }}
                        >
                            <Image
                                src={imageSrc}
                                alt={`${video.title} - Video production short`}
                                fill
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, 340px"
                                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                                onError={() => handleThumbnailError(video.ytId)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none group-hover:opacity-60 transition-opacity"></div>

                            {/* Centered Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-14 h-14 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.6)] group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                                    <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bottom-right 9:16 Shorts badge */}
                            <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-purple-500/30 text-[9px] font-black uppercase tracking-wider text-purple-300">
                                    9:16 Short
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM: Dedicated Metadata Card */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#111111] to-[#070707] border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-[9px] font-black uppercase tracking-wider text-purple-300 truncate max-w-[180px]">
                            {video.show}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                            Reel
                        </span>
                    </div>
                    <div>
                        <h4 className="font-heading text-sm sm:text-base font-bold uppercase tracking-tight line-clamp-2 min-h-[2.5rem] text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                            {video.title}
                        </h4>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={() => handlePlay(video.ytId)}
                            className="text-white/70 hover:text-[#c5a059] transition-colors"
                        >
                            Play Short ▶
                        </button>
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-purple-300 hover:text-white"
                        >
                            Shorts ↗
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    // Symmetrical Grid Renderer: 2-column on Desktop & Tablet, 1-column on Mobile, Odd-Card Horizontally Centered
    const renderVideoGrid = (videoList, isShortsList = false) => {
        if (!videoList || videoList.length === 0) return null;

        if (isShortsList) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {videoList.map(renderShortCard)}
                </div>
            );
        }

        const totalCount = videoList.length;

        // If only 1 video: render in a centered, prominent single column
        if (totalCount === 1) {
            return (
                <div className="max-w-4xl mx-auto w-full">
                    {renderStandardCard(videoList[0])}
                </div>
            );
        }

        // If 2 or more videos: 2-column grid on desktop/tablet, 1-column on mobile
        // When total count is odd (3, 5, 7), the last card is centered horizontally across both columns
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 w-full">
                {videoList.map((video, idx) => {
                    const isOddLast = totalCount % 2 === 1 && idx === totalCount - 1;
                    return (
                        <div
                            key={video.ytId || video.idx || idx}
                            className={isOddLast ? "md:col-span-2 flex justify-center w-full" : "w-full flex flex-col"}
                        >
                            <div className={isOddLast ? "w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(50%-1.5rem)] flex flex-col" : "w-full h-full flex flex-col"}>
                                {renderStandardCard(video)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <section 
            id={pageSlug === "podcast-production-kolkata" ? "podcast-productions" : (pageSlug === "birthday-photography-kolkata" ? "birthday-photography-videos" : (pageSlug === "other-social-events-kolkata" ? "other-social-events-videos" : "service-video-showcase"))} 
            aria-label={title || "Video Showcase"} 
            className="py-16 md:py-24 bg-[#050505] border-y border-white/5 relative"
        >
            {/* Early DNS & CDN Preconnects for Instant Playback */}
            <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.youtube-nocookie.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.youtube.com" />
            <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
            <link rel="dns-prefetch" href="https://img.youtube.com" />

            <div className="content-container w-full">
                {/* SECTION HEADER */}
                <div className="mb-10 md:mb-12">
                    <span className="page-category-label">
                        Featured Portfolio
                    </span>
                    <h2 className="section-title italic tracking-tight leading-tight mb-3">
                        {title ? (
                            title.toLowerCase().includes("our podcast productions") ? (
                                <>Our Podcast <span className="text-[#c5a059]">Productions</span></>
                            ) : title.toLowerCase().includes("birthday photography videos") ? (
                                <>Birthday Photography <span className="text-[#c5a059]">Videos.</span></>
                            ) : title.toLowerCase().includes("other social events videos") ? (
                                <>Other Social Events <span className="text-[#c5a059]">Videos.</span></>
                            ) : (
                                title
                            )
                        ) : (
                            <>Cinematic <span className="text-[#c5a059]">Showcase.</span></>
                        )}
                    </h2>
                    {subtitle && (
                        <p className="page-hero-desc">
                            {subtitle}
                        </p>
                    )}

                    {/* FILTER TABS (When both standard and shorts are present, e.g. Podcast page) */}
                    {hasBothTypes && (
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleFilterChange("all")}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all interactive ${
                                    activeFilter === "all"
                                        ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                        : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
                                }`}
                            >
                                All Productions ({enrichedVideos.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange("episodes")}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all interactive ${
                                    activeFilter === "episodes"
                                        ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                        : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
                                }`}
                            >
                                Full Episodes ({standardVideos.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange("shorts")}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all interactive ${
                                    activeFilter === "shorts"
                                        ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                        : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
                                }`}
                            >
                                Podcast Shorts ({shortVideos.length})
                            </button>
                        </div>
                    )}
                </div>

                {/* VIDEO GALLERIES: 2 LARGE VIDEOS PER ROW ON DESKTOP & TABLET, 1 PER ROW ON MOBILE */}
                {/* 1. ALL VIEW: Both Full Episodes and Shorts in dedicated harmonious grids */}
                {activeFilter === "all" && hasBothTypes && (
                    <div className="space-y-16 md:space-y-20">
                        {/* Full Episodes Sub-grid: 2 Large Videos per row */}
                        <div>
                            <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]"></span>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                        Full Episodes &amp; Long-Form Interviews
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                    16:9 Broadcast Quality
                                </span>
                            </div>
                            {renderVideoGrid(standardVideos, false)}
                        </div>

                        {/* Podcast Shorts Sub-grid */}
                        <div>
                            <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                        Podcast Shorts &amp; Social Highlights
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                                    9:16 Vertical Mobile Format
                                </span>
                            </div>
                            {renderVideoGrid(shortVideos, true)}
                        </div>
                    </div>
                )}

                {/* 2. FULL EPISODES FILTER: 2 Large Videos per row */}
                {activeFilter === "episodes" && (
                    <div>
                        <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                Full Episode Productions
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                {standardVideos.length} Videos Available
                            </span>
                        </div>
                        {renderVideoGrid(standardVideos, false)}
                    </div>
                )}

                {/* 3. PODCAST SHORTS FILTER */}
                {activeFilter === "shorts" && (
                    <div>
                        <div className="mb-6 md:mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                Podcast Shorts &amp; Reels
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                {shortVideos.length} Shorts Available
                            </span>
                        </div>
                        {renderVideoGrid(shortVideos, true)}
                    </div>
                )}

                {/* 4. DEFAULT SINGLE GRID (Standard across Wedding, Pre Wedding, Birthday, Corporate, Drone, etc.): 2 Large Videos per row */}
                {!hasBothTypes && renderVideoGrid(enrichedVideos, false)}
            </div>
        </section>
    );
}
