"use client";
import { useState, useEffect } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ServicesAdmin() {
    const [activeTab, setActiveTab] = useState("MANAGE_CATEGORIES");
    
    // BUILD PAGES STATE
    const [services, setServices] = useState([]);
    const [servicePages, setServicePages] = useState([]);
    const [selectedSlug, setSelectedSlug] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        heroImage: "",
        gallery: [],
        videos: []
    });

    // MANAGE CATEGORIES STATE
    const [content, setContent] = useState(null);
    const [savingCategories, setSavingCategories] = useState(false);

    const [loading, setLoading] = useState(true);

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch content for managing categories
            const contentRes = await axios.get("/api/content");
            const rawData = contentRes.data || {};
            const data = rawData.home || {};
            const fetchedContent = {
                services: data.services?.length > 0 ? data.services : [
                    { number: "01", category: "wedding", title: "LUXURY WEDDINGS", priceHint: "Premium Packages Start at ₹85,000", subcategories: [] },
                    { number: "02", category: "commercial", title: "COMMERCIAL ADS", priceHint: "Full Production & Scripting", subcategories: [] },
                    { number: "03", category: "tech", title: "TECH", priceHint: "Web & Digital Solutions", subcategories: [] }
                ]
            };
            setContent(fetchedContent);

            // Populate subcategories for Build Pages sidebar
            const allSubcats = [];
            fetchedContent.services.forEach(s => {
                (s.subcategories || []).forEach(sub => {
                    if (!allSubcats.find(x => x.name === sub)) {
                        allSubcats.push({ name: sub, slug: slugify(sub) });
                    }
                });
            });
            setServices(allSubcats);

            // Fetch existing service pages
            const pagesRes = await fetch("/api/service-pages");
            const pagesData = await pagesRes.json();
            setServicePages(pagesData || []);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // BUILD PAGES HANDLERS
    const handleSelectPage = async (slug) => {
        setSelectedSlug(slug);
        const existing = servicePages.find(p => p.slug === slug);
        if (existing) {
            setFormData(existing);
        } else {
            const serviceName = services.find(s => s.slug === slug)?.name || "";
            setFormData({
                slug,
                title: serviceName,
                subtitle: "Premium Service",
                description: "",
                heroImage: "",
                gallery: [],
                videos: []
            });
        }
    };

    const handleSavePage = async () => {
        try {
            const res = await fetch("/api/service-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Service page updated successfully!");
                // Refresh list
                const pagesRes = await fetch("/api/service-pages");
                const pagesData = await pagesRes.json();
                setServicePages(pagesData);
            }
        } catch (err) {
            alert("Error saving page: " + err.message);
        }
    };

    // CATEGORY HANDLERS
    const handleSaveCategories = async (e) => {
        if(e) e.preventDefault();
        setSavingCategories(true);
        try {
            await axios.post("/api/content", content);
            alert("Categories updated successfully!");
            // Refresh sidebar data
            fetchData();
        } catch (err) {
            alert("Error saving categories.");
        } finally {
            setSavingCategories(false);
        }
    };

    if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-black min-h-screen text-white p-8 md:p-16">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#c5a059]">Services & Categories</h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Manage your service buckets and build individual pages.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
                        <button
                            onClick={() => setActiveTab("MANAGE_CATEGORIES")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "MANAGE_CATEGORIES"
                                ? "bg-[#c5a059] text-black shadow-lg"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span>🗂️</span> Manage Categories
                        </button>
                        <button
                            onClick={() => setActiveTab("BUILD_PAGES")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "BUILD_PAGES"
                                ? "bg-[#c5a059] text-black shadow-lg"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span>🛠️</span> Build Pages
                        </button>
                    </div>
                </header>

                {activeTab === "MANAGE_CATEGORIES" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSaveCategories} className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🗂️ Service Categories & Subcategories</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">The main groupings of your work (Wedding, Commercial, Tech) and their subcategories.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {(content.services || []).map((srv, i) => (
                                    <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl relative group grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <div className="flex justify-end pt-6 border-t border-white/5">
                                <button 
                                    type="submit"
                                    disabled={savingCategories}
                                    className="bg-[#c5a059] text-black font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95 transition-all text-xs disabled:opacity-50"
                                >
                                    {savingCategories ? "Saving..." : "Save Categories"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "BUILD_PAGES" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                        {/* SIDEBAR: Subcategories List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Select Subcategory</h2>
                            {services.length === 0 && (
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest italic border border-white/5 p-4 rounded-xl">No subcategories found. Add them in the Manage Categories tab first.</p>
                            )}
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {services.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectPage(s.slug)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                            selectedSlug === s.slug 
                                            ? "bg-[#c5a059] border-[#c5a059] text-black" 
                                            : "bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                                        }`}
                                    >
                                        <p className="text-xs font-black uppercase tracking-tight">{s.name}</p>
                                        <p className={`text-[8px] uppercase font-bold tracking-widest mt-1 ${selectedSlug === s.slug ? "text-black/60" : "text-gray-600"}`}>
                                            {servicePages.find(p => p.slug === s.slug) ? "✅ Configured" : "⭕ Not Started"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MAIN FORM */}
                        <div className="lg:col-span-3">
                            {!selectedSlug ? (
                                <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
                                    <div>
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Select a subcategory from the left to start building its page.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* BASIC INFO */}
                                    <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Main Details</h3>
                                            <span className="text-[9px] bg-white/5 px-3 py-1 rounded-full text-gray-500">SLUG: {selectedSlug}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Page Title</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.title} 
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-[#c5a059] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Subtitle / Category</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.subtitle} 
                                                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-[#c5a059] outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Description (Storytelling)</label>
                                            <textarea 
                                                rows={4}
                                                value={formData.description} 
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-medium focus:border-[#c5a059] outline-none leading-relaxed"
                                                placeholder="Write a compelling description for this service..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Hero Banner Image</label>
                                            <ImageUploader 
                                                currentImage={formData.heroImage}
                                                recommendedSize="Hero - 1920x800"
                                                onUploadSuccess={(url) => setFormData({...formData, heroImage: url})}
                                            />
                                        </div>
                                    </div>

                                    {/* VIDEOS SECTION */}
                                    <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-8">
                                        <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Video Showcase (YouTube/S3)</h3>
                                        <div className="space-y-4">
                                            {formData.videos.map((vid, idx) => (
                                                <div key={idx} className="bg-black border border-white/5 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                                    <button onClick={() => setFormData({...formData, videos: formData.videos.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-500 hover:text-white transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] uppercase font-black text-gray-600 tracking-widest">Video Title</label>
                                                        <input 
                                                            type="text" 
                                                            value={vid.title} 
                                                            onChange={(e) => {
                                                                const newVids = [...formData.videos];
                                                                newVids[idx].title = e.target.value;
                                                                setFormData({...formData, videos: newVids});
                                                            }}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] uppercase font-black text-gray-600 tracking-widest">Video URL (YouTube Embed or MP4)</label>
                                                        <input 
                                                            type="text" 
                                                            value={vid.url} 
                                                            onChange={(e) => {
                                                                const newVids = [...formData.videos];
                                                                newVids[idx].url = e.target.value;
                                                                setFormData({...formData, videos: newVids});
                                                            }}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setFormData({...formData, videos: [...formData.videos, {title: "", url: ""}]})}
                                                className="w-full border border-dashed border-white/10 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-[#c5a059] transition-all"
                                            >
                                                + Add Video
                                            </button>
                                        </div>
                                    </div>

                                    {/* GALLERY SECTION */}
                                    <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-8">
                                        <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Photo Gallery</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {formData.gallery.map((img, idx) => (
                                                <div key={idx} className="bg-black border border-white/5 p-4 rounded-2xl space-y-3 relative group">
                                                    <button onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                    <div className="aspect-square bg-white/5 rounded-xl overflow-hidden relative border border-white/5">
                                                        <ImageUploader 
                                                            currentImage={img.url}
                                                            onUploadSuccess={(url) => {
                                                                const newG = [...formData.gallery];
                                                                newG[idx].url = url;
                                                                setFormData({...formData, gallery: newG});
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setFormData({...formData, gallery: [...formData.gallery, {url: "", caption: ""}]})}
                                                className="aspect-square flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-[#c5a059] transition-all"
                                            >
                                                <span className="text-xl mb-2">+</span> Add Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* SAVE & DELETE ACTIONS */}
                                    <div className="fixed bottom-10 right-10 z-[100] flex gap-4">
                                        {servicePages.find(p => p.slug === selectedSlug) && (
                                            <button 
                                                onClick={async () => {
                                                    if (confirm("Are you sure you want to delete this page configuration? This will NOT remove the category from the homepage, only the media/content on this sub-page.")) {
                                                        try {
                                                            const res = await fetch(`/api/service-pages?slug=${selectedSlug}`, { method: "DELETE" });
                                                            if (res.ok) {
                                                                alert("Page config deleted.");
                                                                window.location.reload();
                                                            }
                                                        } catch (err) { alert(err.message); }
                                                    }
                                                }}
                                                className="bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest px-8 py-5 rounded-full hover:bg-red-500 hover:text-white transition-all text-[9px]"
                                            >
                                                Delete Page Config
                                            </button>
                                        )}
                                        <button 
                                            onClick={handleSavePage}
                                            className="bg-[#c5a059] text-black font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95 transition-all text-xs"
                                        >
                                            Publish Page
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

