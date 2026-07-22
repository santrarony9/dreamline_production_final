"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function SEOAdmin() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("global");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await axios.get("/api/content");
            setContent({
                global: res.data.global || {},
                home: res.data.home || {},
                about: res.data.about || {},
                luxury: res.data.luxury || {},
                commercial: res.data.commercial || {}
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await axios.post("/api/content", {
                global: content.global,
                home: content.home,
                about: content.about,
                luxury: content.luxury,
                commercial: content.commercial
            });
            alert("SEO Metadata successfully synced to database!");
        } catch (err) {
            alert("Error saving metadata.");
        } finally {
            setSaving(false);
        }
    };

    const updateSEO = (page, field, value) => {
        setContent(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                seo: {
                    ...(prev[page]?.seo || {}),
                    [field]: value
                }
            }
        }));
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading SEO Matrix...</div>;

    const tabs = [
        { id: "global", label: "Global (Fallback)" },
        { id: "home", label: "Home Page" },
        { id: "about", label: "About Page" },
        { id: "luxury", label: "Weddings (Luxury)" },
        { id: "commercial", label: "Commercial" }
    ];

    const currentSeo = content[activeTab]?.seo || {};

    return (
        <div className="space-y-12 max-w-5xl pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Search Engine</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">SEO <span className="text-gray-500">Hub.</span></h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                >
                    {saving ? "Syncing..." : "💾 Save Changes"}
                </button>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                            activeTab === tab.id
                                ? "bg-[#c5a059] text-black"
                                : "bg-white/5 text-gray-500 hover:text-white"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Active Tab Form */}
            <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                        {tabs.find(t => t.id === activeTab).label} Metadata
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        {activeTab === "global" 
                            ? "These are the fallback settings used if a specific page doesn't have its own metadata defined."
                            : "Specific metadata for this page. This overrides the global fallback."}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Meta Title</label>
                            <span className="text-[10px] font-mono text-gray-600">{currentSeo.title?.length || 0}/60 char</span>
                        </div>
                        <input
                            type="text"
                            value={currentSeo.title || ""}
                            onChange={(e) => updateSEO(activeTab, "title", e.target.value)}
                            placeholder={`e.g. Dreamline Production | ${activeTab === 'global' ? 'Kolkata' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Meta Description</label>
                            <span className="text-[10px] font-mono text-gray-600">{currentSeo.description?.length || 0}/160 char</span>
                        </div>
                        <textarea
                            value={currentSeo.description || ""}
                            onChange={(e) => updateSEO(activeTab, "description", e.target.value)}
                            placeholder="Enter a compelling description that encourages clicks from search engines..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold h-24"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Keywords (Comma Separated)</label>
                        <input
                            type="text"
                            value={currentSeo.keywords || ""}
                            onChange={(e) => updateSEO(activeTab, "keywords", e.target.value)}
                            placeholder="e.g. best photographer, wedding film, kolkata"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Open Graph Image (Social Sharing Thumbnail)</label>
                        <div className="relative">
                            <ImageUploader
                                currentImage={currentSeo.ogImage || ""}
                                recommendedSize="1200x630 pixels. Shown when link is shared on WhatsApp/Facebook."
                                onUploadSuccess={(url) => updateSEO(activeTab, "ogImage", url)}
                            />
                            {currentSeo.ogImage && (
                                <button type="button" onClick={() => updateSEO(activeTab, "ogImage", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors mt-2">Remove OG Image</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

