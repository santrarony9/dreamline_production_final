"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

export default function ProductGalleryAdmin() {
    const [activeTab, setActiveTab] = useState("IMAGES"); // 'IMAGES' | 'CATEGORIES'

    // ── Images State ──
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});
    const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, featured: 0 });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "success" });

    // ── Filter & Search State ──
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft' | 'featured'
    const [searchQuery, setSearchQuery] = useState("");

    // ── Drag and Drop Reordering State ──
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const [isReordering, setIsReordering] = useState(false);

    // ── Modal States ──
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [replacingImageId, setReplacingImageId] = useState(null);

    // ── Single New Image Form ──
    const [newImageForm, setNewImageForm] = useState({
        title: "",
        imageUrl: "",
        category: "Electronics",
        altText: "",
        isFeatured: false,
        isPublished: true,
        aspectRatio: "1:1"
    });

    // ── Bulk Upload State ──
    const [bulkFiles, setBulkFiles] = useState([]);
    const [bulkCategory, setBulkCategory] = useState("Electronics");
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const fileInputRef = useRef(null);
    const replaceInputRef = useRef(null);

    // ── Category Form State ──
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const showToast = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "success" }), 4500);
    };

    // ── Data Fetcher ──
    const fetchGalleryData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/product-gallery");
            if (res.data.success) {
                setImages(res.data.images || []);
                setCategories(res.data.categories || []);
                setCategoryCounts(res.data.categoryCounts || {});
                setStats(res.data.stats || { total: 0, published: 0, draft: 0, featured: 0 });
            }
        } catch (err) {
            console.error("Failed to load product gallery:", err);
            showToast("Failed to load product gallery data", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGalleryData();
    }, [fetchGalleryData]);

    // ── Filtered Images ──
    const displayedImages = images.filter((img) => {
        if (selectedCategory !== "All" && img.category !== selectedCategory) return false;
        if (statusFilter === "published" && !img.isPublished) return false;
        if (statusFilter === "draft" && img.isPublished) return false;
        if (statusFilter === "featured" && !img.isFeatured) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = (img.title || "").toLowerCase().includes(q);
            const matchAlt = (img.altText || "").toLowerCase().includes(q);
            const matchCat = (img.category || "").toLowerCase().includes(q);
            if (!matchTitle && !matchAlt && !matchCat) return false;
        }
        return true;
    });

    // ── Handle Single Image Creation ──
    const handleCreateImage = async (e) => {
        e.preventDefault();
        if (!newImageForm.imageUrl) {
            showToast("Please provide or upload an image URL", "error");
            return;
        }

        try {
            const res = await axios.post("/api/admin/product-gallery", newImageForm);
            if (res.data.success) {
                showToast("Product image added successfully!");
                setIsAddModalOpen(false);
                setNewImageForm({
                    title: "",
                    imageUrl: "",
                    category: categories[0]?.name || "Electronics",
                    altText: "",
                    isFeatured: false,
                    isPublished: true,
                    aspectRatio: "1:1"
                });
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to create image: " + (err.response?.data?.error || err.message), "error");
        }
    };

    // ── Handle Single Image Update ──
    const handleUpdateImage = async (e) => {
        e.preventDefault();
        if (!editingImage || !editingImage._id) return;

        try {
            const res = await axios.put("/api/admin/product-gallery", editingImage);
            if (res.data.success) {
                showToast("Image details updated successfully!");
                setEditingImage(null);
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to update image: " + (err.response?.data?.error || err.message), "error");
        }
    };

    // ── Quick Toggles: Featured & Published ──
    const handleToggleFeatured = async (img) => {
        try {
            const updated = !img.isFeatured;
            // Optimistic update
            setImages(prev => prev.map(i => i._id === img._id ? { ...i, isFeatured: updated } : i));
            await axios.put("/api/admin/product-gallery", { _id: img._id, isFeatured: updated });
            showToast(`Marked as ${updated ? "Featured" : "Standard"}`);
            fetchGalleryData();
        } catch (err) {
            showToast("Failed to toggle featured status", "error");
            fetchGalleryData();
        }
    };

    const handleTogglePublished = async (img) => {
        try {
            const updated = !img.isPublished;
            // Optimistic update
            setImages(prev => prev.map(i => i._id === img._id ? { ...i, isPublished: updated } : i));
            await axios.put("/api/admin/product-gallery", { _id: img._id, isPublished: updated });
            showToast(`Image ${updated ? "Published" : "Moved to Drafts"}`);
            fetchGalleryData();
        } catch (err) {
            showToast("Failed to toggle publish status", "error");
            fetchGalleryData();
        }
    };

    // ── Quick Category Move ──
    const handleQuickMoveCategory = async (img, newCat) => {
        try {
            await axios.put("/api/admin/product-gallery", { _id: img._id, category: newCat });
            showToast(`Moved to "${newCat}"`);
            fetchGalleryData();
        } catch (err) {
            showToast("Failed to move category", "error");
        }
    };

    // ── Image Replacement ──
    const handleReplaceFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !replacingImageId) return;

        try {
            showToast("Uploading replacement image...", "info");
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (uploadRes.data.success) {
                const newUrl = uploadRes.data.url;
                await axios.put("/api/admin/product-gallery", {
                    _id: replacingImageId,
                    imageUrl: newUrl,
                    thumbnailUrl: newUrl
                });
                showToast("Image replaced successfully!");
                setReplacingImageId(null);
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Replacement upload failed: " + (err.response?.data?.error || err.message), "error");
        }
    };

    // ── Delete Image ──
    const handleDeleteImage = async () => {
        if (!imageToDelete) return;
        try {
            const res = await axios.delete(`/api/admin/product-gallery?id=${imageToDelete._id}`);
            if (res.data.success) {
                showToast("Product image deleted successfully");
                setImageToDelete(null);
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to delete image: " + (err.response?.data?.error || err.message), "error");
        }
    };

    // ── Drag & Drop Reordering ──
    const handleDragStart = (idx) => {
        setDraggedIdx(idx);
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        setDragOverIdx(idx);
    };

    const handleDrop = async (dropIdx) => {
        if (draggedIdx === null || draggedIdx === dropIdx) {
            setDraggedIdx(null);
            setDragOverIdx(null);
            return;
        }

        const newArr = [...displayedImages];
        const [movedItem] = newArr.splice(draggedIdx, 1);
        newArr.splice(dropIdx, 0, movedItem);

        // Optimistically update order
        const reorderPayload = newArr.map((item, i) => ({
            id: item._id,
            order: i + 1
        }));

        setImages(prev => {
            const map = new Map(reorderPayload.map(r => [r.id, r.order]));
            return prev.map(item => map.has(item._id) ? { ...item, order: map.get(item._id) } : item)
                .sort((a, b) => a.order - b.order);
        });

        setDraggedIdx(null);
        setDragOverIdx(null);

        try {
            setIsReordering(true);
            await axios.put("/api/admin/product-gallery", { reorder: reorderPayload });
            showToast("New image order saved!");
        } catch (err) {
            showToast("Failed to save reordered items", "error");
            fetchGalleryData();
        } finally {
            setIsReordering(false);
        }
    };

    // ── Bulk Upload Flow ──
    const handleBulkFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setBulkFiles(files);
    };

    const handleExecuteBulkUpload = async () => {
        if (bulkFiles.length === 0) {
            showToast("Please select image files to upload", "error");
            return;
        }

        try {
            setBulkUploading(true);
            setBulkProgress(10);

            // Upload files to storage via /api/upload
            const formData = new FormData();
            bulkFiles.forEach(file => {
                formData.append("files", file);
            });

            setBulkProgress(40);
            const uploadRes = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setBulkProgress(75);

            if (!uploadRes.data.success) {
                throw new Error(uploadRes.data.error || "Failed to upload files to storage");
            }

            const uploadedList = uploadRes.data.files || [{ url: uploadRes.data.url }];
            const docs = uploadedList.map((item, idx) => {
                const nameWithoutExt = item.originalName ? item.originalName.replace(/\.[^/.]+$/, "") : `Product Shot ${idx + 1}`;
                const cleanTitle = nameWithoutExt.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                return {
                    title: cleanTitle,
                    imageUrl: item.url,
                    thumbnailUrl: item.url,
                    category: bulkCategory,
                    altText: cleanTitle,
                    isPublished: true,
                    isFeatured: false,
                    aspectRatio: "1:1"
                };
            });

            await axios.post("/api/admin/product-gallery", { images: docs });

            setBulkProgress(100);
            showToast(`Successfully uploaded & published ${docs.length} product images!`);
            setIsBulkModalOpen(false);
            setBulkFiles([]);
            fetchGalleryData();
        } catch (err) {
            console.error("Bulk upload error:", err);
            showToast("Bulk upload failed: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setBulkUploading(false);
            setBulkProgress(0);
        }
    };

    // ── Category Management Operations ──
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const res = await axios.post("/api/admin/product-gallery/categories", {
                name: newCategoryName.trim()
            });

            if (res.data.success) {
                showToast(`Category "${newCategoryName}" created!`);
                setNewCategoryName("");
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to create category: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const res = await axios.put("/api/admin/product-gallery/categories", editingCategory);
            if (res.data.success) {
                showToast("Category updated successfully!");
                setEditingCategory(null);
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to update category: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            const res = await axios.delete(`/api/admin/product-gallery/categories?id=${categoryToDelete._id}`);
            if (res.data.success) {
                showToast(res.data.message);
                setCategoryToDelete(null);
                fetchGalleryData();
            }
        } catch (err) {
            showToast("Failed to delete category: " + (err.response?.data?.error || err.message), "error");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Hidden Input for Image Replacement */}
            <input
                type="file"
                ref={replaceInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleReplaceFileChange}
            />

            {/* ── Top Header Bar ── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">📸</span>
                        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tighter uppercase text-white">
                            Product Gallery <span className="text-[#c5a059]">Management</span>
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">
                        Curate and organize high-resolution e-commerce catalog and commercial product photography.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                    <Link
                        href="/services/product-photography-kolkata/"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <span>👁️</span>
                        <span>View Gallery</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <span>📁</span>
                        <span>Bulk Upload</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20"
                    >
                        <span>+</span>
                        <span>Add Product Image</span>
                    </button>
                </div>
            </div>

            {/* Toast Notification Message */}
            {message.text && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between animate-fadeIn ${
                    message.type === "error" 
                        ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                        : "bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059]"
                }`}>
                    <span>{message.text}</span>
                    <button type="button" onClick={() => setMessage({ text: "", type: "success" })}>✕</button>
                </div>
            )}

            {/* ── Stats Overview Bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Showcase</span>
                    <div className="text-2xl font-heading font-black text-white">{stats.total}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Published</span>
                    <div className="text-2xl font-heading font-black text-emerald-400">{stats.published}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Featured</span>
                    <div className="text-2xl font-heading font-black text-yellow-400">{stats.featured}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categories</span>
                    <div className="text-2xl font-heading font-black text-[#c5a059]">{categories.length}</div>
                </div>
            </div>

            {/* ── View Toggle Tabs ── */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <button
                    type="button"
                    onClick={() => setActiveTab("IMAGES")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === "IMAGES"
                            ? "bg-[#c5a059] text-black shadow-lg"
                            : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                >
                    🖼️ Images Showcase ({images.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("CATEGORIES")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === "CATEGORIES"
                            ? "bg-[#c5a059] text-black shadow-lg"
                            : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                >
                    🏷️ Manage Categories ({categories.length})
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: IMAGES SHOWCASE MANAGEMENT
               ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "IMAGES" && (
                <div className="space-y-6">
                    {/* Controls: Category Filter + Search + Status */}
                    <div className="space-y-4 bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-white/5">
                        {/* Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, alt text, or category..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-xs font-bold text-white placeholder-gray-500 focus:border-[#c5a059] outline-none"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
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

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status:</span>
                                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 text-[10px] font-black uppercase">
                                    {["all", "published", "draft", "featured"].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setStatusFilter(st)}
                                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                                statusFilter === st ? "bg-[#c5a059] text-black" : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("All")}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    selectedCategory === "All"
                                        ? "bg-[#c5a059] text-black"
                                        : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                                }`}
                            >
                                <span>All Categories</span>
                                <span className="text-[9px] opacity-70">({images.length})</span>
                            </button>
                            {categories.map((cat) => {
                                const catName = cat.name;
                                const isSel = selectedCategory === catName;
                                const cnt = categoryCounts[catName] || 0;
                                return (
                                    <button
                                        key={cat._id || cat.slug || catName}
                                        type="button"
                                        onClick={() => setSelectedCategory(catName)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                            isSel
                                                ? "bg-[#c5a059] text-black"
                                                : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                                        }`}
                                    >
                                        <span>{catName}</span>
                                        <span className="text-[9px] opacity-70">({cnt})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Drag and Drop Information Banner */}
                    <div className="flex items-center justify-between px-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        <span>💡 Tip: Drag and drop cards to reorder image sequence</span>
                        <span>Showing {displayedImages.length} of {images.length} images</span>
                    </div>

                    {/* Images Admin Grid */}
                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="w-10 h-10 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Loading product images...</p>
                        </div>
                    ) : displayedImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displayedImages.map((img, idx) => (
                                <div
                                    key={img._id || idx}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={() => handleDrop(idx)}
                                    className={`group relative bg-[#0d0d0d] rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                                        dragOverIdx === idx 
                                            ? "border-[#c5a059] scale-[1.02] bg-[#14120c]" 
                                            : "border-white/10 hover:border-[#c5a059]/40"
                                    }`}
                                >
                                    {/* Card Header Tag & Status */}
                                    <div className="p-3 flex items-center justify-between border-b border-white/5 bg-black/40">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[9px] font-mono text-gray-500 font-bold">#{img.order || idx + 1}</span>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded truncate max-w-[120px]">
                                                {img.category}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Featured Star Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(img)}
                                                title={img.isFeatured ? "Unmark Featured" : "Mark as Featured"}
                                                className={`p-1 text-xs transition-transform hover:scale-125 cursor-pointer ${
                                                    img.isFeatured ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"
                                                }`}
                                            >
                                                ★
                                            </button>

                                            {/* Published Status Pill */}
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePublished(img)}
                                                title={img.isPublished ? "Unpublish to Draft" : "Publish to Live"}
                                                className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                                                    img.isPublished 
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                        : "bg-white/10 text-gray-400 border border-white/10"
                                                }`}
                                            >
                                                {img.isPublished ? "Live" : "Draft"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thumbnail Preview Stage */}
                                    <div 
                                        onClick={() => setPreviewImage(img)}
                                        className="relative aspect-square bg-[#050505] overflow-hidden cursor-zoom-in"
                                    >
                                        <Image
                                            src={img.imageUrl}
                                            alt={img.altText || img.title || "Product"}
                                            fill
                                            sizes="25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                                                🔍 Preview
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metadata & Actions */}
                                    <div className="p-3.5 space-y-2.5">
                                        <div>
                                            <h4 className="text-xs font-bold text-white truncate" title={img.title}>
                                                {img.title || "Untitled Product Shot"}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 truncate" title={img.altText}>
                                                Alt: {img.altText || "No alt text"}
                                            </p>
                                        </div>

                                        {/* Quick Category Move Dropdown */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-gray-500 uppercase font-black">Move:</span>
                                            <select
                                                value={img.category}
                                                onChange={(e) => handleQuickMoveCategory(img, e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-gray-300 py-1 px-1.5 outline-none focus:border-[#c5a059]"
                                            >
                                                {categories.map((c) => (
                                                    <option key={c._id || c.name} value={c.name} className="bg-black text-white">
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Action Buttons Toolbar */}
                                        <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-1.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplacingImageId(img._id);
                                                    replaceInputRef.current?.click();
                                                }}
                                                className="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold text-gray-300 hover:text-white transition-colors"
                                                title="Replace Image File"
                                            >
                                                🔄 Swap
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingImage(img)}
                                                className="py-1 px-2 rounded-lg bg-white/5 hover:bg-[#c5a059] hover:text-black text-[9px] font-bold text-gray-300 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImageToDelete(img)}
                                                className="py-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-[9px] font-bold text-red-400 transition-colors"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                                No product images match the selected filter criteria.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setSelectedCategory("All"); setStatusFilter("all"); setSearchQuery(""); }}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: CATEGORY MANAGEMENT
               ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "CATEGORIES" && (
                <div className="space-y-6">
                    {/* Add Category Form */}
                    <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4">
                        <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider">
                            Add New Product Category
                        </h3>
                        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category name (e.g., Luxury Eyewear, Footwear...)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder-gray-500 focus:border-[#c5a059] outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all flex-shrink-0"
                            >
                                + Create Category
                            </button>
                        </form>
                    </div>

                    {/* Category List Table */}
                    <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-heading font-black text-white uppercase tracking-wider">
                                Existing Categories ({categories.length})
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono">
                                Images in deleted categories will be automatically moved to "Other Products"
                            </span>
                        </div>

                        <div className="space-y-2">
                            {categories.map((cat, cIdx) => (
                                <div
                                    key={cat._id || cIdx}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-500 font-bold">#{cIdx + 1}</span>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">{cat.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono">slug: {cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-mono font-bold text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
                                            {categoryCounts[cat.name] || 0} images
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory(cat)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-colors"
                                        >
                                            Edit
                                        </button>

                                        {cat.name !== "Other Products" && (
                                            <button
                                                type="button"
                                                onClick={() => setCategoryToDelete(cat)}
                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-[10px] font-bold text-red-400 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 1: SINGLE ADD IMAGE MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <h3 className="font-heading text-lg font-black uppercase text-white tracking-wider">
                                Add Product Image
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateImage} className="space-y-4">
                            {/* Image Uploader & Preview */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Product Image
                                </label>
                                <ImageUploader
                                    onUploadSuccess={(url) => setNewImageForm(prev => ({ ...prev, imageUrl: url }))}
                                    currentImage={newImageForm.imageUrl}
                                    currentAlt={newImageForm.altText}
                                    onAltChange={(alt) => setNewImageForm(prev => ({ ...prev, altText: alt }))}
                                    recommendedSize="1200 x 1200 px (Square 1:1, E-Commerce)"
                                />
                            </div>

                            {/* Direct URL Input fallback */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Or Paste Direct Image URL
                                </label>
                                <input
                                    type="text"
                                    value={newImageForm.imageUrl}
                                    onChange={(e) => setNewImageForm({ ...newImageForm, imageUrl: e.target.value })}
                                    placeholder="https://... or /uploads/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-mono"
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Product Title
                                </label>
                                <input
                                    type="text"
                                    value={newImageForm.title}
                                    onChange={(e) => setNewImageForm({ ...newImageForm, title: e.target.value })}
                                    placeholder="e.g., Luxury Diamond Solitaire Ring"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                />
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Product Category
                                </label>
                                <select
                                    value={newImageForm.category}
                                    onChange={(e) => setNewImageForm({ ...newImageForm, category: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                >
                                    {categories.map((c) => (
                                        <option key={c._id || c.name} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Alt Text */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Alt Text (SEO & Accessibility)
                                </label>
                                <input
                                    type="text"
                                    value={newImageForm.altText}
                                    onChange={(e) => setNewImageForm({ ...newImageForm, altText: e.target.value })}
                                    placeholder="e.g., Luxury gold ring macro product photography on black backdrop"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={newImageForm.isFeatured}
                                        onChange={(e) => setNewImageForm({ ...newImageForm, isFeatured: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold text-white">⭐ Featured</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={newImageForm.isPublished}
                                        onChange={(e) => setNewImageForm({ ...newImageForm, isPublished: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold text-white">🟢 Publish Now</span>
                                </label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Save Image
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 2: BULK UPLOAD MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📁</span>
                                <h3 className="font-heading text-lg font-black uppercase text-white tracking-wider">
                                    Bulk Upload Product Images
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setIsBulkModalOpen(false); setBulkFiles([]); }}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Category for Batch */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Default Category for this Batch
                                </label>
                                <select
                                    value={bulkCategory}
                                    onChange={(e) => setBulkCategory(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                >
                                    {categories.map((c) => (
                                        <option key={c._id || c.name} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dropzone File Selector */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="p-8 border-2 border-dashed border-white/15 hover:border-[#c5a059]/50 rounded-2xl text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all space-y-2"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    onChange={handleBulkFileSelect}
                                    className="hidden"
                                />
                                <div className="text-3xl text-[#c5a059]">📸</div>
                                <p className="text-xs font-bold text-white">Click or drag &amp; drop multiple product images</p>
                                <p className="text-[10px] text-gray-500 font-mono">PNG, JPG, WEBP • Auto-compressed to WebP</p>
                            </div>

                            {/* Selected Files Queue */}
                            {bulkFiles.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-3 bg-black/40 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
                                        <span>Selected Files ({bulkFiles.length})</span>
                                        <button
                                            type="button"
                                            onClick={() => setBulkFiles([])}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    {bulkFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 text-gray-300">
                                            <span className="truncate max-w-[300px]">{file.name}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Progress bar */}
                            {bulkUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-[#c5a059]">
                                        <span>Uploading &amp; Processing Images...</span>
                                        <span>{bulkProgress}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-[#c5a059] h-full transition-all duration-300"
                                            style={{ width: `${bulkProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    disabled={bulkUploading}
                                    onClick={() => { setIsBulkModalOpen(false); setBulkFiles([]); }}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={bulkUploading || bulkFiles.length === 0}
                                    onClick={handleExecuteBulkUpload}
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg"
                                >
                                    {bulkUploading ? "Uploading..." : `Upload ${bulkFiles.length} Images`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 3: EDIT IMAGE MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {editingImage && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <h3 className="font-heading text-lg font-black uppercase text-white tracking-wider">
                                Edit Image Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditingImage(null)}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateImage} className="space-y-4">
                            {/* Current Image Preview & Replace */}
                            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                                    <Image
                                        src={editingImage.imageUrl}
                                        alt={editingImage.title || "Product"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white truncate">{editingImage.title}</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplacingImageId(editingImage._id);
                                            replaceInputRef.current?.click();
                                        }}
                                        className="text-[10px] font-black uppercase tracking-wider text-[#c5a059] hover:text-white"
                                    >
                                        🔄 Replace Image File
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editingImage.title || ""}
                                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Category
                                </label>
                                <select
                                    value={editingImage.category}
                                    onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                >
                                    {categories.map((c) => (
                                        <option key={c._id || c.name} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Alt Text */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={editingImage.altText || ""}
                                    onChange={(e) => setEditingImage({ ...editingImage, altText: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            {/* Order Position */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Order Position (Sort Priority)
                                </label>
                                <input
                                    type="number"
                                    value={editingImage.order || 0}
                                    onChange={(e) => setEditingImage({ ...editingImage, order: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-mono"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={editingImage.isFeatured}
                                        onChange={(e) => setEditingImage({ ...editingImage, isFeatured: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold text-white">⭐ Featured</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={editingImage.isPublished}
                                        onChange={(e) => setEditingImage({ ...editingImage, isPublished: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold text-white">🟢 Published</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingImage(null)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Update Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 4: FULLSCREEN PREVIEW MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-pointer select-none"
                >
                    <div className="relative max-h-[85vh] max-w-[90vw] aspect-square flex items-center justify-center">
                        <img
                            src={previewImage.imageUrl}
                            alt={previewImage.title || "Preview"}
                            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />
                    </div>
                    <div className="mt-4 text-center space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 px-3 py-1 rounded-full">
                            {previewImage.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{previewImage.title}</h4>
                        <p className="text-xs text-gray-500">Click anywhere to close</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 5: DELETE IMAGE CONFIRMATION
               ═══════════════════════════════════════════════════════════════ */}
            {imageToDelete && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-xl">
                            🗑️
                        </div>
                        <h3 className="font-heading text-lg font-black uppercase text-white tracking-wider">
                            Delete Image?
                        </h3>
                        <p className="text-xs text-gray-400">
                            Are you sure you want to permanently delete <strong className="text-white">"{imageToDelete.title}"</strong> from the product showcase?
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setImageToDelete(null)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 6: EDIT CATEGORY MODAL
               ═══════════════════════════════════════════════════════════════ */}
            {editingCategory && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <h3 className="font-heading text-sm font-black uppercase text-white tracking-wider">
                                Edit Category Name
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="text-gray-400 hover:text-white text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={editingCategory.name || ""}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingCategory(null)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 7: DELETE CATEGORY CONFIRMATION
               ═══════════════════════════════════════════════════════════════ */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-xl">
                            ⚠️
                        </div>
                        <h3 className="font-heading text-lg font-black uppercase text-white tracking-wider">
                            Delete Category?
                        </h3>
                        <p className="text-xs text-gray-400">
                            Delete <strong className="text-white">"{categoryToDelete.name}"</strong>? Any images in this category will be automatically moved to <strong className="text-[#c5a059]">"Other Products"</strong>.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setCategoryToDelete(null)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCategory}
                                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
