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
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isCompact, setIsCompact] = useState(false);

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
            console.error("Gallery Sync Error:", err.response?.data || err.message);
            setMessage(err.response?.data?.error || "Error syncing gallery.");
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

    // Drag and Drop sorting logic
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); // Required to allow drop
        if (draggedIndex === index) return;
        setDragOverIndex(index);

        // Smart edge auto-scroll for laptop/small screen dragging
        const scrollThreshold = 120;
        const scrollSpeed = 12;
        if (e.clientY < scrollThreshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (e.clientY > window.innerHeight - scrollThreshold) {
            window.scrollBy(0, scrollSpeed);
        }
    };

    const handleDragLeave = (index) => {
        if (dragOverIndex === index) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        
        const sourceIndex = draggedIndex;
        
        // Reset states immediately to prevent style residue
        setDraggedIndex(null);
        setDragOverIndex(null);
        
        if (sourceIndex === targetIndex) return;

        const newProjects = [...projects];
        const draggedItem = newProjects[sourceIndex];
        
        // Remove from source position
        newProjects.splice(sourceIndex, 1);
        // Insert at target position
        newProjects.splice(targetIndex, 0, draggedItem);
        
        setProjects(newProjects);
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading production archives...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Portfolio</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Master <span className="text-gray-700">Gallery.</span></h1>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Hold and drag thumbnails to rearrange. Toggle Compact Mode to view all cards without scrolling.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* View Mode Toggle Switch */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                        <button 
                            onClick={() => setIsCompact(false)}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!isCompact ? "bg-[#c5a059] text-black shadow-md" : "text-gray-400 hover:text-white"}`}
                        >
                            Detailed View
                        </button>
                        <button 
                            onClick={() => setIsCompact(true)}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isCompact ? "bg-[#c5a059] text-black shadow-md" : "text-gray-400 hover:text-white"}`}
                        >
                            Compact Reorder Mode
                        </button>
                    </div>

                    <button
                        onClick={addProject}
                        className="bg-[#c5a059] text-black px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10 active:scale-95"
                    >
                        + Add Project
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((proj, i) => {
                    const isDragging = draggedIndex === i;
                    const isOver = dragOverIndex === i;
                    
                    if (isCompact) {
                        return (
                            <div 
                                key={i} 
                                className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden group transition-all duration-300 relative ${
                                    isDragging 
                                        ? "opacity-20 scale-[0.97] border-white/5 shadow-inner" 
                                        : isOver 
                                            ? "border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.25)] scale-[1.02] z-20" 
                                            : "border-white/5 hover:border-[#c5a059]/30"
                                }`}
                            >
                                <div 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, i)}
                                    onDragOver={(e) => handleDragOver(e, i)}
                                    onDragLeave={() => handleDragLeave(i)}
                                    onDrop={(e) => handleDrop(e, i)}
                                    onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                                    className="aspect-video relative bg-white/2 overflow-hidden select-none cursor-grab active:cursor-grabbing z-10"
                                >
                                    {/* Drag / Drop Indicator Overlay */}
                                    {isOver ? (
                                        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c5a059] transition-all">
                                            <span className="text-xl font-black text-[#c5a059]">➔</span>
                                            <span className="text-[8px] tracking-[0.2em] font-black uppercase text-[#c5a059]">Drop Here</span>
                                        </div>
                                    ) : (
                                        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md text-[8px] font-black uppercase text-white/50 group-hover:text-[#c5a059] px-2.5 py-1 rounded-full border border-white/10 transition-colors pointer-events-none">
                                            <span>⋮⋮</span>
                                            <span className="text-[7px] tracking-widest font-black">Hold & Drag</span>
                                        </div>
                                    )}

                                    {proj.img ? (
                                        <img 
                                            src={proj.img} 
                                            draggable="false" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none" 
                                            alt={proj.title} 
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[9px] text-gray-700 uppercase font-black tracking-widest select-none pointer-events-none">No Visual Asset</div>
                                    )}
                                    
                                    <div className="absolute top-3 right-3 flex gap-1 z-30" onClick={(e) => e.stopPropagation()}>
                                        <span className="bg-black/80 backdrop-blur-md text-[8px] font-black uppercase text-[#c5a059] px-2.5 py-1 rounded-full border border-white/10">
                                            {proj.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5">
                                    <h3 className="text-xs font-black text-white uppercase truncate tracking-wider">{proj.title || "Untitled Project"}</h3>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={i} 
                            className={`bg-[#0a0a0a] border rounded-3xl overflow-hidden group transition-all duration-300 relative ${
                                isDragging 
                                    ? "opacity-20 scale-[0.97] border-white/5 shadow-inner" 
                                    : isOver 
                                        ? "border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.25)] scale-[1.02] z-20" 
                                        : "border-white/5 hover:border-[#c5a059]/30"
                            }`}
                        >
                            <div 
                                draggable
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDragOver={(e) => handleDragOver(e, i)}
                                onDragLeave={() => handleDragLeave(i)}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                                className="aspect-video relative bg-white/2 overflow-hidden select-none cursor-grab active:cursor-grabbing z-10"
                            >
                                {/* Drag / Drop Indicator Overlay */}
                                {isOver ? (
                                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c5a059] transition-all">
                                        <span className="text-2xl font-black text-[#c5a059]">➔</span>
                                        <span className="text-[10px] tracking-[0.2em] font-black uppercase text-[#c5a059]">Drop to Insert Here</span>
                                    </div>
                                ) : (
                                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-white/50 group-hover:text-[#c5a059] px-3 py-1.5 rounded-full border border-white/10 transition-colors pointer-events-none">
                                        <span>⋮⋮</span>
                                        <span className="text-[8px] tracking-widest font-black">Hold & Drag</span>
                                    </div>
                                )}

                                {proj.img ? (
                                    <img 
                                        src={proj.img} 
                                        draggable="false" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none" 
                                        alt={proj.title} 
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] text-gray-700 uppercase font-black tracking-widest select-none pointer-events-none">No Visual Asset</div>
                                )}
                                
                                <div className="absolute top-4 right-4 flex gap-2 z-30" onClick={(e) => e.stopPropagation()}>
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
                                        <ImageUploader
                                            currentImage={proj.hoverVideo}
                                            recommendedSize="Hover Preview Video (Direct .mp4)"
                                            onUploadSuccess={(url) => updateProject(i, "hoverVideo", url)}
                                        />
                                        {proj.hoverVideo && (
                                            <button type="button" onClick={() => updateProject(i, "hoverVideo", "")} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors mt-2">Clear Asset</button>
                                        )}
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
                    );
                })}
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
