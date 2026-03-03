"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

export default function HomeEditor() {
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
            const data = res.data;
            setContent({
                hero: data.hero || {},
                stats: data.stats || [],
                marquee: data.marquee || [],
                gallery: data.gallery || { images: [] }
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
            await axios.post("/api/content", content);
            setMessage("Home page content updated!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Error saving content.");
        } finally {
            setSaving(false);
        }
    };

    // Helper for Hero updates
    const updateHero = (field, value) => {
        setContent(prev => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    const updateNestedHero = (category, field, value) => {
        setContent(prev => ({
            ...prev,
            hero: {
                ...prev.hero,
                [category]: { ...prev.hero[category], [field]: value }
            }
        }));
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Decoding cinema data...</div>;

    return (
        <div className="space-y-12 max-w-6xl pb-32">
            <header>
                <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Cinematography</h2>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Front <span className="text-gray-700">Office.</span></h1>
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
                                value={content.hero.title?.line1 || ""}
                                onChange={(e) => updateNestedHero("title", "line1", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Secondary Title</label>
                            <input
                                type="text"
                                value={content.hero.title?.line2 || ""}
                                onChange={(e) => updateNestedHero("title", "line2", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Subtitle</label>
                            <input
                                type="text"
                                value={content.hero.subtitle || ""}
                                onChange={(e) => updateHero("subtitle", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Cinematic Backdrop (Video URL)</label>
                            <input
                                type="text"
                                value={content.hero.videoUrl || ""}
                                onChange={(e) => updateHero("videoUrl", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste direct .mp4 or Cloudinary URL"
                            />
                        </div>
                    </div>
                </div>

                {/* MARQUEE EDITOR */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Kinetic Ticker</h3>
                    <div className="space-y-4">
                        {content.marquee.map((text, i) => (
                            <div key={i} className="flex gap-4">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => {
                                        const newMarquee = [...content.marquee];
                                        newMarquee[i] = e.target.value;
                                        setContent(prev => ({ ...prev, marquee: newMarquee }));
                                    }}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setContent(prev => ({ ...prev, marquee: prev.marquee.filter((_, idx) => idx !== i) }))}
                                    className="px-6 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setContent(prev => ({ ...prev, marquee: [...prev.marquee, "New Story Headline"] }))}
                            className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] hover:border-[#c5a059]/30 transition-all"
                        >
                            + Add Headline
                        </button>
                    </div>
                </div>

                {/* STATS EDITOR */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Legacy Figures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {content.stats.map((stat, i) => (
                            <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl space-y-4 relative group">
                                <input
                                    type="text"
                                    value={stat.value}
                                    onChange={(e) => {
                                        const newStats = [...content.stats];
                                        newStats[i].value = e.target.value;
                                        setContent(prev => ({ ...prev, stats: newStats }));
                                    }}
                                    placeholder="Value (e.g. 500+)"
                                    className="w-full bg-transparent text-2xl font-black text-white outline-none focus:text-[#c5a059] transition-colors"
                                />
                                <input
                                    type="text"
                                    value={stat.label}
                                    onChange={(e) => {
                                        const newStats = [...content.stats];
                                        newStats[i].label = e.target.value;
                                        setContent(prev => ({ ...prev, stats: newStats }));
                                    }}
                                    placeholder="Label"
                                    className="w-full bg-transparent text-[10px] font-black uppercase text-gray-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setContent(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }))}
                                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setContent(prev => ({ ...prev, stats: [...prev.stats, { value: "0", label: "Label" }] }))}
                            className="flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] transition-all aspect-video lg:aspect-auto"
                        >
                            + Add Stat
                        </button>
                    </div>
                </div>

                <div className="fixed bottom-12 right-12 z-[100] flex items-center gap-6 bg-black/80 backdrop-blur-xl border border-[#c5a059]/30 p-4 rounded-full shadow-2xl">
                    {message && <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>{message}</p>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Deploying..." : "Sync Home Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}
