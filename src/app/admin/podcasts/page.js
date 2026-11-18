"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

export default function PodcastAdmin() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Filters and pagination
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [categories, setCategories] = useState([]);
    const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0, standard: 0, shorts: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 30;

    // Drag and Drop State
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [showCustomThumbUpload, setShowCustomThumbUpload] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        youtubeUrl: "",
        youtubeId: "",
        description: "",
        category: "General",
        newCategory: "",
        videoType: "standard",
        thumbnail: "",
        displayOrder: 1,
        status: "published"
    });

    const showToast = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    };

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const detectVideoType = (url) => {
        if (!url) return "standard";
        return url.includes("/shorts/") ? "shorts" : "standard";
    };

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                status: statusFilter,
                videoType: typeFilter,
                category: categoryFilter,
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });

            const res = await axios.get(`/api/admin/podcasts?${params.toString()}`);
            if (res.data.success) {
                setVideos(res.data.items || []);
                setCategories(res.data.categories || []);
                setCounts(res.data.counts || {});
                setTotalPages(res.data.totalPages || 1);
            }
        } catch (err) {
            console.error("Failed to load podcast videos:", err);
            showToast("Failed to load podcast videos", "error");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, typeFilter, categoryFilter, currentPage]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Handle typing or pasting YouTube URL
    const handleUrlChange = async (url) => {
        const trimmed = url.trim();
        const detectedId = extractYouTubeId(trimmed);
        const detectedType = detectVideoType(trimmed);
        
        let autoThumb = "";
        if (detectedId) {
            autoThumb = `https://img.youtube.com/vi/${detectedId}/hqdefault.jpg`;
        }

        setFormData(prev => ({
            ...prev,
            youtubeUrl: trimmed,
            youtubeId: detectedId || "",
            videoType: detectedType,
            thumbnail: prev.thumbnail || autoThumb
        }));

        // Try auto-fetching video title via oEmbed if empty
        if (detectedId && !formData.title) {
            try {
                const oRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`);
                if (oRes.ok) {
                    const data = await oRes.json();
                    if (data.title) {
                        setFormData(prev => ({ ...prev, title: prev.title || data.title }));
                    }
                }
            } catch (e) {
                // Ignore silent oEmbed errors
            }
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        const nextOrder = (counts.total || 0) + 1;
        setFormData({
            title: "",
            youtubeUrl: "",
            youtubeId: "",
            description: "",
            category: categories[0] || "General",
            newCategory: "",
            videoType: "standard",
            thumbnail: "",
            displayOrder: nextOrder,
            status: "published"
        });
        setShowCustomThumbUpload(false);
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            youtubeUrl: item.youtubeUrl,
            youtubeId: item.youtubeId,
            description: item.description || "",
            category: item.category || "General",
            newCategory: "",
            videoType: item.videoType || "standard",
            thumbnail: item.thumbnail || "",
            displayOrder: item.displayOrder || 1,
            status: item.status || "published"
        });
        setShowCustomThumbUpload(false);
    };

    // Submit Create or Edit
    const handleSaveVideo = async (e) => {
        e.preventDefault();

        if (!formData.youtubeUrl) {
            showToast("Please enter a YouTube video URL", "error");
            return;
        }

        const ytId = extractYouTubeId(formData.youtubeUrl);
        if (!ytId) {
            showToast("Invalid YouTube URL. Please provide a valid watch or shorts link.", "error");
            return;
        }

        if (!formData.title) {
            showToast("Please enter a video title", "error");
            return;
        }

        const finalCategory = formData.newCategory.trim() ? formData.newCategory.trim() : formData.category;
        const finalThumb = formData.thumbnail.trim() || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

        const payload = {
            title: formData.title.trim(),
            youtubeUrl: formData.youtubeUrl.trim(),
            youtubeId: ytId,
            description: formData.description.trim(),
            category: finalCategory,
            videoType: formData.videoType,
            thumbnail: finalThumb,
            displayOrder: parseInt(formData.displayOrder, 10) || 1,
            status: formData.status
        };

        try {
            setSaving(true);
            if (editingItem) {
                const res = await axios.put(`/api/admin/podcasts/${editingItem._id}`, payload);
                if (res.data.success) {
                    showToast("Podcast video updated successfully!");
                    setEditingItem(null);
                    fetchVideos();
                }
            } else {
                const res = await axios.post("/api/admin/podcasts", payload);
                if (res.data.success) {
                    showToast("New podcast video published to website!");
                    setIsAddModalOpen(false);
                    fetchVideos();
                }
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast(err.response?.data?.error || "Failed to save podcast video", "error");
        } finally {
            setSaving(false);
        }
    };

    // Quick toggle publish status
    const toggleStatus = async (item) => {
        const nextStatus = item.status === "published" ? "draft" : "published";
        try {
            const res = await axios.put(`/api/admin/podcasts/${item._id}`, { status: nextStatus });
            if (res.data.success) {
                showToast(`Video ${nextStatus === "published" ? "published live" : "moved to drafts"}`);
                setVideos(prev => prev.map(v => v._id === item._id ? { ...v, status: nextStatus } : v));
                setCounts(prev => ({
                    ...prev,
                    published: nextStatus === "published" ? prev.published + 1 : prev.published - 1,
                    draft: nextStatus === "draft" ? prev.draft + 1 : prev.draft - 1
                }));
            }
        } catch (err) {
            showToast("Failed to change publication status", "error");
        }
    };

    // Delete item
    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            setSaving(true);
            const res = await axios.delete(`/api/admin/podcasts/${itemToDelete._id}`);
            if (res.data.success) {
                showToast("Podcast video deleted successfully");
                setItemToDelete(null);
                fetchVideos();
            }
        } catch (err) {
            showToast("Failed to delete video", "error");
        } finally {
            setSaving(false);
        }
    };

    // Move order up / down
    const handleMoveOrder = async (index, direction) => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= videos.length) return;

        const reordered = [...videos];
        const temp = reordered[index];
        reordered[index] = reordered[targetIndex];
        reordered[targetIndex] = temp;

        setVideos(reordered);

        try {
            await axios.post("/api/admin/podcasts", {
                action: "reorder",
                items: reordered.map((v, idx) => ({ _id: v._id, displayOrder: idx + 1 }))
            });
            showToast("Video order updated");
        } catch (err) {
            showToast("Failed to update order", "error");
            fetchVideos();
        }
    };

    // Drag and drop reordering
    const handleDragStart = (e, index) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverIdx !== index) {
            setDragOverIdx(index);
        }
    };

    const handleDragEnd = async () => {
        if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
            const reordered = [...videos];
            const [movedItem] = reordered.splice(draggedIdx, 1);
            reordered.splice(dragOverIdx, 0, movedItem);
            setVideos(reordered);

            try {
                await axios.post("/api/admin/podcasts", {
                    action: "reorder",
                    items: reordered.map((v, idx) => ({ _id: v._id, displayOrder: idx + 1 }))
                });
                showToast("Videos reordered via drag & drop!");
            } catch (err) {
                showToast("Failed to save reordered videos", "error");
                fetchVideos();
            }
        }
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
            {/* TOAST ALERT */}
            {message.text && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center gap-3 ${
                    message.type === "error"
                        ? "bg-red-500/90 text-white border border-red-400"
                        : "bg-[#c5a059] text-black border border-[#c5a059]"
                }`}>
                    <span>{message.type === "error" ? "⚠️" : "✓"}</span>
                    <span>{message.text}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em] block mb-1">
                        Studio Content Control
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <span>Podcast Video</span>
                        <span className="text-[#c5a059]">Management</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
                        Manage full episodes and vertical shorts shown on the &quot;Podcast Production in Kolkata&quot; service page. Published videos sync live to the website.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/services/podcast-production-kolkata/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 interactive"
                    >
                        <span>View Live Page</span>
                        <span>↗</span>
                    </a>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="px-6 py-3 rounded-full bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2 interactive"
                    >
                        <span className="text-base font-normal">+</span>
                        <span>Add New Video</span>
                    </button>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Total In Library</span>
                    <span className="text-2xl font-black text-white mt-1 block">{counts.total || 0}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Live Published</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">{counts.published || 0}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Drafts Hidden</span>
                    <span className="text-2xl font-black text-amber-400 mt-1 block">{counts.draft || 0}</span>
                </div>
                <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c5a059] block">Format Split</span>
                    <span className="text-xs font-bold text-gray-300 mt-2 block">
                        {counts.standard || 0} Widescreen • {counts.shorts || 0} Shorts
                    </span>
                </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                    <input
                        type="text"
                        placeholder="Search podcast videos by title, description, category or ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                        <option value="all" className="bg-[#111]">All Statuses</option>
                        <option value="published" className="bg-[#111]">Published Only</option>
                        <option value="draft" className="bg-[#111]">Drafts Only</option>
                    </select>

                    {/* Format Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                        <option value="all" className="bg-[#111]">All Formats</option>
                        <option value="standard" className="bg-[#111]">16:9 Standard Episodes</option>
                        <option value="shorts" className="bg-[#111]">9:16 Vertical Shorts</option>
                    </select>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                        >
                            <option value="all" className="bg-[#111]">All Categories</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat} className="bg-[#111]">{cat}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* VIDEOS LIST */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Loading podcast videos...</p>
                </div>
            ) : videos.length === 0 ? (
                <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-12 text-center space-y-4">
                    <span className="text-4xl block">🎙️</span>
                    <h3 className="text-lg font-black uppercase text-white">No Podcast Videos Found</h3>
                    <p className="text-gray-400 text-xs max-w-md mx-auto">
                        {search || statusFilter !== "all" || typeFilter !== "all"
                            ? "No videos match your active search and filter criteria. Try resetting filters."
                            : "Your podcast library is empty. Click 'Add New Video' to paste your first YouTube podcast link."}
                    </p>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-2 px-6 py-2.5 bg-[#c5a059] text-black text-xs font-black uppercase tracking-wider rounded-full hover:bg-white transition-all"
                    >
                        Add Video Now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((item, idx) => {
                            const isShort = item.videoType === "shorts";
                            const ytId = item.youtubeId;
                            const thumbUrl = item.thumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

                            return (
                                <div
                                    key={item._id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-[#0c0c0c] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group cursor-grab active:cursor-grabbing ${
                                        draggedIdx === idx ? "opacity-40 scale-95 border-[#c5a059]" : ""
                                    } ${
                                        dragOverIdx === idx ? "border-[#c5a059] ring-2 ring-[#c5a059]/40" : ""
                                    } ${
                                        item.status === "published"
                                            ? "border-white/10 hover:border-[#c5a059]/50"
                                            : "border-dashed border-white/20 opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    {/* Video Preview Card Area */}
                                    <div className="relative aspect-video w-full bg-black/50 overflow-hidden">
                                        {thumbUrl ? (
                                            <Image
                                                src={thumbUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Thumbnail</div>
                                        )}

                                        {/* Play Overlay to launch preview */}
                                        <button
                                            type="button"
                                            onClick={() => setPreviewVideo(item)}
                                            aria-label={`Preview ${item.title}`}
                                            className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors group/play"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                                                <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Top Badges */}
                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
                                                isShort
                                                    ? "bg-purple-900/80 text-purple-200 border-purple-500/30"
                                                    : "bg-amber-900/80 text-[#c5a059] border-[#c5a059]/30"
                                            }`}>
                                                {isShort ? "9:16 Shorts" : "16:9 Standard"}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/80 text-white/90 border border-white/10 backdrop-blur-md">
                                                Order #{item.displayOrder}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[#c5a059]">
                                                    {item.category || "General"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(item)}
                                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                                                        item.status === "published"
                                                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900"
                                                            : "bg-gray-800/60 text-gray-400 border-gray-600 hover:text-white"
                                                    }`}
                                                >
                                                    {item.status === "published" ? "✓ Published" : "○ Draft"}
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-gray-400 text-xs line-clamp-2 mt-1.5 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions Bar */}
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                            {/* Order Adjuster */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveOrder(idx, "up")}
                                                    disabled={idx === 0}
                                                    title="Move Up"
                                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveOrder(idx, "down")}
                                                    disabled={idx === videos.length - 1}
                                                    title="Move Down"
                                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300"
                                                >
                                                    ↓
                                                </button>
                                            </div>

                                            {/* Preview, Edit & Delete */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewVideo(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-bold"
                                                >
                                                    Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#c5a059] hover:text-black text-[11px] font-bold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setItemToDelete(item)}
                                                    className="w-7 h-7 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 flex items-center justify-center transition-colors"
                                                    title="Delete Video"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-8">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold disabled:opacity-30"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-gray-400 font-bold px-3">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {(isAddModalOpen || editingItem) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-[#111] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest block">
                                    {editingItem ? "Update Database Record" : "Upload to Website"}
                                </span>
                                <h2 className="text-xl font-heading font-black uppercase text-white">
                                    {editingItem ? "Edit Podcast Video" : "Add New Podcast Video"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingItem(null);
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveVideo} className="space-y-5">
                            {/* 1. YouTube URL */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                    YouTube Video URL *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. https://youtu.be/rGCNP3nWC9Y or https://youtube.com/shorts/hRnCf_evOZs"
                                    value={formData.youtubeUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                />
                                {formData.youtubeId ? (
                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400">
                                        <span>✓ Valid YouTube ID: <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">{formData.youtubeId}</code></span>
                                        <span>•</span>
                                        <span className="capitalize">{formData.videoType === "shorts" ? "9:16 Shorts detected" : "16:9 Standard video detected"}</span>
                                    </div>
                                ) : formData.youtubeUrl ? (
                                    <p className="mt-1 text-[11px] text-amber-400">
                                        Paste a valid YouTube link (standard watch URL, youtu.be, or shorts)
                                    </p>
                                ) : null}
                            </div>

                            {/* 2. Title */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Banglar gan with versatile singer Pousali Banerjee | Prompt With Paromita"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* 3. Description */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                    Video Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief overview of the podcast conversation, guests, or key topics discussed..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059] leading-relaxed"
                                />
                            </div>

                            {/* 4. Format & Category Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Video Type */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                        Video Format / Aspect Ratio *
                                    </label>
                                    <select
                                        value={formData.videoType}
                                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="standard">Standard Widescreen (16:9 Full Episode)</option>
                                        <option value="shorts">YouTube Shorts (9:16 Vertical Reel)</option>
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    >
                                        {categories.map((c, i) => (
                                            <option key={i} value={c}>{c}</option>
                                        ))}
                                        <option value="Music & Culture">Music & Culture</option>
                                        <option value="Spiritual & Traditions">Spiritual & Traditions</option>
                                        <option value="Culture & Heritage">Culture & Heritage</option>
                                        <option value="History & Investigation">History & Investigation</option>
                                        <option value="Highlights & Shorts">Highlights & Shorts</option>
                                        <option value="Custom">+ Add New Category</option>
                                    </select>
                                </div>
                            </div>

                            {/* New Category Input if custom selected */}
                            {formData.category === "Custom" && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#c5a059] mb-1.5">
                                        New Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter custom category name (e.g. Business Leadership)"
                                        value={formData.newCategory}
                                        onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                                        className="w-full bg-black border border-[#c5a059]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            )}

                            {/* 5. Thumbnail Option */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">
                                        Thumbnail Image URL
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomThumbUpload(!showCustomThumbUpload)}
                                        className="text-[10px] font-bold text-[#c5a059] hover:underline"
                                    >
                                        {showCustomThumbUpload ? "Close Uploader" : "Upload Custom Image"}
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Auto-generated YouTube thumbnail URL"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                />

                                {showCustomThumbUpload && (
                                    <div className="mt-3 p-4 bg-black/40 border border-white/5 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 block">
                                            Upload Custom Thumbnail File
                                        </span>
                                        <ImageUploader
                                            onUploadSuccess={(url) => {
                                                setFormData({ ...formData, thumbnail: url });
                                                setShowCustomThumbUpload(false);
                                                showToast("Custom thumbnail uploaded!");
                                            }}
                                            currentImage={formData.thumbnail}
                                            compact={true}
                                            category="commercial"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 6. Order & Publication Status Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                                        Publication Status *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="published">Published (Visible on Live Website)</option>
                                        <option value="draft">Draft (Hidden from Public)</option>
                                    </select>
                                </div>
                            </div>

                            {/* LIVE PREVIEW BOX */}
                            {formData.youtubeId && (
                                <div className="p-4 bg-black border border-white/10 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                            Live Embed Preview
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {formData.videoType === "shorts" ? "9:16 Shorts Player" : "16:9 Cinema Player"}
                                        </span>
                                    </div>
                                    <div className={`overflow-hidden rounded-xl border border-white/10 mx-auto ${
                                        formData.videoType === "shorts" ? "aspect-[9/16] max-w-[240px]" : "aspect-video w-full"
                                    }`}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${formData.youtubeId}`}
                                            title="YouTube Preview"
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SUBMIT BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingItem(null);
                                    }}
                                    className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-2.5 rounded-full bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#c5a059]/20"
                                >
                                    {saving ? "Saving to Database..." : editingItem ? "Update Video" : "Publish Video"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PREVIEW VIDEO MODAL */}
            {previewVideo && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    onClick={() => setPreviewVideo(null)}
                >
                    <div 
                        className={`bg-[#0c0c0c] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col ${
                            previewVideo.videoType === "shorts" ? "aspect-[9/16] w-full max-w-sm" : "aspect-video w-full max-w-4xl"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${previewVideo.youtubeId}?autoplay=1&rel=0`}
                            title={previewVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewVideo(null)}
                            aria-label="Close Preview"
                            className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-[#c5a059] text-white hover:text-black border border-white/20 text-xs font-black uppercase tracking-widest backdrop-blur-md transition-all"
                        >
                            Close ✕
                        </button>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
                        <span className="text-4xl block">🗑️</span>
                        <h3 className="text-lg font-heading font-black uppercase text-white">
                            Delete Podcast Video?
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Are you sure you want to remove <span className="text-white font-bold">&quot;{itemToDelete.title}&quot;</span> from the podcast library? This will immediately remove it from the public website.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setItemToDelete(null)}
                                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                {saving ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
