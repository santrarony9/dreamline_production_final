"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

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
            const data = res.data.luxury || res.data || {};
            setContent({
                hero: data.hero || {},
                testimonial: data.testimonial || {}
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await axios.post("/api/content", { luxury: content });
            setMessage("Luxury page content updated!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
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
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Luxury <span className="text-gray-700">Weddings.</span></h1>
            </header>

            <form onSubmit={handleSave} className="space-y-10">
                {/* HERO SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Hero Projection</h3>
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
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Testimonial</h3>
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
                        <div className="space-y-2 md:col-span-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Author Image (Optional) - <span className="text-[#c5a059]">400x400 (square)</span>
                                </label>
                                {content.testimonial.image && (
                                    <button type="button" onClick={() => updateSection("testimonial", "image", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.testimonial.image || ""}
                                onChange={(e) => updateSection("testimonial", "image", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste image URL"
                            />
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
