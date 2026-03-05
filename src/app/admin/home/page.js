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
            const data = res.data.home || res.data || {}; // Handle if nested under home or top-level depending on response
            setContent({
                hero: data.hero || {},
                stats: data.stats || [],
                marquee: data.marquee || [],
                expertise: data.expertise || {},
                motionArchive: data.motionArchive || { images: [] },
                videoVault: data.videoVault || [],
                reviews: data.reviews || { list: [] },
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
            // Need to wrap in 'home' object so it matches backend structure if we use atomic updates
            // But flattening in backend means we just send top-level keys like `home.hero.titleLine1` 
            // Better to structure it as { home: content } to match Content schema
            await axios.post("/api/content", { home: content, videoVault: content.videoVault });
            setMessage("Home page content updated!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Error saving content.");
        } finally {
            setSaving(false);
        }
    };

    // Helper for regular updates
    const updateSection = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const updateNested = (section, category, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [category]: { ...prev[section][category], [field]: value }
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
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Subtitle</label>
                            <input
                                type="text"
                                value={content.hero.subtitle || ""}
                                onChange={(e) => updateSection("hero", "subtitle", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Cinematic Backdrop (Video URL) - <span className="text-[#c5a059]">1920x1080 (16:9)</span>
                                </label>
                                {content.hero.backgroundImage && (
                                    <button type="button" onClick={() => updateSection("hero", "backgroundImage", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.hero.backgroundImage || ""}
                                onChange={(e) => updateSection("hero", "backgroundImage", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste direct .mp4 or Cloudinary URL"
                            />
                        </div>
                    </div>
                </div>

                {/* EXPERTISE SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Expertise Section</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Section Title</label>
                            <input
                                type="text"
                                value={content.expertise.title || ""}
                                onChange={(e) => updateSection("expertise", "title", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Years Experience</label>
                            <input
                                type="text"
                                value={content.expertise.yearsExperience || ""}
                                onChange={(e) => updateSection("expertise", "yearsExperience", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Heading</label>
                            <input
                                type="text"
                                value={content.expertise.heading || ""}
                                onChange={(e) => updateSection("expertise", "heading", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Description</label>
                            <textarea
                                value={content.expertise.description || ""}
                                onChange={(e) => updateSection("expertise", "description", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Expertise Image - <span className="text-[#c5a059]">800x1200 (vertical)</span>
                                </label>
                                {content.expertise.image && (
                                    <button type="button" onClick={() => updateSection("expertise", "image", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.expertise.image || ""}
                                onChange={(e) => updateSection("expertise", "image", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                placeholder="Image URL"
                            />
                        </div>

                        {/* Who We Are Services List */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                            <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">Expertise Services (Who We Are)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(content.expertise.servicesList || []).map((srv, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-3 relative group">
                                        <input
                                            type="text"
                                            value={srv.number || ""}
                                            onChange={(e) => {
                                                const newList = [...content.expertise.servicesList];
                                                newList[i] = { ...newList[i], number: e.target.value };
                                                updateSection("expertise", "servicesList", newList);
                                            }}
                                            placeholder="No. (e.01)"
                                            className="w-full bg-transparent text-[10px] font-black text-[#c5a059] outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={srv.name || ""}
                                            onChange={(e) => {
                                                const newList = [...content.expertise.servicesList];
                                                newList[i] = { ...newList[i], name: e.target.value };
                                                updateSection("expertise", "servicesList", newList);
                                            }}
                                            placeholder="Service Name"
                                            className="w-full bg-transparent text-sm font-bold text-white outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newList = content.expertise.servicesList.filter((_, idx) => idx !== i);
                                                updateSection("expertise", "servicesList", newList);
                                            }}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newList = [...(content.expertise.servicesList || []), { name: "", number: "0" + ((content.expertise.servicesList?.length || 0) + 1) }];
                                        updateSection("expertise", "servicesList", newList);
                                    }}
                                    className="flex items-center justify-center border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:text-[#c5a059] aspect-video sm:aspect-auto p-4"
                                >
                                    + Add Expertise Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SERVICES CATEGORIES SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Service Categories (Main Gallery)</h3>
                    <div className="space-y-6">
                        {(content.services || []).map((srv, i) => (
                            <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Number</label>
                                    <input
                                        type="text"
                                        value={srv.number || ""}
                                        onChange={(e) => {
                                            const newList = [...content.services];
                                            newList[i] = { ...newList[i], number: e.target.value };
                                            setContent(prev => ({ ...prev, services: newList }));
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                        placeholder="01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Category Name</label>
                                    <input
                                        type="text"
                                        value={srv.title || ""}
                                        onChange={(e) => {
                                            const newList = [...content.services];
                                            newList[i] = { ...newList[i], title: e.target.value };
                                            setContent(prev => ({ ...prev, services: newList }));
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                        placeholder="WEDDING CINEMA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Pricing Hint/Description</label>
                                    <input
                                        type="text"
                                        value={srv.priceHint || ""}
                                        onChange={(e) => {
                                            const newList = [...content.services];
                                            newList[i] = { ...newList[i], priceHint: e.target.value };
                                            setContent(prev => ({ ...prev, services: newList }));
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                        placeholder="Starting at..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newList = content.services.filter((_, idx) => idx !== i);
                                        setContent(prev => ({ ...prev, services: newList }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newList = [...(content.services || []), { title: "", number: "0" + ((content.services?.length || 0) + 1), priceHint: "" }];
                                setContent(prev => ({ ...prev, services: newList }));
                            }}
                            className="w-full py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] hover:border-[#c5a059]/30 transition-all"
                        >
                            + Add Service Category
                        </button>
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
                            onClick={() => setContent(prev => ({ ...prev, stats: [...prev.stats, { value: "0", label: "Label", suffix: "+" }] }))}
                            className="flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] transition-all aspect-video lg:aspect-auto"
                        >
                            + Add Stat
                        </button>
                    </div>
                </div>

                {/* MOTION ARCHIVE */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Motion Archive</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Title</label>
                            <input
                                type="text"
                                value={content.motionArchive.title || ""}
                                onChange={(e) => updateSection("motionArchive", "title", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Subtitle</label>
                            <input
                                type="text"
                                value={content.motionArchive.subtitle || ""}
                                onChange={(e) => updateSection("motionArchive", "subtitle", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-4 md:col-span-2 pt-4 border-t border-white/5">
                            <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">Archive Assets (Images)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                {(content.motionArchive.images || []).map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImgs = content.motionArchive.images.filter((_, idx) => idx !== i);
                                                updateSection("motionArchive", "images", newImgs);
                                            }}
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-[10px] font-black uppercase text-white">Remove</span>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = prompt("Enter Image URL:");
                                        if (url) {
                                            const newImgs = [...(content.motionArchive.images || []), url];
                                            updateSection("motionArchive", "images", newImgs);
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:text-[#c5a059] aspect-square"
                                >
                                    <span>+ Add</span>
                                    <span>Image</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIDEO VAULT */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Video Vault (Cinematic Grid)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(content.videoVault || []).map((v, i) => (
                            <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={v.title || ""}
                                        onChange={(e) => {
                                            const newList = [...content.videoVault];
                                            newList[i] = { ...newList[i], title: e.target.value };
                                            setContent(prev => ({ ...prev, videoVault: newList }));
                                        }}
                                        placeholder="Video Title"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                    />
                                    <input
                                        type="text"
                                        value={v.category || ""}
                                        onChange={(e) => {
                                            const newList = [...content.videoVault];
                                            newList[i] = { ...newList[i], category: e.target.value };
                                            setContent(prev => ({ ...prev, videoVault: newList }));
                                        }}
                                        placeholder="Category"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={v.videoUrl || ""}
                                    onChange={(e) => {
                                        const newList = [...content.videoVault];
                                        newList[i] = { ...newList[i], videoUrl: e.target.value };
                                        setContent(prev => ({ ...prev, videoVault: newList }));
                                    }}
                                    placeholder="Embed URL (YouTube/Vimeo)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                />
                                <input
                                    type="text"
                                    value={v.image || ""}
                                    onChange={(e) => {
                                        const newList = [...content.videoVault];
                                        newList[i] = { ...newList[i], image: e.target.value };
                                        setContent(prev => ({ ...prev, videoVault: newList }));
                                    }}
                                    placeholder="Thumbnail URL"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newList = content.videoVault.filter((_, idx) => idx !== i);
                                        setContent(prev => ({ ...prev, videoVault: newList }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newList = [...(content.videoVault || []), { title: "", category: "", videoUrl: "", image: "" }];
                                setContent(prev => ({ ...prev, videoVault: newList }));
                            }}
                            className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-[#c5a059] aspect-video"
                        >
                            + Add Reel to Vault
                        </button>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Reputation / Reviews Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Section Subtitle</label>
                            <input
                                type="text"
                                value={content.reviews.sectionSubtitle || ""}
                                onChange={(e) => updateSection("reviews", "sectionSubtitle", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Average Rating Number</label>
                            <input
                                type="text"
                                value={content.reviews.averageRating || ""}
                                onChange={(e) => updateSection("reviews", "averageRating", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                placeholder="e.g. 4.9"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Total Reviews Text</label>
                            <input
                                type="text"
                                value={content.reviews.totalReviewsText || ""}
                                onChange={(e) => updateSection("reviews", "totalReviewsText", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                placeholder="e.g. Average Rating (150+ Reviews on Google)"
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
                        {saving ? "Deploying..." : "Sync Home Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}
