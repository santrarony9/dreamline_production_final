"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORIES = [
    { key: "all", label: "All Items" },
    { key: "weddings", label: "Weddings" },
    { key: "pre-wedding", label: "Pre-Wedding" },
    { key: "rituals", label: "Traditional Rituals" },
    { key: "commercial", label: "Commercial" },
    { key: "drone", label: "Drone & Aerial" }
];

export default function GalleryAdmin() {
    const [adminTab, setAdminTab] = useState("PHOTOS"); // 'PHOTOS' | 'PROJECTS'

    // --- Photo Gallery State ---
    const [galleryItems, setGalleryItems] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [counts, setCounts] = useState({});
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [savingGallery, setSavingGallery] = useState(false);
    const [galleryMessage, setGalleryMessage] = useState("");

    // Drag and Drop for Photo Gallery
    const [draggedPhotoIdx, setDraggedPhotoIdx] = useState(null);
    const [dragOverPhotoIdx, setDragOverPhotoIdx] = useState(null);

    // Modal States for Photo Gallery
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // Item being edited
    const [itemToDelete, setItemToDelete] = useState(null); // Item pending delete confirmation
    const [replacingItemId, setReplacingItemId] = useState(null); // Item for inline image replacement

    // New Item Form State
    const [newItemForm, setNewItemForm] = useState({
        title: "",
        caption: "",
        altText: "",
        category: "weddings",
        imageUrl: "",
        aspectRatio: "vertical",
        published: true
    });

    // --- Commercial Projects State ---
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [savingProjects, setSavingProjects] = useState(false);
    const [projectMessage, setProjectMessage] = useState("");
    const [draggedProjIdx, setDraggedProjIdx] = useState(null);
    const [dragOverProjIdx, setDragOverProjIdx] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);

    useEffect(() => {
        fetchGalleryItems();
        fetchProjects();
    }, []);

    // --- Fetchers ---
    const fetchGalleryItems = async () => {
        try {
            setLoadingGallery(true);
            const res = await axios.get("/api/gallery/?all=true");
            setGalleryItems(res.data.items || []);
            setCounts(res.data.counts || {});
        } catch (err) {
            console.error("Failed to load gallery items:", err);
            setGalleryMessage("Error loading gallery items");
        } finally {
            setLoadingGallery(false);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoadingProjects(true);
            const res = await axios.get("/api/content");
            setProjects(res.data.projects || []);
        } catch (err) {
            console.error("Failed to load projects:", err);
        } finally {
            setLoadingProjects(false);
        }
    };

    // --- Photo Gallery Operations ---
    const handleCreatePhoto = async (e) => {
        e.preventDefault();
        if (!newItemForm.title || !newItemForm.imageUrl) {
            alert("Title and Image URL are required.");
            return;
        }

        try {
            setSavingGallery(true);
            const res = await axios.post("/api/gallery/", newItemForm);
            if (res.data.success) {
                setGalleryMessage("Image added to gallery successfully!");
                setIsAddModalOpen(false);
                setNewItemForm({
                    title: "",
                    caption: "",
                    altText: "",
                    category: "weddings",
                    imageUrl: "",
                    aspectRatio: "vertical",
                    published: true
                });
                await fetchGalleryItems();
                setTimeout(() => setGalleryMessage(""), 3500);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to add image");
        } finally {
            setSavingGallery(false);
        }
    };

    const handleUpdatePhoto = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            setSavingGallery(true);
            const res = await axios.put("/api/gallery/", editingItem);
            if (res.data.success) {
                setGalleryMessage("Gallery item updated successfully!");
                setEditingItem(null);
                await fetchGalleryItems();
                setTimeout(() => setGalleryMessage(""), 3500);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to update item");
        } finally {
            setSavingGallery(false);
        }
    };

    const handleInlineReplaceImage = async (item, newUrl) => {
        try {
            setSavingGallery(true);
            const res = await axios.put("/api/gallery/", { ...item, imageUrl: newUrl });
            if (res.data.success) {
                setGalleryMessage("Image asset replaced successfully!");
                setReplacingItemId(null);
                await fetchGalleryItems();
                setTimeout(() => setGalleryMessage(""), 3500);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to replace image asset");
        } finally {
            setSavingGallery(false);
        }
    };

    const handleTogglePublish = async (item) => {
        try {
            const updated = !item.published;
            const res = await axios.put("/api/gallery/", { ...item, published: updated });
            if (res.data.success) {
                setGalleryItems(prev => prev.map(i => i._id === item._id ? { ...i, published: updated } : i));
                setGalleryMessage(updated ? "Photo published live" : "Photo unpublished (hidden)");
                setTimeout(() => setGalleryMessage(""), 3000);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to toggle publish status");
        }
    };

    const confirmDeletePhoto = async () => {
        if (!itemToDelete) return;
        try {
            setSavingGallery(true);
            const res = await axios.delete(`/api/gallery/?id=${itemToDelete._id}`);
            if (res.data.success) {
                setGalleryMessage("Item removed from gallery");
                setItemToDelete(null);
                await fetchGalleryItems();
                setTimeout(() => setGalleryMessage(""), 3500);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete gallery item");
        } finally {
            setSavingGallery(false);
        }
    };

    // Photo Drag and Drop Sorting
    const handlePhotoDragStart = (e, index) => {
        setDraggedPhotoIdx(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handlePhotoDragOver = (e, index) => {
        e.preventDefault();
        if (draggedPhotoIdx === index) return;
        setDragOverPhotoIdx(index);
    };

    const handlePhotoDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (draggedPhotoIdx === null) return;
        const sourceIndex = draggedPhotoIdx;
        setDraggedPhotoIdx(null);
        setDragOverPhotoIdx(null);

        if (sourceIndex === targetIndex) return;

        const updated = [...galleryItems];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);

        setGalleryItems(updated);

        // Commit reorder to backend
        try {
            setSavingGallery(true);
            await axios.post("/api/gallery/", { action: "reorder", items: updated });
            setGalleryMessage("New order committed live!");
            setTimeout(() => setGalleryMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setGalleryMessage("Failed to save reorder");
        } finally {
            setSavingGallery(false);
        }
    };

    // --- Commercial Projects Operations ---
    const handleSaveProjects = async () => {
        setSavingProjects(true);
        setProjectMessage("");
        try {
            await axios.post("/api/content", { projects });
            setProjectMessage("Commercial projects synchronized successfully!");
            setTimeout(() => setProjectMessage(""), 3000);
        } catch (err) {
            console.error("Projects Sync Error:", err);
            setProjectMessage("Error syncing commercial projects.");
        } finally {
            setSavingProjects(false);
        }
    };

    const addProject = () => {
        setProjects([
            ...projects,
            {
                title: "New Commercial Project",
                type: "commercial",
                img: "",
                videoUrl: "",
                hoverVideo: ""
            }
        ]);
    };

    const updateProject = (index, field, value) => {
        const updated = [...projects];
        updated[index][field] = value;
        setProjects(updated);
    };

    const confirmDeleteProject = () => {
        if (projectToDelete === null) return;
        setProjects(projects.filter((_, i) => i !== projectToDelete));
        setProjectToDelete(null);
    };

    const handleProjDragStart = (e, index) => {
        setDraggedProjIdx(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleProjDragOver = (e, index) => {
        e.preventDefault();
        if (draggedProjIdx === index) return;
        setDragOverProjIdx(index);
    };

    const handleProjDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedProjIdx === null) return;
        const sourceIndex = draggedProjIdx;
        setDraggedProjIdx(null);
        setDragOverProjIdx(null);

        if (sourceIndex === targetIndex) return;

        const updated = [...projects];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setProjects(updated);
    };

    // Filter displayed gallery photos by category tab
    const displayedGallery = categoryFilter === "all"
        ? galleryItems
        : galleryItems.filter(item => item.category === categoryFilter);

    return (
        <div className="space-y-10 pb-36">
            {/* Top Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Production CMS</h2>
                    <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">
                        Master <span className="text-gray-500">Gallery &amp; Archives.</span>
                    </h1>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        Manage photo archives, categories, titles, captions, and commercial video showcases.
                    </p>
                </div>

                {/* Main View Switcher: Photo Gallery vs Commercial Projects */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10 w-full sm:w-auto justify-center">
                        <button
                            type="button"
                            onClick={() => setAdminTab("PHOTOS")}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                adminTab === "PHOTOS" ? "bg-[#c5a059] text-black shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            📸 Photo Gallery ({galleryItems.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdminTab("PROJECTS")}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                adminTab === "PROJECTS" ? "bg-[#c5a059] text-black shadow-lg" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            🎥 Video Showcase ({projects.length})
                        </button>
                    </div>

                    {adminTab === "PHOTOS" ? (
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#c5a059] text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg whitespace-nowrap active:scale-95"
                        >
                            + Add Image
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={addProject}
                            className="bg-[#c5a059] text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg whitespace-nowrap active:scale-95"
                        >
                            + Add Project
                        </button>
                    )}
                </div>
            </header>

            {/* Status Toast Notification */}
            {(galleryMessage || projectMessage) && (
                <div className="p-4 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/40 text-[#c5a059] text-xs font-black uppercase tracking-widest flex items-center justify-between">
                    <span>{galleryMessage || projectMessage}</span>
                    <button type="button" onClick={() => { setGalleryMessage(""); setProjectMessage(""); }}>✕</button>
                </div>
            )}

            {/* TAB 1: PHOTO GALLERY MANAGEMENT */}
            {adminTab === "PHOTOS" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-500 mr-2">
                            Filter by Category:
                        </span>
                        {CATEGORIES.map(cat => {
                            const isActive = categoryFilter === cat.key;
                            const count = cat.key === "all" ? galleryItems.length : (counts[cat.key] || 0);
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategoryFilter(cat.key)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                        isActive
                                            ? "bg-[#c5a059] text-black border-[#c5a059]"
                                            : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:border-white/20"
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {loadingGallery ? (
                        <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest py-12 text-center">
                            Loading gallery assets...
                        </div>
                    ) : displayedGallery.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
                                No images found in this category.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-2.5 rounded-full bg-[#c5a059] text-black font-black uppercase text-[10px] tracking-widest"
                            >
                                + Upload First Image
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedGallery.map((item, i) => {
                                const isDragging = draggedPhotoIdx === i;
                                const isOver = dragOverPhotoIdx === i;
                                const isHorizontal = item.aspectRatio === "horizontal";

                                return (
                                    <div
                                        key={item._id || i}
                                        className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden group transition-all duration-300 relative flex flex-col justify-between ${
                                            isDragging
                                                ? "opacity-20 scale-[0.98] border-white/5 shadow-inner"
                                                : isOver
                                                    ? "border-[#c5a059] shadow-[0_0_25px_rgba(197,160,89,0.3)] scale-[1.02] z-20"
                                                    : "border-white/5 hover:border-[#c5a059]/40"
                                        } ${!item.published ? "opacity-60" : ""}`}
                                    >
                                        {/* Image Display & Drag Area */}
                                        <div
                                            draggable
                                            onDragStart={(e) => handlePhotoDragStart(e, i)}
                                            onDragOver={(e) => handlePhotoDragOver(e, i)}
                                            onDrop={(e) => handlePhotoDrop(e, i)}
                                            onDragEnd={() => { setDraggedPhotoIdx(null); setDragOverPhotoIdx(null); }}
                                            className={`${isHorizontal ? "aspect-video" : "aspect-[4/5]"} relative bg-white/2 overflow-hidden select-none cursor-grab active:cursor-grabbing`}
                                        >
                                            {/* Drag Over Overlay */}
                                            {isOver && (
                                                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c5a059]">
                                                    <span className="text-2xl font-black text-[#c5a059]">➔</span>
                                                    <span className="text-[9px] tracking-widest font-black uppercase text-[#c5a059]">Drop Here</span>
                                                </div>
                                            )}

                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                                            />

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                                                <span className="bg-black/80 backdrop-blur-md text-[8px] font-black uppercase text-[#c5a059] px-2.5 py-1 rounded-full border border-white/10">
                                                    {item.category}
                                                </span>
                                                <span className="bg-black/80 backdrop-blur-md text-[7px] font-black uppercase text-gray-400 px-2 py-1 rounded-full border border-white/10">
                                                    #{i + 1}
                                                </span>
                                            </div>

                                            <div className="absolute top-3 right-3 z-20">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTogglePublish(item)}
                                                    className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md border ${
                                                        item.published
                                                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                                                            : "bg-amber-950/80 text-amber-400 border-amber-500/30"
                                                    }`}
                                                >
                                                    {item.published ? "● Live" : "○ Draft"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Info & Action Controls */}
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <h3 className="text-xs font-black text-white uppercase truncate tracking-wider mb-1" title={item.title}>
                                                    {item.title}
                                                </h3>
                                                {item.caption && (
                                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed" title={item.caption}>
                                                        {item.caption}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Inline Asset Replacement Drawer */}
                                            {replacingItemId === item._id && (
                                                <div className="p-3 bg-white/5 border border-[#c5a059]/30 rounded-xl space-y-2 animate-in fade-in">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black uppercase text-[#c5a059] tracking-widest">Replace Image Asset</span>
                                                        <button type="button" onClick={() => setReplacingItemId(null)} className="text-[10px] text-gray-400 hover:text-white">✕</button>
                                                    </div>
                                                    <ImageUploader
                                                        currentImage={item.imageUrl}
                                                        onUploadSuccess={(url) => handleInlineReplaceImage(item, url)}
                                                    />
                                                </div>
                                            )}

                                            {/* Control Buttons */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingItem(item)}
                                                    className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white transition-colors text-center"
                                                >
                                                    ✏️ Edit Details
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setReplacingItemId(replacingItemId === item._id ? null : item._id)}
                                                    className="py-2 px-3 bg-white/5 hover:bg-[#c5a059]/20 hover:text-[#c5a059] rounded-xl text-[9px] font-black uppercase tracking-wider text-gray-400 transition-colors"
                                                    title="Replace Image File"
                                                >
                                                    🔄 Replace
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setItemToDelete(item)}
                                                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider text-red-400 transition-colors"
                                                    title="Delete Item"
                                                >
                                                    🗑️
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

            {/* TAB 2: COMMERCIAL VIDEO SHOWCASE PROJECTS */}
            {adminTab === "PROJECTS" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            These items appear in the homepage Project Showcase and portfolio video popups.
                        </p>
                        <button
                            type="button"
                            onClick={handleSaveProjects}
                            disabled={savingProjects}
                            className="bg-[#c5a059] text-black px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg disabled:opacity-50"
                        >
                            {savingProjects ? "Saving..." : "Commit Projects Sync"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((proj, i) => {
                            const isDragging = draggedProjIdx === i;
                            const isOver = dragOverProjIdx === i;

                            return (
                                <div
                                    key={i}
                                    className={`bg-[#0a0a0a] border rounded-3xl overflow-hidden group transition-all duration-300 relative ${
                                        isDragging
                                            ? "opacity-20 scale-[0.97] border-white/5 shadow-inner"
                                            : isOver
                                                ? "border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.25)] scale-[1.02] z-20"
                                                : "border-white/5 hover:border-[#c5a059]/30"
                                    }`}
                                >
                                    <div
                                        draggable
                                        onDragStart={(e) => handleProjDragStart(e, i)}
                                        onDragOver={(e) => handleProjDragOver(e, i)}
                                        onDrop={(e) => handleProjDrop(e, i)}
                                        onDragEnd={() => { setDraggedProjIdx(null); setDragOverProjIdx(null); }}
                                        className="aspect-video relative bg-white/2 overflow-hidden select-none cursor-grab active:cursor-grabbing z-10"
                                    >
                                        {isOver ? (
                                            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c5a059]">
                                                <span className="text-2xl font-black text-[#c5a059]">➔</span>
                                                <span className="text-[10px] tracking-[0.2em] font-black uppercase text-[#c5a059]">Drop Here</span>
                                            </div>
                                        ) : (
                                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-white/50 group-hover:text-[#c5a059] px-3 py-1.5 rounded-full border border-white/10 transition-colors pointer-events-none">
                                                <span>⋮⋮</span>
                                                <span className="text-[8px] tracking-widest font-black">Hold & Drag</span>
                                            </div>
                                        )}

                                        {proj.img ? (
                                            <img
                                                src={proj.img}
                                                draggable="false"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
                                                alt={proj.title}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[10px] text-gray-500 uppercase font-black tracking-widest select-none pointer-events-none">
                                                No Visual Asset
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 flex gap-2 z-30" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={proj.type}
                                                onChange={(e) => updateProject(i, "type", e.target.value)}
                                                className="bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-[#c5a059] px-3 py-1 rounded-full border border-white/10 outline-none cursor-pointer"
                                            >
                                                <option value="commercial">Commercial</option>
                                                <option value="wedding">Wedding</option>
                                                <option value="music">Music</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        <input
                                            type="text"
                                            value={proj.title}
                                            onChange={(e) => updateProject(i, "title", e.target.value)}
                                            placeholder="Project Title"
                                            className="w-full bg-transparent text-lg font-black text-white outline-none focus:text-[#c5a059] transition-colors uppercase tracking-tight"
                                        />

                                        <div className="space-y-4 pt-3 border-t border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest pl-1 block">
                                                    Custom Thumbnail Asset
                                                </label>
                                                <ImageUploader
                                                    currentImage={proj.img}
                                                    recommendedSize="1920x1080 Thumbnail"
                                                    onUploadSuccess={(url) => updateProject(i, "img", url)}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest pl-1">
                                                    Master Video URL (YouTube or Direct)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={proj.videoUrl}
                                                    onChange={(e) => updateProject(i, "videoUrl", e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-[#c5a059] outline-none"
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setProjectToDelete(i)}
                                            className="w-full py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all mt-2"
                                        >
                                            Delete Project
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- MODAL 1: ADD NEW PHOTO --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black text-[#c5a059] uppercase tracking-widest">Gallery CMS</h3>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Add New Photo</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePhoto} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newItemForm.title}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                                    placeholder="e.g. Royal Bengali Bridal Portrait"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={newItemForm.category}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                                        className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="weddings">Weddings</option>
                                        <option value="pre-wedding">Pre-Wedding</option>
                                        <option value="rituals">Traditional Rituals</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="drone">Drone &amp; Aerial</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                        Aspect Ratio
                                    </label>
                                    <select
                                        value={newItemForm.aspectRatio}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, aspectRatio: e.target.value })}
                                        className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="vertical">Vertical Portrait (4:5)</option>
                                        <option value="horizontal">Horizontal Landscape (16:9)</option>
                                        <option value="square">Square (1:1)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Image Asset *
                                </label>
                                <ImageUploader
                                    currentImage={newItemForm.imageUrl}
                                    onUploadSuccess={(url) => setNewItemForm({ ...newItemForm, imageUrl: url })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Caption (Story Behind the Frame)
                                </label>
                                <textarea
                                    rows={2}
                                    value={newItemForm.caption}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, caption: e.target.value })}
                                    placeholder="Emotional candid moment captured during ceremony..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-medium outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    SEO Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={newItemForm.altText}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, altText: e.target.value })}
                                    placeholder="Bengali wedding photography Kolkata by Dreamline Production"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-medium outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={newItemForm.published}
                                        onChange={(e) => setNewItemForm({ ...newItemForm, published: e.target.checked })}
                                        className="w-4 h-4 accent-[#c5a059]"
                                    />
                                    <span className="text-xs font-bold text-white uppercase">Publish Immediately</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGallery}
                                    className="px-8 py-3 rounded-xl bg-[#c5a059] text-black hover:bg-white text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50"
                                >
                                    {savingGallery ? "Saving..." : "Add to Gallery"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: EDIT PHOTO DETAILS --- */}
            {editingItem && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-sm font-black text-[#c5a059] uppercase tracking-widest">Edit Frame</h3>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{editingItem.title}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePhoto} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingItem.title}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="weddings">Weddings</option>
                                        <option value="pre-wedding">Pre-Wedding</option>
                                        <option value="rituals">Traditional Rituals</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="drone">Drone &amp; Aerial</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                        Aspect Ratio
                                    </label>
                                    <select
                                        value={editingItem.aspectRatio || "vertical"}
                                        onChange={(e) => setEditingItem({ ...editingItem, aspectRatio: e.target.value })}
                                        className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="vertical">Vertical Portrait (4:5)</option>
                                        <option value="horizontal">Horizontal Landscape (16:9)</option>
                                        <option value="square">Square (1:1)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    Caption
                                </label>
                                <textarea
                                    rows={2}
                                    value={editingItem.caption || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-medium outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                                    SEO Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={editingItem.altText || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-medium outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.published}
                                        onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                                        className="w-4 h-4 accent-[#c5a059]"
                                    />
                                    <span className="text-xs font-bold text-white uppercase">Published on Website</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGallery}
                                    className="px-8 py-3 rounded-xl bg-[#c5a059] text-black hover:bg-white text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50"
                                >
                                    {savingGallery ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: DELETE CONFIRMATION DIALOG (PHOTO) --- */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl text-red-500">
                            ⚠️
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Confirm Deletion</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                Are you sure you want to remove <span className="text-white font-bold">"{itemToDelete.title}"</span> from the master gallery? This frame will no longer appear on the website.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                type="button"
                                onClick={() => setItemToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeletePhoto}
                                disabled={savingGallery}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50"
                            >
                                {savingGallery ? "Deleting..." : "Delete Frame"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 4: DELETE CONFIRMATION DIALOG (PROJECT) --- */}
            {projectToDelete !== null && (
                <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-2xl text-red-500">
                            ⚠️
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Delete Project</h3>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                Are you sure you want to remove this project? Remember to click "Commit Projects Sync" to permanently save the change.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                type="button"
                                onClick={() => setProjectToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-black text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteProject}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
