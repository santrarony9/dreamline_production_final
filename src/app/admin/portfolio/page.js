"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

export default function PortfolioAdmin() {
    const [activeTab, setActiveTab] = useState("ALL"); // ALL | WEDDING | COMMERCIAL | TECH
    const [weddings, setWeddings] = useState([]);
    const [commercials, setCommercials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState({ message: "", type: "success" });

    // Add / Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [projectForm, setProjectForm] = useState({
        title: "",
        category: "commercial",
        coverImage: "",
        videoUrl: "",
        description: "",
        client: "",
        venue: "",
        order: 1,
        featured: false,
        isPublished: true
    });

    useEffect(() => {
        fetchPortfolioData();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4000);
    };

    const fetchPortfolioData = async () => {
        setLoading(true);
        try {
            const [weddingsRes, contentRes] = await Promise.all([
                axios.get("/api/weddings"),
                axios.get("/api/content")
            ]);

            setWeddings(Array.isArray(weddingsRes.data) ? weddingsRes.data : []);
            
            const siteContent = contentRes.data || {};
            const commProjects = (siteContent.projects || [])
                .filter(p => p.type === "commercial" || p.category === "commercial")
                .map(p => ({
                    ...p,
                    id: p._id || p.id || Math.random().toString(),
                    type: "commercial"
                }));
            setCommercials(commProjects);
        } catch (err) {
            console.error("Error loading portfolio:", err);
            showToast("Failed to load portfolio items", "error");
        } finally {
            setLoading(false);
        }
    };

    // Aggregate all projects for display
    const allProjects = [
        ...weddings.map(w => ({
            id: w._id || w.id,
            rawId: w._id,
            slug: w.id,
            title: w.title,
            category: "wedding",
            coverImage: w.coverImage || w.bannerImage || "",
            videoUrl: w.videoUrl || "",
            description: w.excerpt || w.description || "",
            client: w.couple || "",
            venue: w.venue || "",
            order: w.order || 0,
            featured: Boolean(w.featured),
            isPublished: w.status !== "draft",
            source: "wedding"
        })),
        ...commercials.map(c => ({
            id: c.id,
            rawId: c.id,
            slug: c.slug || c.id,
            title: c.title,
            category: "commercial",
            coverImage: c.coverImage || c.image || "",
            videoUrl: c.videoUrl || "",
            description: c.description || "",
            client: c.client || "",
            venue: c.location || "",
            order: c.order || 0,
            featured: Boolean(c.featured),
            isPublished: c.isPublished !== false,
            source: "commercial"
        }))
    ];

    const filteredProjects = allProjects.filter(p => {
        const matchesCategory = activeTab === "ALL" || p.category.toUpperCase() === activeTab;
        const matchesSearch = !search.trim() || 
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.client?.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleOpenAddModal = () => {
        setEditingProject(null);
        setProjectForm({
            title: "",
            category: "commercial",
            coverImage: "",
            videoUrl: "",
            description: "",
            client: "",
            venue: "",
            order: allProjects.length + 1,
            featured: false,
            isPublished: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (proj) => {
        setEditingProject(proj);
        setProjectForm({
            title: proj.title || "",
            category: proj.category || "commercial",
            coverImage: proj.coverImage || "",
            videoUrl: proj.videoUrl || "",
            description: proj.description || "",
            client: proj.client || "",
            venue: proj.venue || "",
            order: proj.order || 1,
            featured: Boolean(proj.featured),
            isPublished: Boolean(proj.isPublished)
        });
        setIsModalOpen(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        if (!projectForm.title) return showToast("Project title is required", "error");

        setIsSaving(true);
        try {
            if (projectForm.category === "wedding") {
                // Wedding Project
                const payload = {
                    title: projectForm.title,
                    coverImage: projectForm.coverImage,
                    videoUrl: projectForm.videoUrl,
                    excerpt: projectForm.description,
                    couple: projectForm.client,
                    venue: projectForm.venue,
                    order: Number(projectForm.order) || 0,
                    featured: Boolean(projectForm.featured),
                    status: projectForm.isPublished ? "published" : "draft"
                };

                if (editingProject?.source === "wedding") {
                    await axios.put(`/api/weddings?id=${editingProject.rawId}`, payload);
                    showToast("Wedding project updated!");
                } else {
                    await axios.post("/api/weddings", payload);
                    showToast("New wedding project added!");
                }
            } else {
                // Commercial / Other Project stored in Content model
                const updatedCommercials = [...commercials];
                const newProjectObj = {
                    id: editingProject?.id || `proj-${Date.now()}`,
                    title: projectForm.title,
                    type: "commercial",
                    category: projectForm.category,
                    coverImage: projectForm.coverImage,
                    image: projectForm.coverImage,
                    videoUrl: projectForm.videoUrl,
                    description: projectForm.description,
                    client: projectForm.client,
                    location: projectForm.venue,
                    order: Number(projectForm.order) || 0,
                    featured: Boolean(projectForm.featured),
                    isPublished: Boolean(projectForm.isPublished)
                };

                if (editingProject?.source === "commercial") {
                    const idx = updatedCommercials.findIndex(c => c.id === editingProject.id);
                    if (idx >= 0) updatedCommercials[idx] = newProjectObj;
                } else {
                    updatedCommercials.push(newProjectObj);
                }

                await axios.post("/api/content", { projects: updatedCommercials });
                showToast("Commercial project saved successfully!");
            }

            setIsModalOpen(false);
            fetchPortfolioData();
        } catch (err) {
            showToast(err.response?.data?.error || "Error saving project", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProject = async (proj) => {
        if (!confirm(`Are you sure you want to delete "${proj.title}"?`)) return;

        try {
            if (proj.source === "wedding") {
                await axios.delete(`/api/weddings?id=${proj.rawId}`);
            } else {
                const remaining = commercials.filter(c => c.id !== proj.id);
                await axios.post("/api/content", { projects: remaining });
            }
            showToast("Project deleted successfully.");
            fetchPortfolioData();
        } catch (err) {
            showToast(err.response?.data?.error || "Error deleting project", "error");
        }
    };

    const handleToggleFeatured = async (proj) => {
        const nextState = !proj.featured;
        try {
            if (proj.source === "wedding") {
                await axios.put(`/api/weddings?id=${proj.rawId}`, { featured: nextState });
            } else {
                const updated = commercials.map(c => c.id === proj.id ? { ...c, featured: nextState } : c);
                await axios.post("/api/content", { projects: updated });
            }
            showToast(nextState ? "Project featured on portfolio!" : "Project unfeatured.");
            fetchPortfolioData();
        } catch (err) {
            showToast("Error updating status", "error");
        }
    };

    return (
        <div className="space-y-8 pb-32 max-w-7xl">
            {/* TOAST */}
            {toast.message && (
                <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${
                    toast.type === "error" 
                        ? "bg-red-950/90 border-red-500/50 text-red-200" 
                        : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                }`}>
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                        <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em]">Portfolio Central</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Portfolio <span className="text-gray-500">Management.</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Manage all projects across weddings, commercial films, tech and luxury showcases.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/portfolio/"
                        target="_blank"
                        className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <span>👁️</span> Public Portfolio
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 rounded-2xl bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                        <span>➕</span> Add Project
                    </button>
                </div>
            </header>

            {/* SEARCH & CATEGORY BAR */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by project title, client, or venue..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white text-xs font-medium focus:border-[#c5a059] outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        {[
                            { id: "ALL", label: `All (${allProjects.length})` },
                            { id: "WEDDING", label: `Weddings (${weddings.length})` },
                            { id: "COMMERCIAL", label: `Commercial (${commercials.length})` }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                        : "bg-white/5 text-gray-400 hover:text-white"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PROJECTS GRID */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 uppercase text-xs font-black tracking-widest">Loading portfolio database...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="py-24 text-center bg-[#0a0a0a] rounded-3xl border border-white/5 p-12">
                    <span className="text-5xl block mb-4">📁</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No Projects Found</h3>
                    <p className="text-gray-500 text-xs max-w-md mx-auto mb-6">
                        No projects match your current filter. Create a new portfolio project to get started.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all"
                    >
                        Add First Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProjects.map((proj, idx) => (
                        <div
                            key={proj.id || idx}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#c5a059]/50 transition-all shadow-xl"
                        >
                            <div className="relative aspect-video w-full bg-white/5 overflow-hidden">
                                {proj.coverImage ? (
                                    <img
                                        src={proj.coverImage}
                                        alt={proj.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 uppercase font-black">
                                        No Image
                                    </div>
                                )}

                                <div className="absolute top-2 left-2 flex gap-1">
                                    <span className="bg-black/80 backdrop-blur-md text-[#c5a059] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10">
                                        {proj.category}
                                    </span>
                                    {proj.featured && (
                                        <span className="bg-[#c5a059] text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            Featured ★
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-white truncate" title={proj.title}>
                                        {proj.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 truncate mt-1">
                                        {proj.client ? `Client: ${proj.client}` : (proj.venue ? `Venue: ${proj.venue}` : "Production Project")}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleFeatured(proj)}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                                proj.featured ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40" : "bg-white/5 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            {proj.featured ? "★ Featured" : "☆ Feature"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditModal(proj)}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteProject(proj)}
                                            className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-black"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-lg font-black uppercase text-white">
                                {editingProject ? "Edit Portfolio Project" : "Add New Project"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:text-white flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveProject} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={projectForm.title}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Category
                                    </label>
                                    <select
                                        value={projectForm.category}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                    >
                                        <option value="commercial" className="bg-black text-white">Commercial</option>
                                        <option value="wedding" className="bg-black text-white">Wedding</option>
                                        <option value="luxury" className="bg-black text-white">Luxury</option>
                                        <option value="tech" className="bg-black text-white">Tech / Digital</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={projectForm.order}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, order: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Cover Image URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://... or /uploads/..."
                                    value={projectForm.coverImage}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, coverImage: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Video URL (YouTube or Reel, Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://www.youtube.com/... or https://instagram.com/..."
                                    value={projectForm.videoUrl}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Client / Couple
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TATA Trust / Priya & Rahul"
                                        value={projectForm.client}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Venue / Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ITC Sonar, Kolkata"
                                        value={projectForm.venue}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, venue: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Project Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-[#c5a059] outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
                                    <input
                                        type="checkbox"
                                        checked={projectForm.featured}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                                        className="w-4 h-4 rounded accent-[#c5a059]"
                                    />
                                    Feature on Homepage
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
                                    <input
                                        type="checkbox"
                                        checked={projectForm.isPublished}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                                        className="w-4 h-4 rounded accent-[#c5a059]"
                                    />
                                    Published
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-[#c5a059] hover:bg-white text-black font-black uppercase text-xs rounded-xl shadow-lg shadow-[#c5a059]/20"
                                >
                                    {isSaving ? "Saving..." : "Save Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
