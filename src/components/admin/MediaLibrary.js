"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function MediaLibrary({ onSelect, onClose }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await axios.get("/api/admin/media");
            setImages(res.data);
        } catch (err) {
            console.error("Failed to fetch media:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredImages = images.filter(img => 
        img.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col p-6 md:p-12 animate-in fade-in duration-300">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Internal</h2>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Media <span className="text-gray-700">Vault.</span></h1>
                    </div>
                    <div className="flex items-center gap-8">
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-[#c5a059] w-64"
                        />
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                        >
                            Close Vault
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Scanning production assets...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredImages.map((img, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => onSelect(img)}
                                    className="aspect-square bg-white/5 border border-white/5 rounded-2xl overflow-hidden group relative hover:border-[#c5a059]/50 transition-all transform active:scale-95"
                                >
                                    <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Media" />
                                    <div className="absolute inset-0 bg-[#c5a059]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[9px] font-black uppercase text-black bg-white px-3 py-1 rounded-full">Select Asset</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {filteredImages.length === 0 && (
                            <div className="text-center py-32 text-gray-700">
                                <p className="text-[10px] uppercase font-black tracking-widest">No matching assets found in the vault</p>
                            </div>
                        )}
                    </div>
                )}

                <footer className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-gray-600">
                    <p className="text-[9px] font-black uppercase tracking-widest">{images.length} Assets Found</p>
                    <p className="text-[9px] font-black uppercase tracking-widest italic">Selective Archive Selection System</p>
                </footer>
            </div>
        </div>
    );
}
