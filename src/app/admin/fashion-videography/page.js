"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

export default function FashionVideographyAdmin() {
    const [pageData, setPageData] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [refreshingId, setRefreshingId] = useState(null);
    const [toast, setToast] = useState({ message: "", type: "success" });

    // Add / Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [videoForm, setVideoForm] = useState({
        title: "",
        url: "",
        description: "",
        thumbnail: "",
        customThumbnail: "",
        order: 1,
        isPublished: true
    });

    // Custom Thumbnail Upload
    const thumbnailInputRef = useRef(null);
    const [uploadingThumbId, setUploadingThumbId] = useState(null);

    useEffect(() => {
        fetchFashionData();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4000);
    };

    const fetchFashionData = async () => {
        setLoading(true);
        try {
            // Fetch service page details
            const [pageRes, videosRes] = await Promise.all([
                axios.get("/api/service-pages?slug=fashion-videography-kolkata"),
                axios.get("/api/admin/videos?serviceSlug=fashion-videography-kolkata")
            ]);

            if (pageRes.data?.servicePage) {
                setPageData(pageRes.data.servicePage);
            }

            if (videosRes.data?.videos) {
                const sorted = [...videosRes.data.videos].sort((a, b) => (a.order || 0) - (b.order || 0));
                setVideos(sorted);
            }
        } catch (err) {
            console.error("Error loading fashion videography data:", err);
            showToast("Failed to load fashion videography settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePageSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.post("/api/admin/services", {
                id: pageData._id,
                slug: "fashion-videography-kolkata",
                title: pageData.title,
                subtitle: pageData.subtitle,
                videoSectionTitle: pageData.videoSectionTitle,
                videoSectionSubtitle: pageData.videoSectionSubtitle,
                showVideoSection: pageData.showVideoSection !== false
            });

            if (res.data?.success) {
                showToast("Fashion videography section settings saved!");
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error saving settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingVideo(null);
        setVideoForm({
            title: "",
            url: "",
            description: "",
            thumbnail: "",
            customThumbnail: "",
            order: videos.length + 1,
            isPublished: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vid) => {
        setEditingVideo(vid);
        setVideoForm({
            title: vid.title || "",
            url: vid.instagramUrl || vid.youtubeUrl || vid.videoUrl || "",
            description: vid.description || "",
            thumbnail: vid.thumbnail || "",
            customThumbnail: vid.customThumbnail || "",
            order: vid.order || 1,
            isPublished: vid.isPublished !== false
        });
        setIsModalOpen(true);
    };

    const handleSaveVideo = async (e) => {
        e.preventDefault();
        if (!videoForm.url) return showToast("Video or Reel URL is required", "error");

        setIsSaving(true);
        try {
            const isInstagram = videoForm.url.includes("instagram.com");
            const payload = {
                id: editingVideo?._id,
                serviceSlug: "fashion-videography-kolkata",
                title: videoForm.title || "Fashion Runway Reel",
                videoUrl: videoForm.url,
                youtubeUrl: isInstagram ? "" : videoForm.url,
                instagramUrl: isInstagram ? videoForm.url : "",
                platform: isInstagram ? "instagram" : "youtube",
                videoType: "shorts",
                description: videoForm.description,
                thumbnail: videoForm.thumbnail,
                customThumbnail: videoForm.customThumbnail,
                order: Number(videoForm.order) || 1,
                isPublished: Boolean(videoForm.isPublished)
            };

            const res = await axios.post("/api/admin/videos", payload);
            if (res.data?.success) {
                showToast(editingVideo ? "Reel updated successfully!" : "New Reel added to Fashion Videography!");
                setIsModalOpen(false);
                fetchFashionData();
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error saving video", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!confirm("Are you sure you want to permanently delete this Reel card?")) return;
        try {
            const res = await axios.delete(`/api/admin/videos?id=${id}&serviceSlug=fashion-videography-kolkata`);
            if (res.data?.success) {
                showToast("Video deleted successfully.");
                setVideos(prev => prev.filter(v => v._id !== id));
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error deleting video", "error");
        }
    };

    const handleTogglePublish = async (vid) => {
        const nextState = !vid.isPublished;
        try {
            await axios.post("/api/admin/videos", {
                id: vid._id,
                serviceSlug: "fashion-videography-kolkata",
                isPublished: nextState
            });
            setVideos(prev => prev.map(v => v._id === vid._id ? { ...v, isPublished: nextState } : v));
            showToast(nextState ? "Reel published to gallery!" : "Reel hidden from gallery.");
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    const handleRefreshPoster = async (vid) => {
        setRefreshingId(vid._id);
        try {
            const res = await axios.post("/api/admin/videos", {
                action: "refresh-thumbnail",
                id: vid._id,
                serviceSlug: "fashion-videography-kolkata"
            });
            if (res.data?.success) {
                showToast("Poster refreshed successfully from Instagram!");
                setVideos(prev => prev.map(v => v._id === vid._id ? { ...v, thumbnail: res.data.thumbnail, customThumbnail: res.data.thumbnail } : v));
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error refreshing poster", "error");
        } finally {
            setRefreshingId(null);
        }
    };

    const handleMoveOrder = async (idx, direction) => {
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= videos.length) return;

        const updated = [...videos];
        const [moved] = updated.splice(idx, 1);
        updated.splice(targetIdx, 0, moved);

        // Update orders sequentially
        const reordered = updated.map((v, i) => ({ ...v, order: i + 1 }));
        setVideos(reordered);

        try {
            for (const item of reordered) {
                await axios.post("/api/admin/videos", {
                    id: item._id,
                    serviceSlug: "fashion-videography-kolkata",
                    order: item.order
                });
            }
            showToast("Reel order updated!");
        } catch (err) {
            showToast("Failed to persist order", "error");
        }
    };

    const handleUploadCustomThumb = async (e, vid) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingThumbId(vid._id);
        try {
            const formData = new FormData();
            formData.append("files", file);

            const uploadRes = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (uploadRes.data?.success && uploadRes.data.url) {
                const newThumb = uploadRes.data.url;
                await axios.post("/api/admin/videos", {
                    id: vid._id,
                    serviceSlug: "fashion-videography-kolkata",
                    customThumbnail: newThumb,
                    thumbnail: newThumb
                });
                showToast("Custom thumbnail uploaded and updated!");
                setVideos(prev => prev.map(v => v._id === vid._id ? { ...v, thumbnail: newThumb, customThumbnail: newThumb } : v));
            }
        } catch (err) {
            showToast("Upload failed", "error");
        } finally {
            setUploadingThumbId(null);
        }
    };

    return (
        <div className="space-y-10 pb-32 max-w-6xl">
            {/* TOAST */}
            {toast.message && (
                <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${
                    toast.type === "error" 
                        ? "bg-red-950/90 border-red-500/50 text-red-200" 
                        : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                }`}>
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                        <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em]">Dedicated Service CMS</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Fashion <span className="text-gray-500">Videography.</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Complete control over Fashion Reels, thumbnails, headings, and section visibility without touching source code.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/services/fashion-videography-kolkata/"
                        target="_blank"
                        className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <span>👁️</span> View on Live Website
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 rounded-2xl bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                        <span>➕</span> Add New Reel
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 uppercase text-xs font-black tracking-widest">Loading fashion videography controls...</p>
                </div>
            ) : (
                <>
                    {/* SECTION 1: SECTION HEADINGS & DISPLAY CONTROLS */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">
                                    Section Titles &amp; Page Headings
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Edit the public headings or toggle section visibility without editing code.
                                </p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                Live In Database
                            </span>
                        </div>

                        {pageData && (
                            <form onSubmit={handleSavePageSettings} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            Video Showcase Section Title
                                        </label>
                                        <input
                                            type="text"
                                            value={pageData.videoSectionTitle || ""}
                                            onChange={(e) => setPageData(prev => ({ ...prev, videoSectionTitle: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            Page Header Eyebrow / Category Label
                                        </label>
                                        <input
                                            type="text"
                                            value={pageData.subtitle || ""}
                                            onChange={(e) => setPageData(prev => ({ ...prev, subtitle: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Video Section Subtitle / Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={pageData.videoSectionSubtitle || ""}
                                        onChange={(e) => setPageData(prev => ({ ...prev, videoSectionSubtitle: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="showVideoSection"
                                            checked={pageData.showVideoSection !== false}
                                            onChange={(e) => setPageData(prev => ({ ...prev, showVideoSection: e.target.checked }))}
                                            className="w-4 h-4 rounded accent-[#c5a059]"
                                        />
                                        <label htmlFor="showVideoSection" className="text-xs font-bold text-gray-300 cursor-pointer">
                                            Display Video Showcase on public website
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20"
                                    >
                                        {isSaving ? "Saving..." : "Save Section Settings"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* SECTION 2: INSTAGRAM REELS GALLERY LIST */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">
                                    Instagram Reels Gallery ({videos.length} Active Cards)
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Manage, reorder, refresh posters, and edit your 9:16 vertical fashion reel cards.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {videos.map((vid, idx) => {
                                const poster = vid.customThumbnail || vid.thumbnail || "/placeholder.jpg";
                                const isIg = vid.instagramUrl || vid.youtubeUrl?.includes("instagram.com");

                                return (
                                    <div
                                        key={vid._id}
                                        className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#c5a059]/50 transition-all shadow-xl"
                                    >
                                        {/* POSTER CARD (9:16) */}
                                        <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                                            <img
                                                src={poster}
                                                alt={vid.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* OVERLAY BADGE */}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                <span className="bg-black/80 backdrop-blur-md text-[#c5a059] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10">
                                                    #{idx + 1}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    vid.isPublished ? "bg-emerald-500/90 text-black" : "bg-red-500/80 text-white"
                                                }`}>
                                                    {vid.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </div>

                                            {/* PLAY ICON OVERLAY */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-[#c5a059]/90 text-black flex items-center justify-center shadow-lg font-black text-xs">
                                                    ▶
                                                </div>
                                            </div>
                                        </div>

                                        {/* INFO & CONTROLS */}
                                        <div className="p-3 bg-[#0a0a0a] border-t border-white/5 space-y-3 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-[11px] font-black uppercase text-white truncate" title={vid.title}>
                                                    {vid.title}
                                                </h4>
                                                <a
                                                    href={vid.instagramUrl || vid.youtubeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[9px] text-gray-500 hover:text-[#c5a059] truncate block mt-0.5"
                                                >
                                                    {vid.instagramUrl || vid.youtubeUrl} ↗
                                                </a>
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveOrder(idx, "up")}
                                                        disabled={idx === 0}
                                                        className="flex-1 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-[9px] font-black uppercase text-gray-300"
                                                        title="Move left/up"
                                                    >
                                                        ◀ Up
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveOrder(idx, "down")}
                                                        disabled={idx === videos.length - 1}
                                                        className="flex-1 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-[9px] font-black uppercase text-gray-300"
                                                        title="Move right/down"
                                                    >
                                                        Down ▶
                                                    </button>
                                                </div>

                                                {/* POSTER REFRESH / UPLOAD */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRefreshPoster(vid)}
                                                    disabled={refreshingId === vid._id}
                                                    className="w-full py-1 bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 rounded text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                                                >
                                                    <span>{refreshingId === vid._id ? "⏳" : "🔄"}</span>
                                                    {refreshingId === vid._id ? "Fetching..." : "Refresh Poster"}
                                                </button>

                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(vid)}
                                                        className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[9px] font-black uppercase"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePublish(vid)}
                                                        className={`flex-1 py-1 rounded text-[9px] font-black uppercase ${
                                                            vid.isPublished ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                                                        }`}
                                                    >
                                                        {vid.isPublished ? "Hide" : "Publish"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteVideo(vid._id)}
                                                        className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[9px] font-black"
                                                        title="Delete Reel"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ADD / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-lg font-black uppercase text-white">
                                {editingVideo ? "Edit Fashion Reel" : "Add New Instagram Reel"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:text-white flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveVideo} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Instagram Reel or Video URL *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="https://www.instagram.com/.../reel/.../"
                                    value={videoForm.url}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Reel Title / Collection Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Spark Blue Diamond — Haute Couture Reel"
                                    value={videoForm.title}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={videoForm.order}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, order: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isPublishedModal"
                                    checked={videoForm.isPublished}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                                    className="w-4 h-4 rounded accent-[#c5a059]"
                                />
                                <label htmlFor="isPublishedModal" className="text-xs font-bold text-gray-300">
                                    Publish immediately to public showcase
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-[#c5a059] hover:bg-white text-black font-black uppercase text-xs rounded-xl shadow-lg shadow-[#c5a059]/20"
                                >
                                    {isSaving ? "Saving..." : "Save Reel"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
