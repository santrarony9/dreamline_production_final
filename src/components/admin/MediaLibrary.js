"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function MediaLibrary({ onSelect, onClose }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterMissing, setFilterMissing] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await axios.get("/api/admin/media");
            setImages(res.data || []);
        } catch (err) {
            console.error("Failed to fetch media:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, url) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to scrub this image from the database? It will be removed from all pages.')) return;
        try {
            await axios.delete('/api/admin/media', { data: { url } });
            setImages(prev => prev.filter(img => (typeof img === 'string' ? img !== url : img.url !== url)));
        } catch (err) {
            console.error(err);
            alert('Failed to scrub asset.');
        }
    };

    const normalizedImages = images.map(img => {
        if (typeof img === 'string') {
            return { url: img, alt: "", isMissingAlt: true };
        }
        return {
            ...img,
            isMissingAlt: !img.alt || img.alt.trim().length < 3
        };
    });

    const filteredImages = normalizedImages.filter(img => {
        if (filterMissing && !img.isMissingAlt) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (img.url || "").toLowerCase().includes(q) || 
               (img.alt || "").toLowerCase().includes(q) ||
               (img.title || "").toLowerCase().includes(q);
    });

    return (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col p-6 md:p-12 animate-in fade-in duration-300">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 pb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-1">Internal Media Vault</h2>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter font-heading">
                            Asset Library <span className="text-gray-500">&amp; SEO Alt.</span>
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setFilterMissing(!filterMissing)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                                filterMissing 
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                            }`}
                        >
                            {filterMissing ? "Showing: Missing Alt" : "Filter: Missing Alt"}
                        </button>

                        <input 
                            type="text" 
                            placeholder="Search assets or alt text..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-[#c5a059] w-56 sm:w-64"
                        />
                        <button 
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest px-3 py-2"
                        >
                            Close ✕
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Scanning production assets...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-12">
                            {filteredImages.map((img, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => onSelect(img.url, img.alt)}
                                    className="aspect-square bg-white/5 border border-white/5 rounded-2xl overflow-hidden group relative hover:border-[#c5a059]/50 transition-all cursor-pointer flex flex-col justify-end"
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                            type="button"
                                            onClick={(e) => handleDelete(e, img.url)}
                                            className="bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                            title="Scrub from database"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Missing Alt Badge */}
                                    {img.isMissingAlt && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-amber-500/90 text-black">
                                                No Alt
                                            </span>
                                        </div>
                                    )}

                                    <img 
                                        src={img.url} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                                        alt={img.alt || img.title || "Production visual asset"} 
                                        loading="lazy"
                                    />

                                    {/* Bottom Hover Overlay with Alt Text and Selection Prompt */}
                                    <div className="relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-2 text-left opacity-90 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] text-gray-300 font-bold truncate">
                                            {img.alt || img.title || "No Alt text"}
                                        </p>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-[#c5a059] block mt-0.5 group-hover:underline">
                                            Select Asset ↗
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredImages.length === 0 && (
                            <div className="text-center py-32 text-gray-600 space-y-2">
                                <span className="text-3xl block">📁</span>
                                <p className="text-[10px] uppercase font-black tracking-widest">No matching assets found in the vault</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
