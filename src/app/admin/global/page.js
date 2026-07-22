"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function GlobalSettings() {
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
            setContent(res.data.global || {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await axios.post("/api/content", { global: content });
            setMessage("Global settings saved successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const updateNested = (category, field, value) => {
        setContent(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading secure config...</div>;

    return (
        <div className="space-y-12 max-w-5xl">
            <header>
                <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Configuration</h2>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Global <span className="text-gray-500">Settings.</span></h1>
            </header>

            <form onSubmit={handleSave} className="space-y-8 bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                {/* Contact info */}
                <section className="space-y-6">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">📞 Contact Information</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Your studio's email, phone, and physical address shown on the Contact page.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Display Email</label>
                            <input
                                type="email"
                                value={content.contact?.email || ""}
                                onChange={(e) => updateNested("contact", "email", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Primary Phone</label>
                            <input
                                type="text"
                                value={content.contact?.phone || ""}
                                onChange={(e) => updateNested("contact", "phone", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Studio Address</label>
                            <input
                                type="text"
                                value={content.contact?.address || ""}
                                onChange={(e) => updateNested("contact", "address", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Social Links */}
                <section className="space-y-6 pt-4">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🌐 Social Media Links</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Links to your Instagram, Facebook, and YouTube profiles.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Instagram URL</label>
                            <input
                                type="text"
                                value={content.social?.instagram || ""}
                                onChange={(e) => updateNested("social", "instagram", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Facebook URL</label>
                            <input
                                type="text"
                                value={content.social?.facebook || ""}
                                onChange={(e) => updateNested("social", "facebook", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">YouTube Channel</label>
                            <input
                                type="text"
                                value={content.social?.youtube || ""}
                                onChange={(e) => updateNested("social", "youtube", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* SEO Metadata */}
                <section className="space-y-6 pt-4">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">🔍 Search Engine Optimization (SEO)</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Set how your website appears on Google and when sharing links on social media.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Meta Title Template</label>
                            <input
                                type="text"
                                value={content.seo?.title || ""}
                                onChange={(e) => updateNested("seo", "title", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Meta Description</label>
                            <textarea
                                value={content.seo?.description || ""}
                                onChange={(e) => updateNested("seo", "description", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Keywords (comma separated)</label>
                            <input
                                type="text"
                                value={content.seo?.keywords || ""}
                                onChange={(e) => updateNested("seo", "keywords", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">OG Image (Social Sharing - 1200x630)</label>
                            <div className="relative">
                                <ImageUploader
                                    currentImage={content.seo?.ogImage || ""}
                                    recommendedSize="1200x630 pixels recommended for high-quality social previews."
                                    onUploadSuccess={(url) => updateNested("seo", "ogImage", url)}
                                />
                                {content.seo?.ogImage && (
                                    <button type="button" onClick={() => updateNested("seo", "ogImage", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors mt-2">Clear Asset</button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Global Favicon (Wait for deploy)</label>
                            <div className="relative">
                                <ImageUploader
                                    currentImage={content.seo?.favicon || "/favicon.ico"}
                                    recommendedSize="Square transparent PNG or ICO recommended (e.g., 32x32 or 512x512)"
                                    onUploadSuccess={(url) => updateNested("seo", "favicon", url)}
                                />
                                {content.seo?.favicon && (
                                    <button type="button" onClick={() => updateNested("seo", "favicon", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors mt-2">Clear Asset</button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Google Suite Integration */}
                <section className="space-y-6 pt-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">📍 Google Suite Connectivity</h3>
                            <span className="text-[8px] bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded font-black tracking-widest uppercase">PRO Integration</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Connect your Google Business Profile (Reviews & Maps) and track visitors with Google Analytics.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center pr-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Place ID (Business Profile)</label>
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        if (!content.google?.placeId || !content.google?.mapsApiKey) {
                                            alert("Please enter and SAVE your Place ID and Maps API Key first.");
                                            return;
                                        }
                                        if (!confirm("This will replace all current website reviews with the latest ones from Google. Continue?")) return;
                                        
                                        setSaving(true);
                                        try {
                                            const res = await axios.post("/api/admin/sync-reviews");
                                            alert(`Successfully synced ${res.data.count} reviews from Google!`);
                                            window.location.reload();
                                        } catch (err) {
                                            alert(err.response?.data?.error || "Failed to sync reviews.");
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="text-[9px] font-black uppercase text-[#c5a059] hover:text-white transition-colors"
                                >
                                    🔄 Sync Real Reviews
                                </button>
                            </div>
                            <input
                                type="text"
                                value={content.google?.placeId || ""}
                                onChange={(e) => updateNested("google", "placeId", e.target.value)}
                                placeholder="e.g. ChIJO-CgXpZ-AjoRvR3PqL2R0v4"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                            <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Used to sync your Google Reviews & Maps location.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Analytics ID (GA4)</label>
                            <input
                                type="text"
                                value={content.google?.analyticsId || ""}
                                onChange={(e) => updateNested("google", "analyticsId", e.target.value)}
                                placeholder="e.g. G-XXXXXXXXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                            <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Connects your site to Google Analytics 4 tracking.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Maps Javascript API Key</label>
                            <input
                                type="password"
                                value={content.google?.mapsApiKey || ""}
                                onChange={(e) => updateNested("google", "mapsApiKey", e.target.value)}
                                placeholder="Enter Google Cloud API Key"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Search Console Tag</label>
                            <input
                                type="password"
                                value={content.google?.searchConsoleId || ""}
                                onChange={(e) => updateNested("google", "searchConsoleId", e.target.value)}
                                placeholder="Verification Content ID"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Client ID (Business Sync)</label>
                            <input
                                type="password"
                                value={content.google?.clientId || ""}
                                onChange={(e) => updateNested("google", "clientId", e.target.value)}
                                placeholder="OAuth Client ID from Google Cloud Console"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Client Secret</label>
                            <input
                                type="password"
                                value={content.google?.clientSecret || ""}
                                onChange={(e) => updateNested("google", "clientSecret", e.target.value)}
                                placeholder="OAuth Client Secret"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Ads Conversion ID</label>
                            <input
                                type="password"
                                value={content.google?.adsConversionId || ""}
                                onChange={(e) => updateNested("google", "adsConversionId", e.target.value)}
                                placeholder="e.g. AW-123456789"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Google Ads Conversion Label</label>
                            <input
                                type="password"
                                value={content.google?.adsConversionLabel || ""}
                                onChange={(e) => updateNested("google", "adsConversionLabel", e.target.value)}
                                placeholder="e.g. AbC-dEfGhIjKlMnOpQr"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>
                    </div>
                </section>

            </form>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-12 md:right-12 md:left-auto md:translate-x-0 z-[100] flex items-center gap-4 md:gap-6 bg-black/80 backdrop-blur-xl border border-[#c5a059]/30 p-3 md:p-4 rounded-full shadow-2xl w-[90%] md:w-auto justify-center md:justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                {message && <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>{message}</p>}
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {saving ? "Deploying Config..." : "Deploy Config"}
                </button>
            </div>
        </div>
    );
}

