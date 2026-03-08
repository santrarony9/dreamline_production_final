"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function GalleryAdmin() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/content");
            setProjects(res.data.projects || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await axios.post("/api/content", { projects });
            setMessage("Gallery synchronized successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Error syncing gallery.");
        } finally {
            setSaving(false);
        }
    };

    const addProject = () => {
        setProjects([...projects, {
            title: "New Project",
            type: "commercial",
            img: "",
            videoUrl: "",
            hoverVideo: ""
        }]);
    };

    const updateProject = (index, field, value) => {
        const newProjects = [...projects];
        newProjects[index][field] = value;
        setProjects(newProjects);
    };

    const removeProject = (index) => {
        if (!confirm("Are you sure?")) return;
        setProjects(projects.filter((_, i) => i !== index));
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading production archives...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Portfolio</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Master <span className="text-gray-700">Gallery.</span></h1>
                </div>
                <button
                    onClick={addProject}
                    className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                >
                    + Add Project
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((proj, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/30 transition-all">
                        <div className="aspect-video relative bg-white/2 overflow-hidden">
                            {proj.img ? (
                                <img src={proj.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={proj.title} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-[10px] text-gray-700 uppercase font-black tracking-widest">No Visual Asset</div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <select
                                    value={proj.type}
                                    onChange={(e) => updateProject(i, "type", e.target.value)}
                                    className="bg-black/80 backdrop-blur-md text-[10px] font-black uppercase text-[#c5a059] px-3 py-1 rounded-full border border-white/10 outline-none cursor-pointer"
                                >
                                    <option value="commercial">Commercial</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="music">Music</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => updateProject(i, "title", e.target.value)}
                                placeholder="Project Title"
                                className="w-full bg-transparent text-xl font-black text-white outline-none focus:text-[#c5a059] transition-colors uppercase tracking-tight"
                            />

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="space-y-4">
                                    <ImageUploader
                                        currentImage={proj.img}
                                        recommendedSize="Thumbnail URL (Recommended: 1920x1080)"
                                        onUploadSuccess={(url) => updateProject(i, "img", url)}
                                    />
                                    {proj.img && (
                                        <button type="button" onClick={() => updateProject(i, "img", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest pl-1">Master Video (YouTube/Direct)</label>
                                    <input
                                        type="text"
                                        value={proj.videoUrl}
                                        onChange={(e) => updateProject(i, "videoUrl", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-[#c5a059] outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest pl-1">Hover Preview Video</label>
                                    <input
                                        type="text"
                                        value={proj.hoverVideo}
                                        onChange={(e) => updateProject(i, "hoverVideo", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-gray-500 outline-none"
                                        placeholder="Direct .mp4 link"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => removeProject(i)}
                                className="w-full py-3 bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all mt-4"
                            >
                                Delete Archive
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-12 md:right-12 md:left-auto md:translate-x-0 z-[100] flex items-center gap-4 md:gap-6 bg-black/80 backdrop-blur-xl border border-[#c5a059]/30 p-3 md:p-4 rounded-full shadow-2xl w-[90%] md:w-auto justify-center md:justify-start">
                {message && <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>{message}</p>}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {saving ? "Synchronizing..." : "Commit Gallery Changes"}
                </button>
            </div>
        </div>
    );
}
