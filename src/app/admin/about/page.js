"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

export default function AboutEditor() {
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
            const data = res.data.about || res.data || {};
            setContent({
                hero: data.hero || {},
                details: data.details || {},
                founder: data.founder || {},
                timeline: data.timeline || [],
                team: data.team || { members: [] },
                bts: data.bts || {},
                whyUs: data.whyUs || { points: [], processSteps: [] },
                productionServices: data.productionServices || []
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
            await axios.post("/api/content", { about: content });
            setMessage("About page content updated!");
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
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">About <span className="text-gray-700">Studio.</span></h1>
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

                {/* DETAILS SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Text 1</label>
                            <textarea
                                value={content.details.text1 || ""}
                                onChange={(e) => updateSection("details", "text1", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Text 2</label>
                            <textarea
                                value={content.details.text2 || ""}
                                onChange={(e) => updateSection("details", "text2", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                {/* FOUNDER SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Founder</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Name</label>
                            <input
                                type="text"
                                value={content.founder.name || ""}
                                onChange={(e) => updateSection("founder", "name", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Role</label>
                            <input
                                type="text"
                                value={content.founder.role || ""}
                                onChange={(e) => updateSection("founder", "role", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Note (Quote)</label>
                            <textarea
                                value={content.founder.note || ""}
                                onChange={(e) => updateSection("founder", "note", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Founder Portrait - <span className="text-[#c5a059]">800x1200 vertical recommended</span>
                                </label>
                                {content.founder.image && (
                                    <button type="button" onClick={() => updateSection("founder", "image", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.founder.image || ""}
                                onChange={(e) => updateSection("founder", "image", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste image URL"
                            />
                        </div>
                    </div>
                </div>

                {/* BTS SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Behind The Scenes Video</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Video Cover Image - <span className="text-[#c5a059]">1600x900 (16:9) recommended</span>
                                </label>
                                {content.bts.videoImage && (
                                    <button type="button" onClick={() => updateSection("bts", "videoImage", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.bts.videoImage || ""}
                                onChange={(e) => updateSection("bts", "videoImage", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste image URL"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    BTS Video URL (YouTube/MP4)
                                </label>
                                {content.bts.videoUrl && (
                                    <button type="button" onClick={() => updateSection("bts", "videoUrl", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Clear</button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={content.bts.videoUrl || ""}
                                onChange={(e) => updateSection("bts", "videoUrl", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                placeholder="Paste video URL"
                            />
                        </div>
                    </div>
                </div>

                {/* TIMELINE SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">Studio Timeline</h3>
                    <div className="space-y-4">
                        {(content.timeline || []).map((t, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl relative group grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={t.year || ""}
                                    onChange={(e) => {
                                        const newList = [...content.timeline];
                                        newList[i] = { ...newList[i], year: e.target.value };
                                        setContent(prev => ({ ...prev, timeline: newList }));
                                    }}
                                    placeholder="Year (e.g. 2010)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[#c5a059] text-xs font-black"
                                />
                                <input
                                    type="text"
                                    value={t.title || ""}
                                    onChange={(e) => {
                                        const newList = [...content.timeline];
                                        newList[i] = { ...newList[i], title: e.target.value };
                                        setContent(prev => ({ ...prev, timeline: newList }));
                                    }}
                                    placeholder="Milestone Title"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                />
                                <textarea
                                    value={t.description || ""}
                                    onChange={(e) => {
                                        const newList = [...content.timeline];
                                        newList[i] = { ...newList[i], description: e.target.value };
                                        setContent(prev => ({ ...prev, timeline: newList }));
                                    }}
                                    placeholder="Milestone Event Description"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold md:col-span-2 min-h-[80px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newList = content.timeline.filter((_, idx) => idx !== i);
                                        setContent(prev => ({ ...prev, timeline: newList }));
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
                                const newList = [...(content.timeline || []), { year: "", title: "", description: "" }];
                                setContent(prev => ({ ...prev, timeline: newList }));
                            }}
                            className="w-full py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] transition-all"
                        >
                            + Add Timeline Milestone
                        </button>
                    </div>
                </div>

                {/* TEAM SECTION */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] border-b border-white/5 pb-4">The Creators (Team)</h3>
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">Team Members - <span className="text-gray-500">800x1000 vertical recommended</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(content.team.members || []).map((m, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative group space-y-4">
                                    <div className="aspect-[4/5] bg-black rounded-lg overflow-hidden border border-white/5 relative">
                                        {m.image ? (
                                            <img src={m.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-gray-600">No Image</div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={m.name || ""}
                                        onChange={(e) => {
                                            const newList = [...content.team.members];
                                            newList[i] = { ...newList[i], name: e.target.value };
                                            updateSection("team", "members", newList);
                                        }}
                                        placeholder="Name"
                                        className="w-full bg-transparent border-b border-white/10 pb-2 text-white text-sm font-bold outline-none focus:border-[#c5a059]"
                                    />
                                    <input
                                        type="text"
                                        value={m.role || ""}
                                        onChange={(e) => {
                                            const newList = [...content.team.members];
                                            newList[i] = { ...newList[i], role: e.target.value };
                                            updateSection("team", "members", newList);
                                        }}
                                        placeholder="Role / Title"
                                        className="w-full bg-transparent border-b border-white/10 pb-2 text-[#c5a059] text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#c5a059]"
                                    />
                                    <input
                                        type="text"
                                        value={m.image || ""}
                                        onChange={(e) => {
                                            const newList = [...content.team.members];
                                            newList[i] = { ...newList[i], image: e.target.value };
                                            updateSection("team", "members", newList);
                                        }}
                                        placeholder="Image URL"
                                        className="w-full bg-white/5 rounded p-2 text-gray-400 text-[10px] font-bold outline-none focus:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newList = content.team.members.filter((_, idx) => idx !== i);
                                            updateSection("team", "members", newList);
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
                                    const newList = [...(content.team.members || []), { name: "", role: "", image: "" }];
                                    updateSection("team", "members", newList);
                                }}
                                className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#c5a059] min-h-[300px]"
                            >
                                + Add Member
                            </button>
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
                        {saving ? "Deploying..." : "Sync About Page"}
                    </button>
                </div>
            </form>
        </div>
    );
}
