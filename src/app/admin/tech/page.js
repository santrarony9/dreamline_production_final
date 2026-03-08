"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTech() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [domain, setDomain] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get("/api/tech");
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch tech projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setIsSubmitting(true);
        try {
            await axios.post("/api/tech", { domain: domain.trim() });
            setDomain("");
            fetchProjects();
        } catch (error) {
            console.error("Failed to add domain:", error);
            alert("Failed to add domain. Please verify the URL.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            await axios.delete(`/api/tech/${id}`);
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    if (loading) return <div className="text-white p-10">Loading...</div>;

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Tech Portfolio</h1>
                <p className="text-sm text-gray-500 font-bold">Manage the Web Development projects on the /tech page.</p>
            </div>

            {/* Add New Project */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Add New Website</h2>
                <form onSubmit={handleAddDomain} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Domain Name / URL</label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="e.g., example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]"
                            required
                        />
                        <p className="text-[9px] text-gray-500 pl-2">Simply enter the domain. We will automatically fetch the title and generate a screenshot.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-[#c5a059] text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-colors h-[54px] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? "Scraping..." : "Add Website"}
                    </button>
                </form>
            </div>

            {/* Existing Projects Grid */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Active Portfolio</h2>

                {projects.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-bold">No websites added yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex flex-col group">
                                <div className="aspect-[16/10] relative bg-black">
                                    <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded uppercase text-[10px] font-black tracking-widest hover:bg-red-600 transition-colors"
                                        >
                                            Delete Project
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-1">
                                    <h3 className="text-white font-bold text-lg truncate" title={project.title}>{project.title}</h3>
                                    <p className="text-[#c5a059] text-[10px] font-black tracking-widest uppercase truncate">{project.domain}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
