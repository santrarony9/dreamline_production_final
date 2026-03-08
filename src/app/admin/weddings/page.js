"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

export default function WeddingAdmin() {
    const [weddings, setWeddings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWedding, setEditingWedding] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchWeddings();
    }, []);

    const fetchWeddings = async () => {
        try {
            const res = await axios.get("/api/weddings");
            setWeddings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingWedding._id) {
                await axios.put("/api/weddings", { id: editingWedding._id, ...editingWedding });
            } else {
                await axios.post("/api/weddings", editingWedding);
            }
            setEditingWedding(null);
            fetchWeddings();
        } catch (err) {
            alert("Error saving wedding film.");
        } finally {
            setSaving(false);
        }
    };

    const deleteWedding = async (id) => {
        if (!confirm("Remove this masterpiece from the archive?")) return;
        try {
            await axios.delete(`/api/weddings?id=${id}`);
            setWeddings(weddings.filter(w => w._id !== id));
        } catch (err) {
            alert("Error deleting wedding.");
        }
    };

    const startNewWedding = () => {
        setEditingWedding({
            title: "",
            location: "",
            date: new Date().toISOString().split('T')[0],
            img: "",
            videoUrl: "",
            description: "",
            review: "",
            clientNames: "",
            images: []
        });
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Compiling heritage collection...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Heritage</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Wedding <span className="text-gray-700">Films.</span></h1>
                </div>
                <button
                    onClick={startNewWedding}
                    className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                >
                    + Register New Film
                </button>
            </header>

            {/* List Grid */}
            {!editingWedding && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {weddings.map((w) => (
                        <div key={w._id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/30 transition-all flex flex-col">
                            <div className="aspect-video relative overflow-hidden">
                                <img src={w.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt={w.title} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingWedding(w)} className="bg-white text-black p-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-110 transition-transform">Edit Narrative</button>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{w.title}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{w.location} • {new Date(w.date).getFullYear()}</p>
                                </div>
                                <button onClick={() => deleteWedding(w._id)} className="text-[10px] font-black text-red-500/30 hover:text-red-500 uppercase tracking-widest text-left mt-8 transition-colors">Decommission Film</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal Overlay */}
            {editingWedding && (
                <div className="fixed inset-0 bg-black/95 z-[101] overflow-y-auto p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Film <span className="text-[#c5a059]">Narrative.</span></h2>
                            <button onClick={() => setEditingWedding(null)} className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Abort Edit</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Couple/Title</label>
                                    <input type="text" value={editingWedding.title} onChange={(e) => setEditingWedding({ ...editingWedding, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Location</label>
                                    <input type="text" value={editingWedding.location} onChange={(e) => setEditingWedding({ ...editingWedding, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" />
                                </div>
                                <div className="space-y-4">
                                    <ImageUploader
                                        currentImage={editingWedding.img}
                                        recommendedSize="Hero Image URL (Recommended: 1920x1080)"
                                        onUploadSuccess={(url) => setEditingWedding({ ...editingWedding, img: url })}
                                    />
                                    {editingWedding.img && (
                                        <button type="button" onClick={() => setEditingWedding({ ...editingWedding, img: "" })} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase w-full text-right transition-colors">Clear Asset</button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Cinematic Link</label>
                                    <input type="text" value={editingWedding.videoUrl} onChange={(e) => setEditingWedding({ ...editingWedding, videoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" placeholder="YouTube/Vimeo Embed" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Detailed Story</label>
                                <textarea value={editingWedding.description} onChange={(e) => setEditingWedding({ ...editingWedding, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] h-32" />
                            </div>

                            <div className="bg-white/2 p-8 rounded-3xl space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Client Reflection</h3>
                                <textarea value={editingWedding.review} onChange={(e) => setEditingWedding({ ...editingWedding, review: e.target.value })} placeholder="Quote from the client..." className="w-full bg-transparent border-b border-white/10 p-2 text-white outline-none italic text-lg" />
                                <input type="text" value={editingWedding.clientNames} onChange={(e) => setEditingWedding({ ...editingWedding, clientNames: e.target.value })} placeholder="Couple's Name for Review Attribution" className="w-full bg-transparent text-[10px] font-black uppercase text-gray-500 outline-none" />
                            </div>

                            {/* Gallery Images Array Editor */}
                            <div className="bg-white/2 border border-white/5 p-8 rounded-3xl space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-[12px] font-black uppercase tracking-widest text-[#c5a059]">Cinematic Gallery Array</h3>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1">Provide 12-25 images for the masonry grid. (Recommended Widths: 800px or 1200px)</p>
                                    </div>
                                    <p></p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {(editingWedding.images || []).map((img, index) => (
                                            <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-white/5">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = editingWedding.images.filter((_, i) => i !== index);
                                                        setEditingWedding({ ...editingWedding, images: newImages });
                                                    }}
                                                    className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="text-[10px] font-black uppercase text-white">Remove</span>
                                                </button>
                                            </div>
                                        ))}
                                        <div className="aspect-[3/4] bg-white/5 border flex items-center justify-center border-dashed border-white/10 rounded-xl overflow-hidden p-2">
                                            <ImageUploader
                                                onUploadSuccess={(url) => {
                                                    const newImages = [...(editingWedding.images || []), url];
                                                    setEditingWedding({ ...editingWedding, images: newImages });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {(!editingWedding.images || editingWedding.images.length === 0) && (
                                        <div className="text-center py-8 text-gray-600 border border-dashed border-gray-800 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black tracking-widest">No Gallery Images Added</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-12">
                                <button type="submit" disabled={saving} className="w-full bg-[#c5a059] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all transform active:scale-[0.98]">
                                    {saving ? "Archiving Film..." : "Commit Narrative to History"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
