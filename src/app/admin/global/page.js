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
        e.preventDefault();
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
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Global <span className="text-gray-700">Settings.</span></h1>
            </header>

            <form onSubmit={handleSave} className="space-y-8 bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                {/* Contact info */}
                <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Communication</h3>
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
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Social Ecosystem</h3>
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
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">SEO Architecture</h3>
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

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    {message && <p className={`text-[10px] font-black uppercase tracking-widest text-center md:text-left ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>{message}</p>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Encrypting Data..." : "Deploy Config"}
                    </button>
                </div>
            </form>
        </div>
    );
}
