"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function WeddingAdmin() {
    const [weddings, setWeddings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWedding, setEditingWedding] = useState(null);
    const [saving, setSaving] = useState(false);
    const [replacingImageIndex, setReplacingImageIndex] = useState(null);

    useEffect(() => {
        fetchWeddings();
    }, []);

    const fetchWeddings = async () => {
        try {
            const res = await axios.get("/api/weddings");
            setWeddings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingWedding._id) {
                await axios.put("/api/weddings", editingWedding);
            } else {
                await axios.post("/api/weddings", editingWedding);
            }
            setEditingWedding(null);
            setReplacingImageIndex(null);
            fetchWeddings();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error saving wedding film.");
        } finally {
            setSaving(false);
        }
    };

    const deleteWedding = async (id) => {
        if (!confirm("Remove this masterpiece from the archive?")) return;
        try {
            await axios.delete(`/api/weddings?id=${id}`);
            setWeddings(weddings.filter(w => w._id !== id));
        } catch (err) {
            alert("Error deleting wedding.");
        }
    };

    const startNewWedding = () => {
        setEditingWedding({
            title: "",
            subtitle: "Luxury Bengali Wedding",
            location: "",
            date: new Date().toISOString().split('T')[0],
            img: "",
            coverImage: "",
            videoUrl: "",
            description: "",
            review: "",
            clientNames: "",
            images: [],
            altText: "",
            imageAltTexts: [],
            id: `wedding-${Date.now()}`
        });
        setReplacingImageIndex(null);
    };

    // --- Gallery Reordering & Manipulation Helpers ---
    const setAsFeaturedCover = (url) => {
        if (!url || !editingWedding) return;
        setEditingWedding({
            ...editingWedding,
            coverImage: url,
            img: url
        });
    };

    const moveImage = (index, direction) => {
        if (!editingWedding?.images) return;
        const newImages = [...editingWedding.images];
        const newAltTexts = [...(editingWedding.imageAltTexts || [])];
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newImages.length) return;

        // Swap images
        const tempImg = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = tempImg;

        // Swap alt texts
        const tempAlt = newAltTexts[index] || "";
        newAltTexts[index] = newAltTexts[targetIndex] || "";
        newAltTexts[targetIndex] = tempAlt;

        setEditingWedding({
            ...editingWedding,
            images: newImages,
            imageAltTexts: newAltTexts
        });
    };

    const removeImage = (index) => {
        if (!confirm("Remove this image from the project gallery?")) return;
        const newImages = editingWedding.images.filter((_, i) => i !== index);
        const newAltTexts = (editingWedding.imageAltTexts || []).filter((_, i) => i !== index);

        // If the removed image was the cover image, pick the next available one
        let newCover = editingWedding.coverImage;
        let newImg = editingWedding.img;
        if (editingWedding.images[index] === editingWedding.coverImage) {
            newCover = newImages[0] || "";
            newImg = newImages[0] || "";
        }

        setEditingWedding({
            ...editingWedding,
            images: newImages,
            imageAltTexts: newAltTexts,
            coverImage: newCover,
            img: newImg
        });
        if (replacingImageIndex === index) setReplacingImageIndex(null);
    };

    const replaceImage = (index, newUrl) => {
        const newImages = [...(editingWedding.images || [])];
        const wasCover = newImages[index] === editingWedding.coverImage;
        newImages[index] = newUrl;

        const update = {
            ...editingWedding,
            images: newImages
        };
        if (wasCover) {
            update.coverImage = newUrl;
            update.img = newUrl;
        }
        setEditingWedding(update);
        setReplacingImageIndex(null);
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Compiling heritage collection...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Heritage</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Wedding <span className="text-gray-500">Films &amp; Galleries.</span></h1>
                    <p className="text-xs text-gray-400 mt-2">Manage featured cover images, project-isolated photo galleries, and video narratives.</p>
                </div>
                <button type="button"
                    onClick={startNewWedding}
                    className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                >
                    + Register New Film
                </button>
            </header>

            {/* List Grid */}
            {!editingWedding && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {weddings.map((w) => {
                        const coverSrc = w.coverImage || w.img || (w.images && w.images[0]) || "/thumbnails/seo_thumb_holud.jpg";
                        const imageCount = (w.images || []).length;

                        return (
                            <div key={w._id || w.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/40 transition-all flex flex-col shadow-xl">
                                <div className="aspect-video relative overflow-hidden bg-black/60">
                                    <img src={coverSrc} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={w.title} />
                                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-widest">
                                            ★ Featured Cover
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase text-gray-300">
                                        📷 {imageCount} photo{imageCount !== 1 ? 's' : ''}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingWedding(w)} 
                                            className="bg-[#c5a059] text-black px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all"
                                        >
                                            Edit Project
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight group-hover:text-[#c5a059] transition-colors">{w.title}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            {w.location || "Kolkata"} • {w.date ? new Date(w.date).getFullYear() : "2024"}
                                        </p>
                                        {w.videoUrl && (
                                            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5">
                                                <span>▶</span> Video Film Linked
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingWedding(w)} 
                                            className="text-[10px] font-black text-[#c5a059] hover:underline uppercase tracking-wider"
                                        >
                                            Manage Images →
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => deleteWedding(w._id)} 
                                            className="text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Editor Modal Overlay */}
            {editingWedding && (
                <div className="fixed inset-0 bg-black/95 z-[101] overflow-y-auto p-4 sm:p-6 md:p-12">
                    <div className="max-w-5xl mx-auto pb-24">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                            <div>
                                <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em]">Project Editor</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                                    {editingWedding.title || "New Wedding"} <span className="text-gray-500">— Assets &amp; Story</span>
                                </h2>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => { setEditingWedding(null); setReplacingImageIndex(null); }} 
                                className="text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 uppercase text-[10px] font-black tracking-widest transition-colors"
                            >
                                ✕ Close
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            {/* Primary Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0e0e0e] border border-white/5 p-6 sm:p-8 rounded-3xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Couple / Project Title</label>
                                    <input 
                                        type="text" 
                                        value={editingWedding.title} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, title: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] font-bold" 
                                        placeholder="e.g. SID & TRINA"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Location / Venue</label>
                                    <input 
                                        type="text" 
                                        value={editingWedding.location || ""} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, location: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" 
                                        placeholder="e.g. ITC Royal Bengal, Kolkata"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Cinematic Video URL (YouTube / Vimeo)</label>
                                    <input 
                                        type="text" 
                                        value={editingWedding.videoUrl || ""} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, videoUrl: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" 
                                        placeholder="https://youtu.be/..." 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Cover Image Alt Text (SEO)</label>
                                    <input
                                        type="text"
                                        value={editingWedding.altText || ""}
                                        onChange={(e) => setEditingWedding({ ...editingWedding, altText: e.target.value })}
                                        placeholder="e.g. Sid & Trina Luxury Bengali Wedding Film Kolkata"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] text-sm"
                                    />
                                </div>
                            </div>

                            {/* Featured Cover Image Section */}
                            <div className="bg-[#0e0e0e] border border-[#c5a059]/30 p-6 sm:p-8 rounded-3xl space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#c5a059] text-sm">★</span>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">Active Featured Cover Image</h3>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">This image appears on homepage cards, portfolio grids, and the top hero of the project story.</p>
                                    </div>
                                    {(editingWedding.coverImage || editingWedding.img) && (
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingWedding({ ...editingWedding, coverImage: "", img: "" })} 
                                            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
                                        >
                                            Clear Cover Asset
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-black/60 border-2 border-[#c5a059] shadow-lg">
                                        {(editingWedding.coverImage || editingWedding.img) ? (
                                            <img 
                                                src={editingWedding.coverImage || editingWedding.img} 
                                                className="w-full h-full object-cover" 
                                                alt="Featured Cover Preview" 
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 text-xs font-bold uppercase">
                                                No Featured Cover Selected
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 bg-black/90 px-3 py-1 rounded-full border border-white/10">
                                            <span className="text-[#c5a059] text-[9px] font-black uppercase">Active Cover</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <p className="text-[11px] text-gray-400">
                                            Upload a new high-resolution cover image or click <strong className="text-[#c5a059]">"★ Set as Featured"</strong> on any photograph in the gallery array below.
                                        </p>
                                        <ImageUploader
                                            currentImage={editingWedding.coverImage || editingWedding.img}
                                            recommendedSize="1920x1080 Landscape (Max 50MB)"
                                            onUploadSuccess={(url) => setAsFeaturedCover(url)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Project-Isolated Gallery Images Array */}
                            <div className="bg-[#0e0e0e] border border-white/5 p-6 sm:p-8 rounded-3xl space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">
                                            Project-Specific Photo Gallery ({(editingWedding.images || []).length} items)
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            All photos here belong exclusively to <strong className="text-white">{editingWedding.title || "this wedding"}</strong>. Rearrange, replace, or set any photo as the featured cover.
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        Isolated to this project
                                    </span>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {(editingWedding.images || []).map((img, index) => {
                                        const isCover = img === editingWedding.coverImage || img === editingWedding.img;
                                        const isReplacing = replacingImageIndex === index;

                                        return (
                                            <div 
                                                key={index} 
                                                className={`bg-zinc-950 rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                                                    isCover 
                                                        ? "border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.25)]" 
                                                        : "border-white/10 hover:border-white/30"
                                                }`}
                                            >
                                                {/* Image Preview */}
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 group">
                                                    <img 
                                                        src={img} 
                                                        alt={editingWedding?.title ? `${editingWedding.title} photo ${index + 1}` : `Wedding capture ${index + 1}`} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                    />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                                                        <span className="bg-black/85 backdrop-blur-md text-[9px] font-black text-gray-300 px-2 py-0.5 rounded-full border border-white/10">
                                                            #{index + 1}
                                                        </span>
                                                        {isCover && (
                                                            <span className="bg-[#c5a059] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                                                                ★ Featured
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Reorder Buttons Overlay */}
                                                    <div className="absolute bottom-2 inset-x-2 flex justify-between items-center z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            disabled={index === 0}
                                                            onClick={() => moveImage(index, -1)}
                                                            className="w-7 h-7 rounded-full bg-black/80 hover:bg-[#c5a059] hover:text-black text-white text-xs font-black flex items-center justify-center disabled:opacity-30 disabled:hover:bg-black/80 disabled:hover:text-white transition-colors"
                                                            title="Move Left"
                                                        >
                                                            ←
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={index === (editingWedding.images || []).length - 1}
                                                            onClick={() => moveImage(index, 1)}
                                                            className="w-7 h-7 rounded-full bg-black/80 hover:bg-[#c5a059] hover:text-black text-white text-xs font-black flex items-center justify-center disabled:opacity-30 disabled:hover:bg-black/80 disabled:hover:text-white transition-colors"
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
                                                            <span className="text-[9px] font-black uppercase text-[#c5a059]">Replace Image #{index + 1}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setReplacingImageIndex(null)} 
                                                                className="text-xs text-gray-400 hover:text-white"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <ImageUploader
                                                            currentImage={img}
                                                            onUploadSuccess={(newUrl) => replaceImage(index, newUrl)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Action Controls */}
                                                <div className="space-y-2 pt-3">
                                                    {!isCover && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAsFeaturedCover(img)}
                                                            className="w-full py-1.5 px-3 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black text-[9px] font-black uppercase tracking-wider transition-colors"
                                                        >
                                                            ★ Set as Featured Cover
                                                        </button>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplacingImageIndex(isReplacing ? null : index)}
                                                            className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-300 transition-colors"
                                                        >
                                                            🔄 Replace
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500 rounded-lg text-[9px] font-black uppercase text-red-400 hover:text-white transition-colors"
                                                            title="Remove image"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>

                                                    {/* Alt Text Input */}
                                                    <input
                                                        type="text"
                                                        value={(editingWedding.imageAltTexts || [])[index] || ""}
                                                        onChange={(e) => {
                                                            const newAltTexts = [...(editingWedding.imageAltTexts || [])];
                                                            newAltTexts[index] = e.target.value;
                                                            setEditingWedding({ ...editingWedding, imageAltTexts: newAltTexts });
                                                        }}
                                                        placeholder="SEO Alt text..."
                                                        className="text-[9px] text-gray-300 w-full bg-white/5 border border-white/5 focus:border-[#c5a059] rounded-lg outline-none px-2 py-1.5 mt-1"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Upload New Image Box */}
                                    <div className="aspect-[4/3] bg-white/[0.02] border-2 border-dashed border-white/15 hover:border-[#c5a059]/50 rounded-2xl flex flex-col items-center justify-center p-4 transition-colors">
                                        <span className="text-xl text-[#c5a059] mb-2">+</span>
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center mb-3">
                                            Add Photo to {editingWedding.title || "Project"}
                                        </span>
                                        <ImageUploader
                                            onUploadSuccess={(url) => {
                                                const newImages = [...(editingWedding.images || []), url];
                                                const newAltTexts = [...(editingWedding.imageAltTexts || []), `${editingWedding.title || 'Wedding'} ceremony capture`];
                                                // If no cover set yet, set this one
                                                const update = {
                                                    ...editingWedding,
                                                    images: newImages,
                                                    imageAltTexts: newAltTexts
                                                };
                                                if (!editingWedding.coverImage && !editingWedding.img) {
                                                    update.coverImage = url;
                                                    update.img = url;
                                                }
                                                setEditingWedding(update);
                                            }}
                                        />
                                    </div>
                                </div>

                                {(!editingWedding.images || editingWedding.images.length === 0) && (
                                    <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-xs uppercase font-black tracking-widest">No Gallery Images in this Project Yet</p>
                                        <p className="text-[10px] text-gray-600 mt-1">Use the upload box above to add authentic photographs.</p>
                                    </div>
                                )}
                            </div>

                            {/* Story Narrative & Client Review */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0e0e0e] border border-white/5 p-6 sm:p-8 rounded-3xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Story Narrative / Description</label>
                                    <textarea 
                                        value={editingWedding.description || ""} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, description: e.target.value })} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] h-32 text-sm leading-relaxed" 
                                        placeholder="Describe the aesthetic, rituals, and emotional highlights of this wedding celebration..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Client Quote / Testimonial</label>
                                    <textarea 
                                        value={editingWedding.review || ""} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, review: e.target.value })} 
                                        placeholder="Quote from the couple..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] h-20 text-sm italic" 
                                    />
                                    <input 
                                        type="text" 
                                        value={editingWedding.clientNames || ""} 
                                        onChange={(e) => setEditingWedding({ ...editingWedding, clientNames: e.target.value })} 
                                        placeholder="Attribution (e.g. Sid & Trina)" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-gray-300 outline-none focus:border-[#c5a059]" 
                                    />
                                </div>
                            </div>

                            {/* Save Submit Button */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="w-full bg-[#c5a059] text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.25em] hover:bg-white transition-all shadow-[0_0_30px_rgba(197,160,89,0.3)] disabled:opacity-50"
                                >
                                    {saving ? "Archiving Project..." : "Commit Verified Project Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
