"use client";
import { useState, useEffect } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useRouter } from "next/navigation";

export default function ServicesAdmin() {
    const [services, setServices] = useState([]);
    const [servicePages, setServicePages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlug, setSelectedSlug] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        heroImage: "",
        gallery: [],
        videos: []
    });

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all subcategories from home content
                const contentRes = await fetch("/api/content");
                const contentData = await contentRes.json();
                const allSubcats = [];
                (contentData.services || contentData.home?.services || []).forEach(s => {
                    (s.subcategories || []).forEach(sub => {
                        if (!allSubcats.find(x => x.name === sub)) {
                            allSubcats.push({ name: sub, slug: slugify(sub) });
                        }
                    });
                });
                setServices(allSubcats);

                // Fetch existing service pages
                const pagesRes = await fetch("/api/service-pages");
                const pagesData = await pagesRes.json();
                setServicePages(pagesData || []);
                
                setLoading(true); // Reset for selection
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectPage = async (slug) => {
        setSelectedSlug(slug);
        const existing = servicePages.find(p => p.slug === slug);
        if (existing) {
            setFormData(existing);
        } else {
            const serviceName = services.find(s => s.slug === slug)?.name || "";
            setFormData({
                slug,
                title: serviceName,
                subtitle: "Premium Service",
                description: "",
                heroImage: "",
                gallery: [],
                videos: []
            });
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/service-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Service page updated successfully!");
                // Refresh list
                const pagesRes = await fetch("/api/service-pages");
                const pagesData = await pagesRes.json();
                setServicePages(pagesData);
            }
        } catch (err) {
            alert("Error saving page: " + err.message);
        }
    };

    if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="bg-black min-h-screen text-white p-8 md:p-16">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#c5a059]">Service Pages</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Build individual pages for your subcategories.</p>
                    </div>
                    <a href="/admin/home" className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all">Back to Home Admin</a>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* SIDEBAR: Subcategories List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Select Subcategory</h2>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {services.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectPage(s.slug)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                        selectedSlug === s.slug 
                                        ? "bg-[#c5a059] border-[#c5a059] text-black" 
                                        : "bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                                    }`}
                                >
                                    <p className="text-xs font-black uppercase tracking-tight">{s.name}</p>
                                    <p className={`text-[8px] uppercase font-bold tracking-widest mt-1 ${selectedSlug === s.slug ? "text-black/60" : "text-gray-600"}`}>
                                        {servicePages.find(p => p.slug === s.slug) ? "✅ Configured" : "⭕ Not Started"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MAIN FORM */}
                    <div className="lg:col-span-3">
                        {!selectedSlug ? (
                            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-[3rem] p-20 text-center">
                                <div>
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Select a subcategory from the left to start building its page.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* BASIC INFO */}
                                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Main Details</h3>
                                        <span className="text-[9px] bg-white/5 px-3 py-1 rounded-full text-gray-500">SLUG: {selectedSlug}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Page Title</label>
                                            <input 
                                                type="text" 
                                                value={formData.title} 
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-[#c5a059] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Subtitle / Category</label>
                                            <input 
                                                type="text" 
                                                value={formData.subtitle} 
                                                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:border-[#c5a059] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Description (Storytelling)</label>
                                        <textarea 
                                            rows={4}
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-medium focus:border-[#c5a059] outline-none leading-relaxed"
                                            placeholder="Write a compelling description for this service..."
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">Hero Banner Image</label>
                                        <ImageUploader 
                                            currentImage={formData.heroImage}
                                            recommendedSize="Hero - 1920x800"
                                            onUploadSuccess={(url) => setFormData({...formData, heroImage: url})}
                                        />
                                    </div>
                                </div>

                                {/* VIDEOS SECTION */}
                                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-8">
                                    <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Video Showcase (YouTube/S3)</h3>
                                    <div className="space-y-4">
                                        {formData.videos.map((vid, idx) => (
                                            <div key={idx} className="bg-black border border-white/5 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                                <button onClick={() => setFormData({...formData, videos: formData.videos.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-500 hover:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] uppercase font-black text-gray-600 tracking-widest">Video Title</label>
                                                    <input 
                                                        type="text" 
                                                        value={vid.title} 
                                                        onChange={(e) => {
                                                            const newVids = [...formData.videos];
                                                            newVids[idx].title = e.target.value;
                                                            setFormData({...formData, videos: newVids});
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] uppercase font-black text-gray-600 tracking-widest">Video URL (YouTube Embed or MP4)</label>
                                                    <input 
                                                        type="text" 
                                                        value={vid.url} 
                                                        onChange={(e) => {
                                                            const newVids = [...formData.videos];
                                                            newVids[idx].url = e.target.value;
                                                            setFormData({...formData, videos: newVids});
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => setFormData({...formData, videos: [...formData.videos, {title: "", url: ""}]})}
                                            className="w-full border border-dashed border-white/10 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-[#c5a059] transition-all"
                                        >
                                            + Add Video
                                        </button>
                                    </div>
                                </div>

                                {/* GALLERY SECTION */}
                                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[2.5rem] space-y-8">
                                    <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">Photo Gallery</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {formData.gallery.map((img, idx) => (
                                            <div key={idx} className="bg-black border border-white/5 p-4 rounded-2xl space-y-3 relative group">
                                                <button onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                <div className="aspect-square bg-white/5 rounded-xl overflow-hidden relative border border-white/5">
                                                    <ImageUploader 
                                                        currentImage={img.url}
                                                        onUploadSuccess={(url) => {
                                                            const newG = [...formData.gallery];
                                                            newG[idx].url = url;
                                                            setFormData({...formData, gallery: newG});
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => setFormData({...formData, gallery: [...formData.gallery, {url: "", caption: ""}]})}
                                            className="aspect-square flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-[#c5a059] transition-all"
                                        >
                                            <span className="text-xl mb-2">+</span> Add Image
                                        </button>
                                    </div>
                                </div>

                                {/* SAVE & DELETE ACTIONS */}
                                <div className="fixed bottom-10 right-10 z-[100] flex gap-4">
                                    {servicePages.find(p => p.slug === selectedSlug) && (
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Are you sure you want to delete this page configuration? This will NOT remove the category from the homepage, only the media/content on this sub-page.")) {
                                                    try {
                                                        const res = await fetch(`/api/service-pages?slug=${selectedSlug}`, { method: "DELETE" });
                                                        if (res.ok) {
                                                            alert("Page config deleted.");
                                                            window.location.reload();
                                                        }
                                                    } catch (err) { alert(err.message); }
                                                }
                                            }}
                                            className="bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest px-8 py-5 rounded-full hover:bg-red-500 hover:text-white transition-all text-[9px]"
                                        >
                                            Delete Page Config
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSave}
                                        className="bg-[#c5a059] text-black font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95 transition-all text-xs"
                                    >
                                        Publish Page
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
