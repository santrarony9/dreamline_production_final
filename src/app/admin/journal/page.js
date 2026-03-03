"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

export default function JournalAdmin() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get("/api/journals");
            setPosts(res.data);
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
            if (editingPost._id) {
                await axios.put("/api/journals", { id: editingPost._id, ...editingPost });
            } else {
                await axios.post("/api/journals", editingPost);
            }
            setEditingPost(null);
            fetchPosts();
        } catch (err) {
            alert("Error saving journal post.");
        } finally {
            setSaving(false);
        }
    };

    const deletePost = async (id) => {
        if (!confirm("Is this story better left untold? Delete permanentely?")) return;
        try {
            await axios.delete(`/api/journals?id=${id}`);
            setPosts(posts.filter(p => p._id !== id));
        } catch (err) {
            alert("Error deleting post.");
        }
    };

    const startNewPost = () => {
        setEditingPost({
            title: "",
            date: new Date().toISOString().split('T')[0],
            category: "INSIGHT",
            image: "",
            content: "",
            excerpt: ""
        });
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Accessing the archive of insights...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Narratives</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">The <span className="text-gray-700">Journal.</span></h1>
                </div>
                <button
                    onClick={startNewPost}
                    className="bg-[#c5a059] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10"
                >
                    + Write New Insight
                </button>
            </header>

            {/* List Grid */}
            {!editingPost && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/30 transition-all flex flex-col">
                            <div className="h-48 relative overflow-hidden bg-black">
                                {post.image ? (
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 font-black uppercase">Missing Asset</div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#c5a059] text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase tracking-tight">{post.title}</h3>
                                <p className="text-[10px] text-gray-500 font-bold mb-6">{new Date(post.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-400 line-clamp-3 mb-8">{post.excerpt || "No summary available."}</p>

                                <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                                    <button onClick={() => setEditingPost(post)} className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:text-white transition-colors">Edit Content</button>
                                    <button onClick={() => deletePost(post._id)} className="text-[10px] font-black text-red-500/30 hover:text-red-500 uppercase tracking-widest transition-colors">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Screen Editor */}
            {editingPost && (
                <div className="fixed inset-0 bg-black z-[101] overflow-y-auto p-6 md:p-12">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="flex justify-between items-center border-b border-white/5 pb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Drafting <span className="text-[#c5a059]">Insight.</span></h2>
                            <button onClick={() => setEditingPost(null)} className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Discard Draft</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-12 pb-32">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-1 lg:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Article Headline</label>
                                    <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] text-xl font-bold" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Category</label>
                                    <select value={editingPost.category} onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] outline-none font-black uppercase text-xs">
                                        <option value="INSIGHT">Insight</option>
                                        <option value="WEDDING">Wedding Story</option>
                                        <option value="BEHIND THE SCENES">Behind The Scenes</option>
                                        <option value="TECHNICAL">Technical Breakdown</option>
                                    </select>
                                </div>
                                <div className="space-y-1 lg:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Featured Keyframe (Image URL)</label>
                                    <input type="text" value={editingPost.image} onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[#c5a059] outline-none text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Publish Date</label>
                                    <input type="date" value={editingPost.date.split('T')[0]} onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059]" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Brief Excerpt (SEO Summary)</label>
                                <textarea value={editingPost.excerpt} onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#c5a059] h-20 text-sm font-light" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Complete Narrative (HTML Supported)</label>
                                <div className="prose-editor">
                                    {/* In a real scenario we'd use React-Quill here. For now standard textarea with a note */}
                                    <p className="text-[9px] text-[#c5a059] mb-4 font-bold uppercase">Note: Use HTML tags for advanced formatting.</p>
                                    <textarea
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                        className="w-full min-h-[500px] bg-[#050505] border border-white/5 rounded-3xl p-10 text-gray-300 font-mono text-sm leading-relaxed focus:border-[#c5a059]/30 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg z-[102]">
                                <button type="submit" disabled={saving} className="w-full bg-[#c5a059] text-black py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-white transition-all transform active:scale-95">
                                    {saving ? "Publishing Story..." : "Commit Insight to Archive"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
