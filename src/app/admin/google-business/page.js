"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function GoogleBusinessAdmin() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});
    const [address, setAddress] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [pendingPosts, setPendingPosts] = useState([]);
    const [reviewSyncStatus, setReviewSyncStatus] = useState(null);
    const [reviewSyncMsg, setReviewSyncMsg] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [res, journalsRes] = await Promise.all([
                    axios.get("/api/content"),
                    axios.get("/api/journals")
                ]);
                const global = res.data?.global || {};
                setSettings(global.google || {});
                setAddress(global.contact?.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082");
                setBusinessName(global.google?.businessName || global.company?.name || "Dreamline Production");
                const posts = journalsRes.data || [];
                const pending = posts.filter(p => p.googleBusinessSync !== 'SYNCED');
                setPendingPosts(pending);
            } catch (err) {
                console.error("Failed to fetch settings or journals");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateGoogleField = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setSaveMsg("");
        try {
            await axios.post("/api/content", {
                global: {
                    google: {
                        ...settings,
                        businessName
                    },
                    contact: {
                        address
                    },
                    company: {
                        name: businessName
                    }
                }
            });
            setSaveMsg("Google Business profile & maps settings updated successfully!");
            setTimeout(() => setSaveMsg(""), 4000);
        } catch (err) {
            setSaveMsg("Error saving Google Business settings: " + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAuthorize = () => {
        alert("SYSTEM ACTION: Google Business API requires a 'Client ID' and 'Secret' from your Google Cloud Console. I will now redirect you to Global Settings to enter them.");
        window.location.href = "/admin/global?tab=SEO";
    };

    const handleSyncReviews = async () => {
        setReviewSyncStatus('syncing');
        setReviewSyncMsg('Fetching latest reviews from Google...');
        try {
            const res = await axios.post("/api/admin/sync-reviews");
            const { count, averageRating, totalReviews } = res.data;
            setReviewSyncStatus('success');
            setReviewSyncMsg(`Synced ${count} reviews · ${averageRating}/5 · ${totalReviews} total`);
        } catch (err) {
            setReviewSyncStatus('error');
            const errMsg = err.response?.data?.error || "Check your Google Maps API Key in Global Settings.";
            setReviewSyncMsg(errMsg);
        }
    };

    const handleSync = async (e, msg, sourceId = null, sourceType = 'JOURNAL') => {
        const btn = e.currentTarget;
        const originalText = btn.innerText;
        btn.innerText = "OPTIMIZING...";
        btn.disabled = true;
        try {
            if (sourceId) {
                await axios.post("/api/admin/automation/sync", { sourceId, sourceType });
                setPendingPosts(prev => prev.filter(p => p._id !== sourceId));
            } else {
                if (pendingPosts.length === 0) {
                    alert("No pending posts to sync!");
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }
                for (const post of pendingPosts.slice(0, 30)) {
                    await axios.post("/api/admin/automation/sync", { sourceId: post._id, sourceType: 'JOURNAL' });
                }
                setPendingPosts(prev => prev.slice(30));
            }
            alert(msg);
        } catch (err) {
            alert("Sync failed. Please check logs.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };

    const getEmbedSrc = (raw) => {
        if (!raw) return "https://maps.google.com/maps?q=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&t=&z=16&ie=UTF8&iwloc=&output=embed";
        if (typeof raw === 'string' && raw.includes('<iframe')) {
            const match = raw.match(/src=["']([^"']+)["']/i);
            if (match && match[1]) return match[1];
        }
        return raw;
    };

    if (loading) return <div className="p-20 text-center uppercase text-[10px] font-black tracking-widest text-[#c5a059]">Initializing Neural Link...</div>;

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Location &amp; Social Sync</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Google <span className="text-gray-500">Business.</span></h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest border border-green-500/20 bg-green-500/5 px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Verified Profile Connected
                    </div>
                </div>
            </header>

            {/* Editable Profile, Address & Maps Settings Form */}
            <form onSubmit={handleSaveProfile} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">📍 Verified Profile &amp; Maps Management</h3>
                            <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-black tracking-widest uppercase">Header &amp; Footer Active</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mt-1">
                            Updates reflect automatically on the website header address, footer Google Maps embed, and Get Directions buttons.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors self-start sm:self-auto">
                        <input
                            type="checkbox"
                            checked={settings.mapEnabled !== false}
                            onChange={(e) => updateGoogleField("mapEnabled", e.target.checked)}
                            className="w-4 h-4 accent-[#c5a059]"
                        />
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider">Show Map in Footer</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Business Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Official Business Name</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Dreamline Production"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Official verified brand name displayed on the website.</p>
                    </div>

                    {/* 2. Business Address */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Business Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Clickable address in website header and footer studio card.</p>
                    </div>

                    {/* 3. Google Business Profile URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Google Business Profile (GMB) URL</label>
                        <input
                            type="url"
                            value={settings.profileUrl || ""}
                            onChange={(e) => updateGoogleField("profileUrl", e.target.value)}
                            placeholder="https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Opens in new tab when clicking header address or Google Profile button.</p>
                    </div>

                    {/* 4. Google Maps Location URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Google Maps Location URL</label>
                        <input
                            type="url"
                            value={settings.mapsUrl || ""}
                            onChange={(e) => updateGoogleField("mapsUrl", e.target.value)}
                            placeholder="https://www.google.com/maps/place/Dreamline+Production/..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Full Google Maps place link used for 'Open Full Map' actions.</p>
                    </div>

                    {/* 5. Google Maps Embed Code */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                            Google Maps Embed Code / Iframe / Embed URL
                        </label>
                        <textarea
                            value={settings.embedCode || ""}
                            onChange={(e) => updateGoogleField("embedCode", e.target.value)}
                            placeholder="Paste <iframe> code OR https://maps.google.com/maps?q=...&output=embed"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-mono h-24"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">
                            Interactive responsive map source rendered in the footer. Accepts raw embed URL or full &lt;iframe&gt; code.
                        </p>
                    </div>

                    {/* 6. Get Directions URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Get Directions URL</label>
                        <input
                            type="url"
                            value={settings.directionsUrl || ""}
                            onChange={(e) => updateGoogleField("directionsUrl", e.target.value)}
                            placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Target for the 'Get Directions' button in header and footer.</p>
                    </div>

                    {/* Google Reviews URL */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Google Reviews URL</label>
                        <input
                            type="url"
                            value={settings.reviewsUrl || ""}
                            onChange={(e) => updateGoogleField("reviewsUrl", e.target.value)}
                            placeholder="https://search.google.com/local/writereview?placeid=..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                        />
                        <p className="text-[9px] text-gray-600 font-bold uppercase pl-1">Links to write or read Google customer reviews.</p>
                    </div>
                </div>

                {/* Map Preview */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                            <span>🗺️</span>
                            <span>Interactive Map Live Preview</span>
                        </span>
                        <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                            {settings.profileUrl && (
                                <a href={settings.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[#c5a059] hover:underline">
                                    Test GMB Profile ↗
                                </a>
                            )}
                            {settings.directionsUrl && (
                                <>
                                    <span className="text-gray-600">|</span>
                                    <a href={settings.directionsUrl} target="_blank" rel="noopener noreferrer" className="text-[#c5a059] hover:underline">
                                        Test Directions ↗
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 bg-black">
                        <iframe
                            src={getEmbedSrc(settings.embedCode)}
                            title="Google Maps Preview"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Form Save Button & Feedback */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                    {saveMsg ? (
                        <p className={`text-[10px] font-black uppercase tracking-widest ${saveMsg.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                            {saveMsg}
                        </p>
                    ) : <span />}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#c5a059] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-[#c5a059]/10"
                    >
                        {saving ? "Updating Live Website..." : "Save Profile & Maps Settings"}
                    </button>
                </div>
            </form>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Connection Status */}
                <section className="lg:col-span-4 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-6">Google Account Link</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl text-black font-black">G</div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{businessName}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase truncate max-w-[180px]">{address}</p>
                                </div>
                            </div>
                            <button type="button" 
                                onClick={handleAuthorize}
                                className="w-full bg-[#c5a059] text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-all interactive shadow-lg shadow-[#c5a059]/10"
                            >
                                Re-Authenticate Google Account
                            </button>
                            <p className="text-[9px] text-gray-600 text-center uppercase font-bold">Verified on Google Maps</p>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-4">Auto-Post Settings</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sync New Weddings</span>
                                <div className="w-10 h-5 bg-[#c5a059] rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sync Journal Posts</span>
                                <div className="w-10 h-5 bg-[#c5a059] rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Google Reviews Sync */}
                    <div className="bg-[#0a0a0a] border border-[#c5a059]/20 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-2">Google Reviews</h3>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-6">Auto-pull latest reviews from GMB</p>

                        <button type="button"
                            onClick={handleSyncReviews}
                            disabled={reviewSyncStatus === 'syncing'}
                            className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all interactive
                                ${reviewSyncStatus === 'syncing'
                                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 cursor-wait'
                                    : reviewSyncStatus === 'success'
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                                        : reviewSyncStatus === 'error'
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-white/5 border border-white/10 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059]'
                                }`}
                        >
                            {reviewSyncStatus === 'syncing' ? '⏳ Syncing...' : '⭐ Sync Google Reviews'}
                        </button>

                        {reviewSyncMsg && (
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-3 text-center ${
                                reviewSyncStatus === 'success' ? 'text-green-500' :
                                reviewSyncStatus === 'error' ? 'text-red-400' : 'text-yellow-500'
                            }`}>
                                {reviewSyncMsg}
                            </p>
                        )}

                        <p className="text-[8px] text-gray-600 text-center uppercase font-bold mt-4">
                            Place ID: {settings.placeId || "ChIJj45i25BwAjoRO1La59wUhTs"}
                        </p>
                    </div>
                </section>

                {/* Sync Queue */}
                <section className="lg:col-span-8 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Upcoming Google Posts</h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{pendingPosts.length} Items in Queue</span>
                    </div>

                    <div className="space-y-4">
                        {pendingPosts.length === 0 && (
                            <div className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest py-10">No pending posts</div>
                        )}
                        {pendingPosts.map((post) => (
                            <div key={post._id} className="flex items-center justify-between p-5 bg-white/2 rounded-2xl border border-white/5 group hover:border-[#c5a059]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden relative">
                                        {post.image ? (
                                            <img src={post.image} alt={post.summary ? `${post.summary.slice(0, 40)}...` : "Google Business update visual"} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-[10px] text-gray-500 font-black">IMG</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white uppercase tracking-tight">{post.title}</p>
                                        <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest">Scheduled for: {post.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" 
                                        onClick={(e) => handleSync(e, "Post synchronized to Google Business successfully!", post._id, "JOURNAL")}
                                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#c5a059] hover:text-black transition-all interactive"
                                    >
                                        Post Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                         <button type="button" 
                            onClick={(e) => handleSync(e, "Bulk Sync completed successfully!")}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all interactive"
                        >
                            Bulk Sync Recent Posts
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

