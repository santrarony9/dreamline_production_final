"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function LuxuryEditor() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await axios.get("/api/content");
            // Support both root-level and nested luxury object
            const luxuryRoot = res.data.luxury || {};
            
            setContent({
                hero: luxuryRoot.hero || {},
                testimonial: luxuryRoot.testimonial || {},
                // Aggressively search for carousel images in all known locations
                luxuryCarousel: luxuryRoot.luxuryCarousel || luxuryRoot.sparkCarousel || res.data.sparkCarousel || []
            });
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            // Save to both keys to ensure the frontend (sparkCarousel) and admin (luxuryCarousel) stay in sync
            const payload = {
                ...content,
                sparkCarousel: content.luxuryCarousel
            };
            await axios.post("/api/content", { luxury: payload });
            setMessage("Luxury page content updated!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Save Error:", err);
            setMessage("Error saving content.");
        } finally {
            setSaving(false);
        }
    };

    const updateSection = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Decoding cinema data...</div>;

    return (
        <div className="space-y-12 max-w-6xl pb-32">
            <header>
                <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Cinematography</h2>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Luxury <span className="text-gray-500">Weddings.</span></h1>
            </header>

            <form onSubmit={handleSave} className="space-y-10">
                {/* HERO SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <a href="/luxury" target="_blank" className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full hover:bg-[#c5a059] hover:text-black transition-all">VIEW ON WEBSITE</a>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🏠 Luxury Page Header</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The main title and description at the top of the Luxury Weddings page.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Primary Title</label>
                            <input
                                type="text"
                                value={content.hero.titleLine1 || ""}
                                onChange={(e) => updateSection("hero", "titleLine1", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Secondary Title</label>
                            <input
                                type="text"
                                value={content.hero.titleLine2 || ""}
                                onChange={(e) => updateSection("hero", "titleLine2", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Description</label>
                            <textarea
                                value={content.hero.description || ""}
                                onChange={(e) => updateSection("hero", "description", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                {/* TESTIMONIAL SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">⭐ Star Testimonial</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">A featured review from a high-profile client.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Quote</label>
                            <textarea
                                value={content.testimonial.quote || ""}
                                onChange={(e) => updateSection("testimonial", "quote", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Author</label>
                            <input
                                type="text"
                                value={content.testimonial.author || ""}
                                onChange={(e) => updateSection("testimonial", "author", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Role</label>
                            <input
                                type="text"
                                value={content.testimonial.role || ""}
                                onChange={(e) => updateSection("testimonial", "role", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-4 md:col-span-2 relative">
                            <ImageUploader
                                currentImage={content.testimonial.image}
                                recommendedSize="Author Image (Optional) - 400x400 (square) recommended"
                                onUploadSuccess={(url) => updateSection("testimonial", "image", url)}
                            />
                            {content.testimonial.image && (
                                <button type="button" onClick={() => updateSection("testimonial", "image", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* CINEMATIC MOTION (LUXURY CAROUSEL) SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🎬 Cinematic Motion</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">A beautiful sliding carousel of your best luxury wedding photography.</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">Carousel Images - <span className="text-gray-500">Minimum 3 images (1200x800 recommended)</span></label>
                        
                        {(!content.luxuryCarousel || content.luxuryCarousel.length === 0) && (
                            <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 p-6 rounded-2xl mb-6">
                                <p className="text-[11px] text-[#c5a059] font-bold uppercase tracking-widest leading-relaxed">
                                    💡 Note: Your database is currently empty. The live website is showing "Cinematic Fallbacks" (placeholders). 
                                    Upload 3+ images here to replace them with your own work.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {(content.luxuryCarousel || []).map((img, i) => (
                                <div key={i} className="relative aspect-[3/2] rounded-xl overflow-hidden group border border-white/5">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newGal = content.luxuryCarousel.filter((_, idx) => idx !== i);
                                            setContent(prev => ({ ...prev, luxuryCarousel: newGal }));
                                        }}
                                        className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-[10px] font-black uppercase text-white">Remove</span>
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-[3/2] bg-white/5 border w-full flex items-center justify-center border-dashed border-white/10 rounded-xl overflow-hidden p-2">
                                <ImageUploader
                                    onUploadSuccess={(url) => {
                                        const newGal = [...(content.luxuryCarousel || []), url];
                                        setContent(prev => ({ ...prev, luxuryCarousel: newGal }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-12 md:right-12 md:left-auto md:translate-x-0 z-[100] flex items-center gap-4 md:gap-6 bg-black/80 backdrop-blur-xl border border-[#c5a059]/30 p-3 md:p-4 rounded-full shadow-2xl w-[90%] md:w-auto justify-center md:justify-start">
                    {message && <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>{message}</p>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Deploying..." : "Sync Luxury Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}

