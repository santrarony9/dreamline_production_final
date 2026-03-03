"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

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
            clientNames: ""
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
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Hero Image URL</label>
                                    <input type="text" value={editingWedding.img} onChange={(e) => setEditingWedding({ ...editingWedding, img: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] outline-none" placeholder="https://..." />
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
