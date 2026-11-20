"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";

const CATEGORIES = [
    { id: "ALL", label: "All Media" },
    { id: "wedding", label: "Weddings" },
    { id: "commercial", label: "Commercial" },
    { id: "drone", label: "Drone & Aerial" },
    { id: "fashion", label: "Fashion" },
    { id: "product", label: "Product" },
    { id: "tech", label: "Tech / Web" },
    { id: "blog", label: "Journal / Blog" },
    { id: "general", label: "General" }
];

export default function MediaLibraryAdmin() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [totalCount, setTotalCount] = useState(0);

    // Selected Asset for Details / Edit Modal
    const [activeAsset, setActiveAsset] = useState(null);
    const [editForm, setEditForm] = useState({ alt: "", title: "", caption: "", category: "general" });
    const [isSaving, setIsSaving] = useState(false);

    // Replacement State
    const [isReplacing, setIsReplacing] = useState(false);
    const replaceInputRef = useRef(null);

    // Bulk Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Delete confirmation
    const [deleteWarning, setDeleteWarning] = useState(null);
    const [toast, setToast] = useState({ message: "", type: "success" });

    useEffect(() => {
        fetchAssets();
    }, [selectedCategory]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4000);
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "ALL") params.set("category", selectedCategory);
            if (search.trim()) params.set("search", search.trim());

            const res = await axios.get(`/api/admin/media-library?${params.toString()}`);
            if (res.data?.success) {
                setAssets(res.data.assets || []);
                setTotalCount(res.data.total || 0);
            }
        } catch (err) {
            console.error("Failed to load media assets:", err);
            showToast("Failed to load media assets", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAssets();
    };

    const handleOpenAsset = (asset) => {
        setActiveAsset(asset);
        setEditForm({
            alt: asset.alt || "",
            title: asset.title || asset.fileName || "",
            caption: asset.caption || "",
            category: asset.category || "general"
        });
        setDeleteWarning(null);
    };

    const handleSaveMetadata = async () => {
        if (!activeAsset) return;
        setIsSaving(true);
        try {
            const res = await axios.patch("/api/admin/media-library", {
                url: activeAsset.url,
                alt: editForm.alt,
                title: editForm.title,
                caption: editForm.caption,
                category: editForm.category
            });
            if (res.data?.success) {
                showToast("Media details updated successfully!");
                setActiveAsset(prev => ({ ...prev, ...editForm }));
                setAssets(prev => prev.map(a => a.url === activeAsset.url ? { ...a, ...editForm } : a));
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error updating metadata", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            files.forEach(f => formData.append("files", f));

            const res = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percent);
                }
            });

            if (res.data?.success) {
                showToast(`Successfully uploaded ${res.data.count || 1} file(s)!`);
                fetchAssets();
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast(err.response?.data?.error || "File upload failed", "error");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleReplaceFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeAsset) return;

        setIsReplacing(true);
        try {
            const formData = new FormData();
            formData.append("files", file);

            const uploadRes = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (uploadRes.data?.success && uploadRes.data.url) {
                const newUrl = uploadRes.data.url;
                const patchRes = await axios.patch("/api/admin/media-library", {
                    url: activeAsset.url,
                    newUrl: newUrl,
                    alt: editForm.alt,
                    title: editForm.title
                });

                if (patchRes.data?.success) {
                    showToast(patchRes.data.message || "Image replaced successfully!");
                    setActiveAsset(null);
                    fetchAssets();
                }
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Error replacing image", "error");
        } finally {
            setIsReplacing(false);
            if (replaceInputRef.current) replaceInputRef.current.value = "";
        }
    };

    const handleDeleteAsset = async (force = false) => {
        if (!activeAsset) return;
        setIsSaving(true);
        try {
            const res = await axios.delete(`/api/admin/media-library?url=${encodeURIComponent(activeAsset.url)}&force=${force}`);
            if (res.data?.success) {
                showToast("File deleted permanently.");
                setActiveAsset(null);
                setDeleteWarning(null);
                setAssets(prev => prev.filter(a => a.url !== activeAsset.url));
                setTotalCount(prev => prev - 1);
            }
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.warning) {
                setDeleteWarning(err.response.data);
            } else {
                showToast(err.response?.data?.error || "Error deleting media", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("URL copied to clipboard!");
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 KB";
        const k = 1024;
        const dm = 1;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    return (
        <div className="space-y-8 pb-32 max-w-7xl">
            {/* TOAST NOTIFICATION */}
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
                        <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em]">Asset Management</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Media <span className="text-gray-500">Library.</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Total {totalCount} persistent media files across services, blogs, and galleries.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleUploadFiles}
                        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-6 py-3 rounded-2xl bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                        <span>{isUploading ? "⏳" : "📤"}</span>
                        {isUploading ? `Uploading ${uploadProgress}%...` : "Upload Media (Bulk / Single)"}
                    </button>
                </div>
            </header>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by filename, URL or used service page..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 text-xs font-medium focus:border-[#c5a059] outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto"
                    >
                        Search Assets
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(""); fetchAssets(); }}
                            className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* CATEGORY TABS */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedCategory === cat.id
                                    ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MEDIA ASSETS GRID */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 uppercase text-xs font-black tracking-widest">Scanning media assets &amp; usage...</p>
                </div>
            ) : assets.length === 0 ? (
                <div className="py-24 text-center bg-[#0a0a0a] rounded-3xl border border-white/5 p-12">
                    <span className="text-5xl block mb-4">🖼️</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No Media Files Found</h3>
                    <p className="text-gray-500 text-xs max-w-md mx-auto mb-6">
                        {search ? "No assets match your search keyword. Try a different query or clear the filter." : "Upload images or videos to build your persistent studio media library."}
                    </p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all"
                    >
                        Upload First Image
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {assets.map((asset, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleOpenAsset(asset)}
                            className="group bg-[#0a0a0a] border border-white/5 hover:border-[#c5a059]/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c5a059]/10 flex flex-col relative"
                        >
                            {/* USAGE BADGE */}
                            <div className="absolute top-2 left-2 z-10 flex gap-1">
                                {asset.usageCount > 0 ? (
                                    <span className="bg-emerald-500/90 text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                                        Used ({asset.usageCount})
                                    </span>
                                ) : (
                                    <span className="bg-black/70 backdrop-blur-md text-gray-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10">
                                        Unlinked
                                    </span>
                                )}
                            </div>

                            {/* PREVIEW THUMBNAIL */}
                            <div className="relative aspect-square w-full bg-white/5 overflow-hidden">
                                {asset.url.endsWith('.mp4') ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-white">
                                        <span className="text-3xl mb-1">🎬</span>
                                        <span className="text-[9px] uppercase font-bold text-gray-400">MP4 Video</span>
                                    </div>
                                ) : (
                                    <img
                                        src={asset.url}
                                        alt={asset.alt || asset.fileName || "Media thumbnail"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                )}
                            </div>

                            {/* ASSET META FOOTER */}
                            <div className="p-3 bg-[#0a0a0a] flex-1 flex flex-col justify-between border-t border-white/5">
                                <p className="text-[10px] font-black text-white truncate mb-1" title={asset.fileName}>
                                    {asset.fileName}
                                </p>
                                <div className="flex items-center justify-between text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>{formatBytes(asset.fileSize)}</span>
                                    <span className="text-[#c5a059] group-hover:underline">Edit ↗</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* DETAILS & EDIT MODAL */}
            {activeAsset && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
                        {/* MODAL HEADER */}
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest block mb-1">
                                    Asset Inspector
                                </span>
                                <h3 className="text-xl font-black uppercase text-white truncate max-w-lg">
                                    {activeAsset.fileName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setActiveAsset(null); setDeleteWarning(null); }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT: IMAGE PREVIEW */}
                            <div className="space-y-4">
                                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-square flex items-center justify-center">
                                    {activeAsset.url.endsWith('.mp4') ? (
                                        <video src={activeAsset.url} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <img
                                            src={activeAsset.url}
                                            alt={editForm.alt || activeAsset.fileName}
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 bg-white/5 p-3 rounded-xl">
                                    <span>{formatBytes(activeAsset.fileSize)}</span>
                                    <span>{activeAsset.mimeType || "image/webp"}</span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(activeAsset.url)}
                                        className="text-[#c5a059] font-black hover:underline"
                                    >
                                        Copy URL 📋
                                    </button>
                                </div>

                                {/* REPLACE IMAGE TRIGGER */}
                                <input
                                    type="file"
                                    ref={replaceInputRef}
                                    onChange={handleReplaceFile}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => replaceInputRef.current?.click()}
                                    disabled={isReplacing}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#c5a059] border border-[#c5a059]/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <span>{isReplacing ? "⏳" : "🔄"}</span>
                                    {isReplacing ? "Replacing across site..." : "Replace File Across Entire Site"}
                                </button>
                            </div>

                            {/* RIGHT: METADATA & USAGE */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                        SEO &amp; Metadata
                                    </h4>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            Alt Text (Essential for Google SEO)
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.alt}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
                                            placeholder="Descriptive keywords for search engines..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            Display Title / Label
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                            Category / Folder
                                        </label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        >
                                            {CATEGORIES.filter(c => c.id !== "ALL").map(c => (
                                                <option key={c.id} value={c.id} className="bg-black text-white">
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveMetadata}
                                        disabled={isSaving}
                                        className="w-full py-3 bg-[#c5a059] hover:bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-[#c5a059]/20"
                                    >
                                        {isSaving ? "Saving..." : "Save Metadata"}
                                    </button>
                                </div>

                                {/* USAGE LOCATIONS */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                        Used On Website ({activeAsset.usageCount})
                                    </h4>
                                    {activeAsset.usedIn && activeAsset.usedIn.length > 0 ? (
                                        <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {activeAsset.usedIn.map((use, uIdx) => (
                                                <li key={uIdx} className="bg-white/5 p-2.5 rounded-xl text-[10px] flex items-center justify-between">
                                                    <div>
                                                        <span className="font-black text-white block">{use.type}</span>
                                                        <span className="text-gray-400">{use.title || use.slug || "Service Item"}</span>
                                                    </div>
                                                    {use.slug && (
                                                        <Link
                                                            href={`/services/${use.slug}/`}
                                                            target="_blank"
                                                            className="text-[#c5a059] hover:underline"
                                                        >
                                                            Open ↗
                                                        </Link>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-[10px] text-gray-500 italic">
                                            This file is not currently linked to any active service page or video shot.
                                        </p>
                                    )}
                                </div>

                                {/* DELETE WARNING OR TRIGGER */}
                                <div className="pt-4 border-t border-white/5">
                                    {deleteWarning ? (
                                        <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-2xl space-y-3 text-red-200">
                                            <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                <span>⚠️</span> Image In Active Use!
                                            </p>
                                            <p className="text-[10px] leading-relaxed whitespace-pre-line text-red-300">
                                                {deleteWarning.message}
                                            </p>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAsset(true)}
                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Force Delete Anyway
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteWarning(null)}
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAsset(false)}
                                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Delete Media File 🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
