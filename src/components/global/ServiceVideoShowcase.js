"use client";

import { useState, useCallback, useEffect } from "react";
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
        const show = video.category || meta?.show || (pageSlug === "podcast-production-kolkata" ? "Dreamline Podcast" : "Dreamline Film");
        const tag = isShort ? "Podcast Short" : "Full Episode";
        const accessibleTitle = meta?.accessibleTitle || `${video.title} - Video production by Dreamline Production Kolkata`;
        
        // Fast, lightweight hqdefault thumbnail: https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg (~15-25 KB)
        let primaryThumbnail = "";
        if (video.thumbnail && !video.thumbnail.includes("youtube.com") && !video.thumbnail.includes("ytimg.com")) {
            primaryThumbnail = video.thumbnail;
        } else if (ytId) {
            primaryThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        } else {
            primaryThumbnail = "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80";
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

    // Resilient fallback mechanism if a thumbnail fails to load
    const handleThumbnailError = useCallback((id) => {
        setThumbnailErrorCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }, []);

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

    // Render individual video card
    const renderVideoCard = (video) => {
        const isPlaying = playingVideoId === video.ytId;
        const isShort = video.isShort;
        const imageSrc = getThumbnailSrc(video);
        const watchUrl = video.originalWatchUrl || (isShort ? `https://youtube.com/shorts/${video.ytId}` : `https://www.youtube.com/watch?v=${video.ytId}`);

        return (
            <div
                key={video.ytId || video.idx}
                className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d] hover:border-[#c5a059]/60 transition-all duration-500 shadow-2xl flex flex-col ${
                    isShort ? "aspect-[9/16] w-full max-w-[320px] mx-auto" : "aspect-video w-full"
                }`}
            >
                {isPlaying ? (
                    <div className="relative w-full h-full bg-black">
                        {/* Smooth Loading Indicator while YouTube Player initializes */}
                        {iframeLoading && (
                            <div 
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
                                aria-live="polite"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-[#c5a059]/30 border-t-[#c5a059] animate-spin mb-3 shadow-[0_0_20px_rgba(197,160,89,0.3)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a059]">
                                    Connecting Player...
                                </span>
                            </div>
                        )}

                        {/* On-Demand Standard YouTube Embed Iframe */}
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
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                            <a
                                href={watchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open and watch video directly on YouTube in a new tab"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 hover:border-[#c5a059] text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-lg interactive"
                            >
                                <span>YouTube</span>
                                <span className="text-xs">↗</span>
                            </a>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label={`Close ${video.title}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 hover:border-[#c5a059] text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-lg interactive"
                            >
                                <span>Close</span>
                                <span className="text-xs">✕</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="relative w-full h-full cursor-pointer interactive flex flex-col justify-between overflow-hidden"
                        onClick={() => handlePlay(video.ytId)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Play video: ${video.title}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handlePlay(video.ytId);
                            }
                        }}
                    >
                        {/* Background Thumbnail Image - Native Lazy Loading & CLS Protected */}
                        <Image
                            src={imageSrc}
                            alt={`${video.title} - Video production thumbnail by Dreamline Production Kolkata`}
                            fill
                            unoptimized
                            loading="lazy"
                            sizes={isShort ? "(max-width: 768px) 100vw, 320px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                            onError={() => handleThumbnailError(video.ytId)}
                        />

                        {/* Subtle Card Darkening Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 pointer-events-none"></div>

                        {/* Top Badges & Watch on YouTube Link */}
                        <div className="relative z-10 flex items-center justify-between p-4 md:p-5">
                            <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#c5a059]">
                                {video.show}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                                    isShort 
                                        ? "bg-purple-900/50 text-purple-200 border-purple-500/30" 
                                        : "bg-amber-900/40 text-[#c5a059] border-[#c5a059]/30"
                                }`}>
                                    {video.tag}
                                </span>
                                <a
                                    href={watchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Watch on YouTube (External Link)"
                                    className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-full bg-black/80 hover:bg-[#c5a059] text-gray-300 hover:text-black border border-white/20 text-[9px] font-black uppercase tracking-wider transition-all backdrop-blur-md"
                                >
                                    ↗
                                </a>
                            </div>
                        </div>

                        {/* Centered Play Button with Gold Glow & Hover Scale */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.5)] group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                                <svg
                                    className="w-6 h-6 fill-current translate-x-0.5"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Bottom Gradient Overlay & Title */}
                        <div className="relative z-10 p-5 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                            <h4 className="text-white font-heading text-sm md:text-base font-bold uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-[#c5a059] transition-colors">
                                {video.title}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                    <span>Click to Play</span>
                                    <span className="text-white/30">•</span>
                                    <span className="text-[#c5a059]">{isShort ? "9:16 Shorts" : "4K Widescreen"}</span>
                                </div>
                                <span className="text-gray-500 group-hover:text-[#c5a059] transition-colors text-[9px]">
                                    Watch ↗
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <section 
            id="podcast-productions" 
            aria-label="Our Podcast Productions" 
            className="py-24 bg-[#050505] border-y border-white/5 relative"
        >
            {/* Early DNS & CDN Preconnects for Instant Playback */}
            <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.youtube-nocookie.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.youtube.com" />
            <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
            <link rel="dns-prefetch" href="https://img.youtube.com" />

            <div className="px-6 sm:px-8 md:px-16 max-w-7xl mx-auto">
                {/* SECTION HEADER */}
                <div className="mb-12 md:mb-16">
                    <span className="text-[#c5a059] text-[10px] md:text-xs font-black uppercase tracking-[0.35em] mb-3 block">
                        Featured Portfolio
                    </span>
                    <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                        {title ? (
                            title.toLowerCase().includes("our podcast productions") ? (
                                <>Our Podcast <span className="text-[#c5a059]">Productions</span></>
                            ) : (
                                title
                            )
                        ) : (
                            <>Cinematic <span className="text-[#c5a059]">Showcase.</span></>
                        )}
                    </h2>
                    {subtitle && (
                        <p className="text-white/60 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {/* FILTER TABS (When both standard and shorts are present) */}
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

                {/* VIDEO GALLERIES */}
                {/* 1. ALL VIEW: Both Full Episodes and Shorts in dedicated harmonious grids */}
                {activeFilter === "all" && hasBothTypes && (
                    <div className="space-y-16 md:space-y-24">
                        {/* Full Episodes Sub-grid */}
                        <div>
                            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]"></span>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                        Full Episodes &amp; Long-Form Interviews
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    16:9 Broadcast Quality
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {standardVideos.map(renderVideoCard)}
                            </div>
                        </div>

                        {/* Podcast Shorts Sub-grid */}
                        <div>
                            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                        Podcast Shorts &amp; Social Highlights
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    9:16 Vertical Mobile Format
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {shortVideos.map(renderVideoCard)}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. FULL EPISODES FILTER */}
                {activeFilter === "episodes" && (
                    <div>
                        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                Full Episode Productions
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                {standardVideos.length} Videos Available
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {standardVideos.map(renderVideoCard)}
                        </div>
                    </div>
                )}

                {/* 3. PODCAST SHORTS FILTER */}
                {activeFilter === "shorts" && (
                    <div>
                        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                                Podcast Shorts &amp; Reels
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                {shortVideos.length} Shorts Available
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {shortVideos.map(renderVideoCard)}
                        </div>
                    </div>
                )}

                {/* 4. DEFAULT SINGLE GRID (For other pages that don't have mixed types) */}
                {!hasBothTypes && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrichedVideos.map(renderVideoCard)}
                    </div>
                )}
            </div>
        </section>
    );
}
