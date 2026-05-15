"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

function HomeEditorContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "BANNER";
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update active tab when URL changes
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) setActiveTab(tab);
    }, [searchParams]);

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
                quote: data.quote || { text: "", backgroundImage: "" },
                partners: data.partners || [],
                services: data.services || [],
                splitGallery: res.data?.splitGallery || data?.splitGallery || []
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

    const tabs = [
        { id: "BANNER", label: "Banner & News", icon: "🎬" },
        { id: "SERVICES", label: "Service Buckets", icon: "🗂️" },
        { id: "BRAND", label: "Brand Identity", icon: "🏛️" },
        { id: "SOCIAL", label: "Social Proof", icon: "⭐" },
        { id: "GALLERY", label: "Visual Archives", icon: "🎞️" },
    ];

    return (
        <div className="space-y-12 max-w-6xl pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Cinematography</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Front <span className="text-gray-700">Office.</span></h1>
                </div>
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? "bg-[#c5a059] text-black shadow-lg"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-10">
                {/* BANNER TAB */}
                {activeTab === "BANNER" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* HERO SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <a href="/" target="_blank" className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full hover:bg-[#c5a059] hover:text-black transition-all">VIEW ON WEBSITE</a>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🏠 Homepage Banner</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The main full-screen image or video at the very top of your homepage.</p>
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
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Subtitle</label>
                                    <input
                                        type="text"
                                        value={content.hero.subtitle || ""}
                                        onChange={(e) => updateSection("hero", "subtitle", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2 relative">
                                    <ImageUploader
                                        currentImage={content.hero.backgroundImage}
                                        recommendedSize="Cinematic Backdrop (Video MP4 or Image URL) - 1920x1080 (16:9)"
                                        onUploadSuccess={(url) => updateSection("hero", "backgroundImage", url)}
                                    />
                                    {content.hero.backgroundImage && (
                                        <button type="button" onClick={() => updateSection("hero", "backgroundImage", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MARQUEE EDITOR */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">📢 Scrolling Text Bar</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Horizontal scrolling headlines that appear below the banner.</p>
                            </div>
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
                    </div>
                )}

                {/* SERVICES TAB */}
                {activeTab === "SERVICES" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* SERVICES CATEGORIES SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🗂️ Service Categories</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The main groupings of your work (Wedding, Commercial, Tech).</p>
                                </div>
                                <a href="/admin/services" className="text-[10px] font-black bg-[#c5a059] text-black px-4 py-2 rounded-full hover:bg-white transition-all">MANAGE INDIVIDUAL PAGES →</a>
                            </div>
                            <div className="space-y-6">
                                {(content.services || []).map((srv, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* REORDER BUTTONS */}
                                        <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === 0) return;
                                                    const newList = [...content.services];
                                                    [newList[i], newList[i - 1]] = [newList[i - 1], newList[i]];
                                                    setContent(prev => ({ ...prev, services: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === content.services.length - 1) return;
                                                    const newList = [...content.services];
                                                    [newList[i], newList[i + 1]] = [newList[i + 1], newList[i]];
                                                    setContent(prev => ({ ...prev, services: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = content.services.filter((_, idx) => idx !== i);
                                                    setContent(prev => ({ ...prev, services: newList }));
                                                }}
                                                className="bg-red-950/80 border border-red-500/20 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
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
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest text-[#c5a059]">Service Bucket (Menu Group)</label>
                                            <select
                                                value={srv.category || "wedding"}
                                                onChange={(e) => {
                                                    const newList = [...content.services];
                                                    newList[i] = { ...newList[i], category: e.target.value };
                                                    setContent(prev => ({ ...prev, services: newList }));
                                                }}
                                                className="w-full bg-white/10 border border-[#c5a059]/30 rounded-xl p-3 text-white text-xs font-bold outline-none"
                                            >
                                                <option value="wedding" className="bg-black text-white">Wedding (Luxury)</option>
                                                <option value="commercial" className="bg-black text-white">Commercial</option>
                                                <option value="tech" className="bg-black text-white">Tech</option>
                                                <option value="other" className="bg-black text-white">Other</option>
                                            </select>
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

                                        {/* SUBCATEGORIES CHIPS */}
                                        <div className="md:col-span-3 space-y-3 pt-4 border-t border-white/5">
                                            <label className="text-[9px] uppercase font-black text-[#c5a059] tracking-[0.2em]">List of Subcategories / Specializations</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(srv.subcategories || []).map((sub, subIdx) => (
                                                    <div key={subIdx} className="flex items-center gap-2 bg-[#c5a059]/10 border border-[#c5a059]/20 px-3 py-1.5 rounded-full">
                                                        <input
                                                            type="text"
                                                            value={sub}
                                                            onChange={(e) => {
                                                                const newList = [...content.services];
                                                                const newSubs = [...(newList[i].subcategories || [])];
                                                                newSubs[subIdx] = e.target.value;
                                                                newList[i] = { ...newList[i], subcategories: newSubs };
                                                                setContent(prev => ({ ...prev, services: newList }));
                                                            }}
                                                            className="bg-transparent text-[10px] font-black text-white outline-none min-w-[80px]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newList = [...content.services];
                                                                const newSubs = (newList[i].subcategories || []).filter((_, idx) => idx !== subIdx);
                                                                newList[i] = { ...newList[i], subcategories: newSubs };
                                                                setContent(prev => ({ ...prev, services: newList }));
                                                            }}
                                                            className="text-red-500 hover:text-red-400"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newList = [...content.services];
                                                        const newSubs = [...(newList[i].subcategories || []), "New Item"];
                                                        newList[i] = { ...newList[i], subcategories: newSubs };
                                                        setContent(prev => ({ ...prev, services: newList }));
                                                    }}
                                                    className="px-4 py-1.5 border border-dashed border-white/20 rounded-full text-[9px] font-black text-gray-500 hover:text-[#c5a059] transition-colors"
                                                >
                                                    + ADD SUB
                                                </button>
                                            </div>
                                        </div>
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
                    </div>
                )}

                {/* BRAND IDENTITY TAB */}
                {activeTab === "BRAND" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* EXPERTISE SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <a href="/#expertise" target="_blank" className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full hover:bg-[#c5a059] hover:text-black transition-all">VIEW ON WEBSITE</a>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">📸 Who We Are Section</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The "Expertise Focus" section with your photo and a list of your core values.</p>
                            </div>

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
                                <div className="space-y-4 md:col-span-2 relative">
                                    <ImageUploader
                                        currentImage={content.expertise.image}
                                        recommendedSize="Expertise Image - 800x1200 (vertical)"
                                        onUploadSuccess={(url) => updateSection("expertise", "image", url)}
                                    />
                                    {content.expertise.image && (
                                        <button type="button" onClick={() => updateSection("expertise", "image", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                                    )}
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

                        {/* STATS EDITOR */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">📊 Stats Counter</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Big numbers like "15+ Years" or "500+ Weddings".</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {content.stats.map((stat, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl space-y-4 relative group">
                                        {/* REORDER BUTTONS */}
                                        <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === 0) return;
                                                    const newList = [...content.stats];
                                                    [newList[i], newList[i - 1]] = [newList[i - 1], newList[i]];
                                                    setContent(prev => ({ ...prev, stats: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-1.5 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === content.stats.length - 1) return;
                                                    const newList = [...content.stats];
                                                    [newList[i], newList[i + 1]] = [newList[i + 1], newList[i]];
                                                    setContent(prev => ({ ...prev, stats: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-1.5 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setContent(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }))}
                                                className="bg-red-950/80 border border-red-500/20 p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-black text-gray-600">Value</label>
                                                <input
                                                    type="text"
                                                    value={stat.value || ""}
                                                    onChange={(e) => {
                                                        const newList = [...content.stats];
                                                        newList[i] = { ...newList[i], value: e.target.value };
                                                        setContent(prev => ({ ...prev, stats: newList }));
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-black text-gray-600">Suffix</label>
                                                <input
                                                    type="text"
                                                    value={stat.suffix || ""}
                                                    onChange={(e) => {
                                                        const newList = [...content.stats];
                                                        newList[i] = { ...newList[i], suffix: e.target.value };
                                                        setContent(prev => ({ ...prev, stats: newList }));
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-black text-gray-600">Label</label>
                                            <input
                                                type="text"
                                                value={stat.label || ""}
                                                onChange={(e) => {
                                                    const newList = [...content.stats];
                                                    newList[i] = { ...newList[i], label: e.target.value };
                                                    setContent(prev => ({ ...prev, stats: newList }));
                                                }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                            />
                                        </div>
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
                    </div>
                )}

                {/* SOCIAL PROOF TAB */}
                {activeTab === "SOCIAL" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* QUOTE SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059] mb-1">💬 Inspirational Quote Section</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The large quote with a background image that appears in the middle of the homepage.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Quote Text</label>
                                    <textarea
                                        value={content.quote.text || ""}
                                        onChange={(e) => updateSection("quote", "text", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-4 relative">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Background Image</label>
                                    <ImageUploader
                                        currentImage={content.quote.backgroundImage}
                                        recommendedSize="Quote Background - 1920x1080"
                                        onUploadSuccess={(url) => updateSection("quote", "backgroundImage", url)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* REVIEWS SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">⭐ Customer Reviews</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The review slider showing feedback from your clients.</p>
                            </div>

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

                            <div className="pt-10 border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Managed Testimonials</h4>
                                    {content.global?.google?.placeId && (
                                        <button 
                                            type="button"
                                            className="text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-[#c5a059] hover:text-black transition-all flex items-center gap-2"
                                            onClick={() => alert("Syncing latest Google Reviews... This feature requires a production Maps API Key.")}
                                        >
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                                            </svg>
                                            Sync Google Reviews
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {(content.reviews?.list || []).map((review, i) => (
                                        <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group space-y-6">
                                            {/* REORDER & DELETE */}
                                            <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (i === 0) return;
                                                        const newList = [...content.reviews.list];
                                                        [newList[i], newList[i - 1]] = [newList[i - 1], newList[i]];
                                                        updateSection("reviews", "list", newList);
                                                    }}
                                                    className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (i === content.reviews.list.length - 1) return;
                                                        const newList = [...content.reviews.list];
                                                        [newList[i], newList[i + 1]] = [newList[i + 1], newList[i]];
                                                        updateSection("reviews", "list", newList);
                                                    }}
                                                    className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newList = content.reviews.list.filter((_, idx) => idx !== i);
                                                        updateSection("reviews", "list", newList);
                                                    }}
                                                    className="bg-red-950/80 border border-red-500/20 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                <div className="md:col-span-8 space-y-4">
                                                    <textarea
                                                        value={review.text || ""}
                                                        onChange={(e) => {
                                                            const newList = [...content.reviews.list];
                                                            newList[i] = { ...newList[i], text: e.target.value };
                                                            updateSection("reviews", "list", newList);
                                                        }}
                                                        placeholder="Review content..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-medium min-h-[100px]"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase font-black text-gray-600 pl-1">Author Name</label>
                                                            <input
                                                                type="text"
                                                                value={review.author || ""}
                                                                onChange={(e) => {
                                                                    const newList = [...content.reviews.list];
                                                                    newList[i] = { ...newList[i], author: e.target.value, initial: e.target.value[0]?.toUpperCase() || "" };
                                                                    updateSection("reviews", "list", newList);
                                                                }}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase font-black text-gray-600 pl-1">Client Role / Event</label>
                                                            <input
                                                                type="text"
                                                                value={review.role || ""}
                                                                onChange={(e) => {
                                                                    const newList = [...content.reviews.list];
                                                                    newList[i] = { ...newList[i], role: e.target.value };
                                                                    updateSection("reviews", "list", newList);
                                                                }}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-4 space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] uppercase font-black text-gray-600 pl-1">Review Source</label>
                                                        <select
                                                            value={review.source || "Manual"}
                                                            onChange={(e) => {
                                                                const newList = [...content.reviews.list];
                                                                newList[i] = { ...newList[i], source: e.target.value };
                                                                updateSection("reviews", "list", newList);
                                                            }}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold appearance-none"
                                                        >
                                                            <option value="Manual">Manual Entry</option>
                                                            <option value="Google">Google Review</option>
                                                            <option value="Justdial">Justdial Review</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] uppercase font-black text-gray-600 pl-1">Rating (1-5)</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((num) => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newList = [...content.reviews.list];
                                                                        newList[i] = { ...newList[i], rating: num };
                                                                        updateSection("reviews", "list", newList);
                                                                    }}
                                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${review.rating >= num ? "bg-[#c5a059] text-black" : "bg-white/5 text-gray-600"}`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] uppercase font-black text-gray-600 pl-1">Source Link (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={review.sourceUrl || ""}
                                                            onChange={(e) => {
                                                                const newList = [...content.reviews.list];
                                                                newList[i] = { ...newList[i], sourceUrl: e.target.value };
                                                                updateSection("reviews", "list", newList);
                                                            }}
                                                            placeholder="Link to original review"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newList = [...(content.reviews?.list || []), { author: "New Client", role: "Event", text: "Great experience!", rating: 5, initial: "N", source: "Manual" }];
                                            updateSection("reviews", "list", newList);
                                        }}
                                        className="w-full py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] hover:border-[#c5a059]/30 transition-all"
                                    >
                                        + Add New Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PARTNERS / CLIENTS SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🤝 Partner Logos</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Brand logos of clients and partners you've worked with.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                                {(content.partners || []).map((partner, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-4 rounded-2xl relative group space-y-3">
                                        <div className="aspect-square bg-black rounded-xl overflow-hidden border border-white/5 relative">
                                            {partner.image ? (
                                                <img src={partner.image} className="w-full h-full object-contain p-4" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-gray-600">Logo</div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={partner.name || ""}
                                            onChange={(e) => {
                                                const newList = [...content.partners];
                                                newList[i] = { ...newList[i], name: e.target.value };
                                                setContent(prev => ({ ...prev, partners: newList }));
                                            }}
                                            placeholder="Company Name"
                                            className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#c5a059] text-center"
                                        />
                                        <div className="mt-2 text-center">
                                            {partner.image ? (
                                                <button type="button" onClick={() => {
                                                    const newList = [...content.partners];
                                                    newList[i] = { ...newList[i], image: "" };
                                                    setContent(prev => ({ ...prev, partners: newList }));
                                                }} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:text-white transition-colors">
                                                    REMOVE
                                                </button>
                                            ) : (
                                                <ImageUploader
                                                    onUploadSuccess={(url) => {
                                                        const newList = [...content.partners];
                                                        newList[i] = { ...newList[i], image: url };
                                                        setContent(prev => ({ ...prev, partners: newList }));
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newList = content.partners.filter((_, idx) => idx !== i);
                                                setContent(prev => ({ ...prev, partners: newList }));
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
                                        const newList = [...(content.partners || []), { name: "", image: "" }];
                                        setContent(prev => ({ ...prev, partners: newList }));
                                    }}
                                    className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-[#c5a059] aspect-square"
                                >
                                    + Add Client
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISUAL ARCHIVES TAB */}
                {activeTab === "GALLERY" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* MOTION ARCHIVE */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🎞️ Motion Archive Gallery</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The moving horizontal strip of photos on your homepage.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Display Title</label>
                                    <input
                                        type="text"
                                        value={content.motionArchive.title || ""}
                                        onChange={(e) => updateSection("motionArchive", "title", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Display Subtitle</label>
                                    <input
                                        type="text"
                                        value={content.motionArchive.subtitle || ""}
                                        onChange={(e) => updateSection("motionArchive", "subtitle", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2 pt-4 border-t border-white/5">
                                    <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-[0.2em] pl-1">🖼️ UPLOAD ARCHIVE FRAMES (1080x1080 Recommended)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {(content.motionArchive.images || []).map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5">
                                                <img src={img} className="w-full h-full object-cover" />

                                                {/* REORDER CONTROLS */}
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (i === 0) return;
                                                            const newImgs = [...content.motionArchive.images];
                                                            [newImgs[i], newImgs[i - 1]] = [newImgs[i - 1], newImgs[i]];
                                                            updateSection("motionArchive", "images", newImgs);
                                                        }}
                                                        className="p-1 hover:text-[#c5a059] text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImgs = content.motionArchive.images.filter((_, idx) => idx !== i);
                                                            updateSection("motionArchive", "images", newImgs);
                                                        }}
                                                        className="p-1 hover:text-red-500 text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (i === content.motionArchive.images.length - 1) return;
                                                            const newImgs = [...content.motionArchive.images];
                                                            [newImgs[i], newImgs[i + 1]] = [newImgs[i + 1], newImgs[i]];
                                                            updateSection("motionArchive", "images", newImgs);
                                                        }}
                                                        className="p-1 hover:text-[#c5a059] text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="aspect-square bg-white/5 border flex items-center justify-center border-dashed border-white/10 rounded-xl overflow-hidden p-2">
                                            <ImageUploader
                                                onUploadSuccess={(url) => {
                                                    const newImgs = [...(content.motionArchive.images || []), url];
                                                    updateSection("motionArchive", "images", newImgs);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VIDEO VAULT */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <a href="/#video-vault" target="_blank" className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full hover:bg-[#c5a059] hover:text-black transition-all">VIEW ON WEBSITE</a>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🎬 Video Showcase</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The grid where you show your best YouTube or Vimeo videos.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(content.videoVault || []).map((v, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group space-y-4">
                                        {/* REORDER BUTTONS */}
                                        <div className="absolute -top-3 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === 0) return;
                                                    const newList = [...content.videoVault];
                                                    [newList[i], newList[i - 1]] = [newList[i - 1], newList[i]];
                                                    setContent(prev => ({ ...prev, videoVault: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (i === content.videoVault.length - 1) return;
                                                    const newList = [...content.videoVault];
                                                    [newList[i], newList[i + 1]] = [newList[i + 1], newList[i]];
                                                    setContent(prev => ({ ...prev, videoVault: newList }));
                                                }}
                                                className="bg-black border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#c5a059]"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = content.videoVault.filter((_, idx) => idx !== i);
                                                    setContent(prev => ({ ...prev, videoVault: newList }));
                                                }}
                                                className="bg-red-950/80 border border-red-500/20 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
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
                                        <div className="pt-2">
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest pl-1 block mb-2">Video Thumbnail</label>
                                            {v.image ? (
                                                <div className="relative rounded-lg overflow-hidden border border-white/10 group aspect-video">
                                                    <img src={v.image} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => {
                                                        const newList = [...content.videoVault];
                                                        newList[i] = { ...newList[i], image: "" };
                                                        setContent(prev => ({ ...prev, videoVault: newList }));
                                                    }} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase text-white">
                                                        Remove Image
                                                    </button>
                                                </div>
                                            ) : (
                                                <ImageUploader
                                                    onUploadSuccess={(url) => {
                                                        const newList = [...content.videoVault];
                                                        newList[i] = { ...newList[i], image: url };
                                                        setContent(prev => ({ ...prev, videoVault: newList }));
                                                    }}
                                                />
                                            )}
                                        </div>
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

                        {/* MASTER GALLERY SECTION */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🖼️ Photo Gallery (3-Column)</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The vertical scrolling photo gallery with 3 columns.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">Gallery Images - <span className="text-gray-500">Minimum 6 images (800x1000 vertical recommended)</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {(content.splitGallery || []).map((img, i) => (
                                        <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden group border border-white/5">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newGal = content.splitGallery.filter((_, idx) => idx !== i);
                                                    setContent(prev => ({ ...prev, splitGallery: newGal }));
                                                }}
                                                className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="text-[10px] font-black uppercase text-white">Remove</span>
                                            </button>
                                        </div>
                                    ))}
                                    <div className="aspect-[4/5] bg-white/5 border w-full flex items-center justify-center border-dashed border-white/10 rounded-xl overflow-hidden p-2">
                                        <ImageUploader
                                            onUploadSuccess={(url) => {
                                                const newGal = [...(content.splitGallery || []), url];
                                                setContent(prev => ({ ...prev, splitGallery: newGal }));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

export default function HomeEditor() {
    return (
        <Suspense fallback={<div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading Editor...</div>}>
            <HomeEditorContent />
        </Suspense>
    );
}
