"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";
import BulkPhotoUploader from "@/components/admin/BulkPhotoUploader";
import Link from "next/link";

export default function WeddingAlbumAdmin() {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeAlbum, setActiveAlbum] = useState(null); // The album currently being managed
    const [activeTab, setActiveTab] = useState("PHOTOS"); // 'PHOTOS' | 'DETAILS'
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Photo actions states
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const [replacingPhotoIndex, setReplacingPhotoIndex] = useState(null);
    const [albumToDelete, setAlbumToDelete] = useState(null);

    // Drag and drop reordering state
    const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
    const [dragOverPhotoIndex, setDragOverPhotoIndex] = useState(null);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/weddings/albums?all=true");
            setAlbums(res.data || []);
        } catch (err) {
            console.error("Failed to load wedding albums:", err);
            // Fallback to legacy weddings API if needed
            try {
                const legacyRes = await axios.get("/api/weddings");
                const bootstrapped = (legacyRes.data || []).map(w => ({
                    albumId: `album-${w.id}`,
                    weddingId: w.id,
                    title: w.title,
                    subtitle: w.subtitle || "",
                    clientNames: w.clientNames || w.title,
                    description: w.description || "",
                    location: w.location || "Kolkata",
                    date: w.date,
                    coverImage: w.coverImage || w.img || (w.images && w.images[0]) || "",
                    videoUrl: w.videoUrl || "",
                    albumUrl: w.albumUrl || "",
                    published: w.published !== false,
                    order: w.order || 0,
                    photos: (w.images || []).map((url, i) => ({
                        id: `photo-${i}-${Date.now()}`,
                        albumId: `album-${w.id}`,
                        url,
                        caption: "",
                        altText: (w.imageAltTexts && w.imageAltTexts[i]) || `${w.title} photo`,
                        order: i + 1,
                        isCover: url === (w.coverImage || w.img)
                    }))
                }));
                setAlbums(bootstrapped);
            } catch (e2) {
                console.error("Failed legacy fallback:", e2);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Create New Wedding Album ---
    const startNewAlbum = () => {
        const newWeddingId = `wedding-${Date.now()}`;
        const newAlbumId = `album-${newWeddingId}`;
        const fresh = {
            albumId: newAlbumId,
            weddingId: newWeddingId,
            title: "NEW WEDDING STORY",
            subtitle: "Luxury Bengali Wedding",
            clientNames: "Couple Names",
            description: "A grand celebration of love, heritage, and timeless wedding rituals documented with cinematic vision in Kolkata.",
            location: "Kolkata, India",
            date: new Date().toISOString().split("T")[0],
            coverImage: "",
            videoUrl: "",
            albumUrl: "",
            published: true,
            order: albums.length + 1,
            photos: []
        };
        setActiveAlbum(fresh);
        setActiveTab("PHOTOS");
    };

    // --- Save Active Album ---
    const handleSaveAlbum = async () => {
        if (!activeAlbum) return;
        if (!activeAlbum.title || !activeAlbum.title.trim()) {
            alert("Album title is required.");
            return;
        }

        setSaving(true);
        setStatusMessage("Archiving album changes to database...");

        try {
            // Determine cover image
            let coverImage = activeAlbum.coverImage;
            const coverPhoto = activeAlbum.photos?.find(p => p.isCover);
            if (coverPhoto) {
                coverImage = coverPhoto.url;
            } else if (!coverImage && activeAlbum.photos?.length > 0) {
                coverImage = activeAlbum.photos[0].url;
            }

            const payload = {
                ...activeAlbum,
                coverImage,
                photos: (activeAlbum.photos || []).map((p, idx) => ({
                    ...p,
                    albumId: activeAlbum.albumId,
                    order: idx + 1,
                    isCover: p.url === coverImage
                }))
            };

            const isNew = !albums.some(a => a.albumId === activeAlbum.albumId);
            let res;
            if (isNew) {
                res = await axios.post("/api/admin/weddings/albums", payload);
            } else {
                res = await axios.put("/api/admin/weddings/albums", payload);
            }

            if (res.data?.success || res.status === 200 || res.status === 201) {
                setStatusMessage("✓ Album saved and synchronized across live website!");
                await fetchAlbums();
                if (res.data?.album) {
                    setActiveAlbum(res.data.album);
                }
                setTimeout(() => setStatusMessage(""), 4000);
            }
        } catch (err) {
            console.error("Save album error:", err);
            alert(err.response?.data?.error || "Error saving wedding album.");
            setStatusMessage("");
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Album ---
    const confirmDeleteAlbum = async () => {
        if (!albumToDelete) return;
        setSaving(true);
        try {
            await axios.delete(`/api/admin/weddings/albums?albumId=${albumToDelete.albumId}&weddingId=${albumToDelete.weddingId}`);
            setAlbums(prev => prev.filter(a => a.albumId !== albumToDelete.albumId));
            if (activeAlbum?.albumId === albumToDelete.albumId) {
                setActiveAlbum(null);
            }
            setAlbumToDelete(null);
            alert("Wedding album removed successfully.");
        } catch (err) {
            console.error("Delete album error:", err);
            alert("Error removing wedding album.");
        } finally {
            setSaving(false);
        }
    };

    // --- Bulk Photos Ingestion ---
    const handleBulkPhotosUploaded = (uploadedList) => {
        if (!activeAlbum || !uploadedList || uploadedList.length === 0) return;

        const currentPhotos = [...(activeAlbum.photos || [])];
        const newPhotos = uploadedList.map((item, i) => ({
            id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
            albumId: activeAlbum.albumId,
            url: item.url,
            caption: "",
            altText: `${activeAlbum.title || 'Wedding'} ceremony capture Kolkata`,
            order: currentPhotos.length + i + 1,
            isCover: currentPhotos.length === 0 && i === 0,
            createdAt: new Date()
        }));

        const merged = [...currentPhotos, ...newPhotos];
        let newCover = activeAlbum.coverImage;
        if (!newCover && merged.length > 0) {
            newCover = merged[0].url;
            merged[0].isCover = true;
        }

        setActiveAlbum({
            ...activeAlbum,
            photos: merged,
            coverImage: newCover
        });
    };

    // --- Set as Cover ---
    const setPhotoAsCover = (url) => {
        if (!activeAlbum || !url) return;
        const updatedPhotos = (activeAlbum.photos || []).map(p => ({
            ...p,
            isCover: p.url === url
        }));
        setActiveAlbum({
            ...activeAlbum,
            coverImage: url,
            photos: updatedPhotos
        });
    };

    // --- Reorder Photos ---
    const movePhoto = (index, direction) => {
        if (!activeAlbum?.photos) return;
        const target = index + direction;
        if (target < 0 || target >= activeAlbum.photos.length) return;

        const arr = [...activeAlbum.photos];
        const temp = arr[index];
        arr[index] = arr[target];
        arr[target] = temp;

        const resequenced = arr.map((p, i) => ({ ...p, order: i + 1 }));
        setActiveAlbum({ ...activeAlbum, photos: resequenced });
    };

    // HTML5 Drag and Drop for Photos
    const handleDragStart = (e, index) => {
        setDraggedPhotoIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverPhotoIndex !== index) {
            setDragOverPhotoIndex(index);
        }
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) {
            setDraggedPhotoIndex(null);
            setDragOverPhotoIndex(null);
            return;
        }

        const photos = [...(activeAlbum.photos || [])];
        const [moved] = photos.splice(draggedPhotoIndex, 1);
        photos.splice(targetIndex, 0, moved);

        const resequenced = photos.map((p, i) => ({ ...p, order: i + 1 }));
        setActiveAlbum({ ...activeAlbum, photos: resequenced });
        setDraggedPhotoIndex(null);
        setDragOverPhotoIndex(null);
    };

    // --- Delete Photo ---
    const confirmDeletePhoto = () => {
        if (!photoToDelete || !activeAlbum) return;
        const filtered = (activeAlbum.photos || []).filter(p => p.id !== photoToDelete.id && p.url !== photoToDelete.url);
        
        let newCover = activeAlbum.coverImage;
        if (photoToDelete.url === activeAlbum.coverImage) {
            newCover = filtered[0]?.url || "";
            if (filtered[0]) filtered[0].isCover = true;
        }

        const resequenced = filtered.map((p, i) => ({ ...p, order: i + 1 }));
        setActiveAlbum({
            ...activeAlbum,
            photos: resequenced,
            coverImage: newCover
        });
        setPhotoToDelete(null);
    };

    // --- Replace Photo ---
    const handleReplacePhoto = (index, newUrl) => {
        if (!activeAlbum?.photos) return;
        const photos = [...activeAlbum.photos];
        const wasCover = photos[index].isCover || photos[index].url === activeAlbum.coverImage;
        
        photos[index] = {
            ...photos[index],
            url: newUrl,
            isCover: wasCover
        };

        const update = { ...activeAlbum, photos };
        if (wasCover) update.coverImage = newUrl;
        setActiveAlbum(update);
        setReplacingPhotoIndex(null);
    };

    // Filter albums by search
    const filteredAlbums = albums.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
            a.title?.toLowerCase().includes(q) ||
            a.clientNames?.toLowerCase().includes(q) ||
            a.location?.toLowerCase().includes(q) ||
            a.weddingId?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Loading Wedding Albums Archive...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32">
            {/* =========================================================================
                VIEW 1: ALL WEDDING ALBUMS LIST OVERVIEW
               ========================================================================= */}
            {!activeAlbum && (
                <>
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                        <div>
                            <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-2 inline-block">
                                Studio CMS • Wedding Category
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                                Wedding <span className="text-[#c5a059] italic">Album</span> Management
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
                                Upload, organize, edit, and manage photographs for each individual wedding project. Every couple project maintains its own isolated album, cover photo, ordering, and publication controls.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={startNewAlbum}
                                className="px-6 py-3 rounded-full bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_25px_rgba(197,160,89,0.3)] active:scale-95 flex items-center gap-2"
                            >
                                <span>+</span> Register New Album
                            </button>
                            <Link
                                href="/gallery"
                                target="_blank"
                                className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase text-xs tracking-widest transition-all"
                            >
                                View Live Gallery ↗
                            </Link>
                        </div>
                    </header>

                    {/* Stats & Search Filter Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div>
                                <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider block">Total Albums</span>
                                <span className="text-white text-lg font-black">{albums.length}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div>
                                <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider block">Published</span>
                                <span className="text-emerald-400 text-lg font-black">
                                    {albums.filter(a => a.published !== false).length}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div>
                                <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider block">Total Photographs</span>
                                <span className="text-[#c5a059] text-lg font-black">
                                    {albums.reduce((acc, a) => acc + (a.photos?.length || 0), 0)}
                                </span>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="w-full sm:w-72 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search couple or venue..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#c5a059]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Wedding Albums Grid */}
                    {filteredAlbums.length === 0 ? (
                        <div className="text-center py-24 bg-[#090909] border border-dashed border-white/10 rounded-3xl">
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">
                                No wedding albums match your search query.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="mt-4 text-[#c5a059] text-xs font-black uppercase tracking-widest hover:underline"
                            >
                                Clear Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAlbums.map((album) => {
                                const photoCount = album.photos?.length || 0;
                                const coverSrc = album.coverImage || (album.photos && album.photos[0]?.url) || "/thumbnails/seo_thumb_holud.jpg";

                                return (
                                    <div
                                        key={album.albumId || album.weddingId}
                                        className="bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden hover:border-[#c5a059]/40 transition-all flex flex-col group shadow-xl relative"
                                    >
                                        {/* Cover Image & Badges */}
                                        <div className="aspect-[16/10] relative overflow-hidden bg-zinc-950">
                                            <img
                                                src={coverSrc}
                                                alt={album.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                                                    album.published !== false
                                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                }`}>
                                                    {album.published !== false ? "● Published" : "○ Draft"}
                                                </span>
                                            </div>

                                            {/* Photo Count Badge */}
                                            <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase text-[#c5a059]">
                                                📸 {photoCount} photo{photoCount !== 1 ? 's' : ''}
                                            </div>

                                            {/* Location Tag Bottom Left */}
                                            <div className="absolute bottom-3 left-3 text-white/80 text-[10px] font-black uppercase tracking-widest truncate max-w-[80%]">
                                                📍 {album.location || "Kolkata"}
                                            </div>
                                        </div>

                                        {/* Content Information */}
                                        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                            <div>
                                                <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest">
                                                    {album.subtitle || "Luxury Wedding"}
                                                </span>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1 group-hover:text-[#c5a059] transition-colors">
                                                    {album.title}
                                                </h3>
                                                {album.clientNames && album.clientNames !== album.title && (
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                        Couple: {album.clientNames}
                                                    </p>
                                                )}
                                                {album.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 font-light leading-relaxed">
                                                        {album.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveAlbum(album);
                                                        setActiveTab("PHOTOS");
                                                    }}
                                                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#c5a059] text-black font-black uppercase text-[10px] tracking-wider hover:bg-white transition-all shadow-md active:scale-95 text-center"
                                                >
                                                    Open Album &amp; Photos →
                                                </button>
                                                <Link
                                                    href={`/wedding/${album.weddingId}`}
                                                    target="_blank"
                                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs transition-colors shrink-0"
                                                    title="View Public Album"
                                                >
                                                    ↗
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setAlbumToDelete(album)}
                                                    className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs transition-colors shrink-0"
                                                    title="Delete Album"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* =========================================================================
                VIEW 2: INDIVIDUAL WEDDING ALBUM MANAGEMENT INTERFACE
               ========================================================================= */}
            {activeAlbum && (
                <div className="space-y-8 animate-fade-in">
                    {/* Top Sticky Header */}
                    <div className="sticky top-16 z-30 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setActiveAlbum(null)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                            >
                                <span>←</span> All Albums
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest">
                                        Active Wedding Project
                                    </span>
                                    <span className="text-gray-500 text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        ID: {activeAlbum.weddingId}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                                    {activeAlbum.title || "Untitled Project"}
                                </h2>
                            </div>
                        </div>

                        {/* Controls & Save */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            {/* Publish Switch */}
                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                                <input
                                    type="checkbox"
                                    checked={activeAlbum.published !== false}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, published: e.target.checked })}
                                    className="w-4 h-4 accent-[#c5a059]"
                                />
                                <span className="text-[10px] font-black uppercase text-white tracking-wider">
                                    {activeAlbum.published !== false ? "Published" : "Draft"}
                                </span>
                            </label>

                            <Link
                                href={`/wedding/${activeAlbum.weddingId}`}
                                target="_blank"
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-all"
                            >
                                View Live ↗
                            </Link>

                            <button
                                type="button"
                                onClick={handleSaveAlbum}
                                disabled={saving}
                                className="px-8 py-2.5 rounded-xl bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] disabled:opacity-50 active:scale-95 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        <span>Archiving...</span>
                                    </>
                                ) : (
                                    <span>Save Album Changes</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Status Alert Banner */}
                    {statusMessage && (
                        <div className="bg-[#c5a059]/15 border border-[#c5a059]/50 rounded-2xl p-4 text-[#c5a059] text-xs font-black uppercase tracking-wider flex items-center justify-between animate-fade-in">
                            <span>{statusMessage}</span>
                            <button type="button" onClick={() => setStatusMessage("")} className="text-white text-xs">✕</button>
                        </div>
                    )}

                    {/* Sub-Nav Tabs */}
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("PHOTOS")}
                            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === "PHOTOS"
                                    ? "bg-[#c5a059] text-black shadow-lg"
                                    : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            📸 Album Photographs ({activeAlbum.photos?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("DETAILS")}
                            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === "DETAILS"
                                    ? "bg-[#c5a059] text-black shadow-lg"
                                    : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            📝 Album Details &amp; Narrative
                        </button>
                    </div>

                    {/* =================================================================
                        TAB A: PHOTOGRAPHS & GALLERY MANAGEMENT
                       ================================================================= */}
                    {activeTab === "PHOTOS" && (
                        <div className="space-y-10">
                            {/* Featured Cover Hero Bar */}
                            <div className="bg-[#0b0b0b] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-full md:w-56 aspect-[16/10] rounded-2xl overflow-hidden bg-black relative border border-white/10 shrink-0">
                                    <img
                                        src={activeAlbum.coverImage || "/thumbnails/seo_thumb_holud.jpg"}
                                        alt={activeAlbum.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/80 px-2.5 py-1 rounded-full text-[8px] font-black uppercase text-[#c5a059] border border-white/10">
                                        ★ Main Cover
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em]">
                                        Album Showcase Image
                                    </span>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        Primary Featured Photograph
                                    </h3>
                                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                                        This image serves as the main cover across the Master Gallery, portfolio hub, and individual wedding page. You can set any photograph below as cover with a single click.
                                    </p>
                                </div>
                            </div>

                            {/* Bulk Photo Ingestion & Upload Area */}
                            <BulkPhotoUploader
                                albumTitle={activeAlbum.title}
                                onPhotosUploaded={handleBulkPhotosUploaded}
                            />

                            {/* Photograph Collection Grid Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4">
                                <div>
                                    <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest">
                                        Photo Grid &amp; Sequence
                                    </span>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        Album Photograph Collection ({activeAlbum.photos?.length || 0} Frames)
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Drag &amp; drop cards to reorder sequence. Click "Set as Cover" to update the hero portrait. Edit captions and alt texts per photo.
                                    </p>
                                </div>
                            </div>

                            {/* Photos List Grid */}
                            {(!activeAlbum.photos || activeAlbum.photos.length === 0) ? (
                                <div className="text-center py-20 bg-[#090909] border border-dashed border-white/10 rounded-3xl">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-xl text-[#c5a059] mb-3">
                                        📸
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
                                        This wedding album currently has no photographs.
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Use the bulk upload drop zone above to ingest authentic wedding images.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {activeAlbum.photos.map((photo, index) => {
                                        const isCover = photo.isCover || photo.url === activeAlbum.coverImage;
                                        const isDragging = draggedPhotoIndex === index;
                                        const isOver = dragOverPhotoIndex === index;
                                        const isReplacing = replacingPhotoIndex === index;

                                        return (
                                            <div
                                                key={photo.id || index}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                className={`bg-[#0c0c0c] rounded-2xl border p-4 flex flex-col justify-between transition-all select-none ${
                                                    isCover
                                                        ? "border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.25)] ring-1 ring-[#c5a059]/50"
                                                        : "border-white/10 hover:border-white/30"
                                                } ${isDragging ? "opacity-30 scale-95" : ""} ${
                                                    isOver ? "border-amber-400 bg-amber-400/5 scale-[1.02]" : ""
                                                }`}
                                            >
                                                {/* Image Frame */}
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 group/img">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.altText || `${activeAlbum.title} frame ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                                    />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                                                        <span className="bg-black/85 backdrop-blur-md text-[9px] font-black text-gray-300 px-2 py-0.5 rounded-full border border-white/10">
                                                            #{index + 1}
                                                        </span>
                                                        {isCover && (
                                                            <span className="bg-[#c5a059] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                                                                ★ Cover
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Move Arrow Controls */}
                                                    <div className="absolute bottom-2 inset-x-2 flex justify-between items-center z-10 opacity-90 group-hover/img:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            disabled={index === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                movePhoto(index, -1);
                                                            }}
                                                            className="w-7 h-7 rounded-full bg-black/80 hover:bg-[#c5a059] hover:text-black text-white text-xs font-black flex items-center justify-center disabled:opacity-20 transition-colors"
                                                            title="Move Left"
                                                        >
                                                            ←
                                                        </button>
                                                        <span className="text-[9px] font-mono text-gray-400 bg-black/70 px-2 py-0.5 rounded-full">
                                                            Drag to swap
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={index === activeAlbum.photos.length - 1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                movePhoto(index, 1);
                                                            }}
                                                            className="w-7 h-7 rounded-full bg-black/80 hover:bg-[#c5a059] hover:text-black text-white text-xs font-black flex items-center justify-center disabled:opacity-20 transition-colors"
                                                            title="Move Right"
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Inline Replacement Drawer */}
                                                {isReplacing && (
                                                    <div className="my-3 p-3 bg-white/5 border border-[#c5a059]/40 rounded-xl space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black uppercase text-[#c5a059]">Replace Frame #{index + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setReplacingPhotoIndex(null)}
                                                                className="text-xs text-gray-400 hover:text-white"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <ImageUploader
                                                            currentImage={photo.url}
                                                            onUploadSuccess={(newUrl) => handleReplacePhoto(index, newUrl)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Action Bar (Set as cover, Replace, Delete) */}
                                                <div className="pt-3 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {!isCover ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPhotoAsCover(photo.url)}
                                                                className="py-1.5 px-2 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black text-[9px] font-black uppercase tracking-wider transition-all text-center"
                                                            >
                                                                ★ Make Cover
                                                            </button>
                                                        ) : (
                                                            <span className="py-1.5 px-2 rounded-lg bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-wider text-center">
                                                                Active Cover
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplacingPhotoIndex(isReplacing ? null : index)}
                                                            className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[9px] font-black uppercase tracking-wider transition-all text-center"
                                                        >
                                                            Replace
                                                        </button>
                                                    </div>

                                                    {/* Editable Caption */}
                                                    <div>
                                                        <label className="text-[8px] font-black uppercase text-gray-500 tracking-wider block">
                                                            Caption / Narrative
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={photo.caption || ""}
                                                            onChange={(e) => {
                                                                const updated = [...activeAlbum.photos];
                                                                updated[index].caption = e.target.value;
                                                                setActiveAlbum({ ...activeAlbum, photos: updated });
                                                            }}
                                                            placeholder="e.g. Sindoor Daan ritual moment..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-[#c5a059] mt-0.5"
                                                        />
                                                    </div>

                                                    {/* Editable SEO Alt Text */}
                                                    <div>
                                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500 tracking-wider">
                                                            <span>SEO Alt Text</span>
                                                            <span className="font-mono text-gray-600">{(photo.altText || "").length}</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={photo.altText || ""}
                                                            onChange={(e) => {
                                                                const updated = [...activeAlbum.photos];
                                                                updated[index].altText = e.target.value;
                                                                setActiveAlbum({ ...activeAlbum, photos: updated });
                                                            }}
                                                            placeholder="e.g. Traditional wedding ceremony Kolkata"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-[#c5a059] mt-0.5"
                                                        />
                                                    </div>

                                                    {/* Delete Button */}
                                                    <div className="pt-1 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPhotoToDelete(photo)}
                                                            className="text-[9px] font-bold text-red-500/50 hover:text-red-400 uppercase tracking-widest transition-colors"
                                                        >
                                                            Delete Frame ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================================
                        TAB B: ALBUM DETAILS & NARRATIVE FORM
                       ================================================================= */}
                    {activeTab === "DETAILS" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0c0c0c] border border-white/10 p-6 sm:p-10 rounded-3xl">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Album / Project Title *
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.title}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, title: e.target.value })}
                                    placeholder="e.g. SID & TRINA"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base font-bold outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Client Couple Names */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Couple Names Attribution
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.clientNames || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, clientNames: e.target.value })}
                                    placeholder="e.g. Sid & Trina"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Subtitle / Style */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Subtitle / Style Badge
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.subtitle || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, subtitle: e.target.value })}
                                    placeholder="e.g. Luxury Bengali Wedding / Heritage Selection"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Location / Venue
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.location || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, location: e.target.value })}
                                    placeholder="e.g. ITC Royal Bengal, Kolkata"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Cinematic Video URL */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Cinematic Film Video URL (YouTube / Vimeo)
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.videoUrl || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, videoUrl: e.target.value })}
                                    placeholder="https://youtu.be/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Album URL */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Canvera Photobook / External Link (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={activeAlbum.albumUrl || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, albumUrl: e.target.value })}
                                    placeholder="https://www.canvera.com/e-photobook"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Narrative / Description */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Story Narrative / Project Description
                                </label>
                                <textarea
                                    rows={4}
                                    value={activeAlbum.description || ""}
                                    onChange={(e) => setActiveAlbum({ ...activeAlbum, description: e.target.value })}
                                    placeholder="Describe the aesthetic, cultural vows, and highlights of this wedding celebration..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm leading-relaxed outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Save Submit Button */}
                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="button"
                                    onClick={handleSaveAlbum}
                                    disabled={saving}
                                    className="w-full py-4 rounded-2xl bg-[#c5a059] text-black font-black uppercase text-xs tracking-[0.25em] hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20 disabled:opacity-50"
                                >
                                    {saving ? "Archiving Album..." : "Commit Verified Album Changes"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
                MODAL 1: CONFIRM DELETE PHOTOGRAPH
               ========================================================================= */}
            {photoToDelete && (
                <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg">
                            <img src={photoToDelete.url} alt="To delete" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Delete Photograph</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                Are you sure you want to remove this photograph from <span className="text-white font-bold">{activeAlbum?.title}</span>? This will permanently remove it from the couple's gallery.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                type="button"
                                onClick={() => setPhotoToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeletePhoto}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30"
                            >
                                Delete Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL 2: CONFIRM DELETE WEDDING ALBUM
               ========================================================================= */}
            {albumToDelete && (
                <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl text-red-500">
                            ⚠️
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Delete Wedding Album</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                Are you sure you want to completely remove the album <span className="text-white font-bold">"{albumToDelete.title}"</span>? This will remove the wedding project and all its associated photographs from the website.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                type="button"
                                onClick={() => setAlbumToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteAlbum}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30"
                            >
                                Delete Album
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
