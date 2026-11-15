"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function ImageSeoAdmin() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'missing', 'approved'
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Inline edit states
    const [editingAlts, setEditingAlts] = useState({});
    const [savingUrl, setSavingUrl] = useState(null);
    const [suggestingUrl, setSuggestingUrl] = useState(null);
    const [bulkOptimizing, setBulkOptimizing] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [copiedUrl, setCopiedUrl] = useState("");

    useEffect(() => {
        fetchAssets();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/admin/media");
            setAssets(res.data || []);

            // Initialize editing states
            const alts = {};
            (res.data || []).forEach(a => {
                alts[a.url] = a.alt || "";
            });
            setEditingAlts(alts);
        } catch (err) {
            console.error("Failed to fetch image assets:", err);
            showToast("Failed to load image assets.");
        } finally {
            setLoading(false);
        }
    };

    const handleAltChange = (url, value) => {
        setEditingAlts(prev => ({
            ...prev,
            [url]: value
        }));
    };

    const handleSaveAlt = async (asset) => {
        const url = asset.url;
        const newAlt = (editingAlts[url] || "").trim();
        setSavingUrl(url);

        try {
            await axios.put("/api/admin/media", {
                url,
                alt: newAlt,
                category: asset.category,
                title: asset.title
            });

            // Update local state
            setAssets(prev => prev.map(a => {
                if (a.url === url) {
                    return {
                        ...a,
                        alt: newAlt,
                        isMissingAlt: !newAlt || newAlt.length < 3,
                        isManualApproved: Boolean(newAlt)
                    };
                }
                return a;
            }));

            showToast("Alt text saved and synchronized across database!");
        } catch (err) {
            console.error("Failed to save alt text:", err);
            showToast("Failed to save alt text.");
        } finally {
            setSavingUrl(null);
        }
    };

    const handleApplySuggestion = async (asset) => {
        const url = asset.url;
        setSuggestingUrl(url);

        try {
            const res = await axios.post("/api/admin/media/suggest-alt", {
                url,
                contextTitle: asset.title || asset.usedIn?.[0]?.contextTitle || "",
                category: asset.category
            });

            if (res.data?.suggestedAlt) {
                handleAltChange(url, res.data.suggestedAlt);
                showToast("Smart suggestion applied! Click Save to confirm.");
            }
        } catch (err) {
            console.error("Failed to generate suggestion:", err);
            showToast("Failed to generate suggestion.");
        } finally {
            setSuggestingUrl(null);
        }
    };

    const handleBulkAutoOptimize = async () => {
        if (!confirm("Automatically generate SEO-friendly alt text for all images currently missing alt text? Manually approved alt text will be preserved.")) return;

        setBulkOptimizing(true);
        try {
            const res = await axios.post("/api/admin/media/auto-optimize");
            showToast(res.data?.message || "Images auto-optimized successfully!");
            await fetchAssets();
        } catch (err) {
            console.error("Bulk optimization error:", err);
            showToast("Failed to run bulk optimization.");
        } finally {
            setBulkOptimizing(false);
        }
    };

    const copyUrlToClipboard = (url) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(""), 2000);
            showToast("Image URL copied!");
        }
    };

    // Filtered assets
    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            // Status filter
            if (statusFilter === "missing" && !a.isMissingAlt) return false;
            if (statusFilter === "approved" && (a.isMissingAlt || !a.isManualApproved)) return false;

            // Category filter
            if (categoryFilter !== "all" && a.category !== categoryFilter) return false;

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchUrl = (a.url || "").toLowerCase().includes(q);
                const matchAlt = (editingAlts[a.url] || a.alt || "").toLowerCase().includes(q);
                const matchTitle = (a.title || "").toLowerCase().includes(q);
                const matchUsage = (a.usedIn || []).some(u => (u.contextTitle || "").toLowerCase().includes(q));
                if (!matchUrl && !matchAlt && !matchTitle && !matchUsage) return false;
            }

            return true;
        });
    }, [assets, statusFilter, categoryFilter, searchQuery, editingAlts]);

    // Statistics
    const stats = useMemo(() => {
        let missing = 0;
        let approved = 0;
        assets.forEach(a => {
            if (a.isMissingAlt) missing++;
            else approved++;
        });
        return { total: assets.length, missing, approved };
    }, [assets]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-[#141414] border border-[#c5a059]/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🖼️</span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
                            Image SEO <span className="text-[#c5a059]">&amp; Alt Text Vault</span>
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                        Audit, write, and manage descriptive, natural-language alt attributes across all website images. Maximize Google Image Search ranking, accessibility compliance, and technical SEO.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchAssets}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center gap-2"
                        title="Reload image catalog"
                    >
                        <span>🔄</span>
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        type="button"
                        disabled={bulkOptimizing || stats.missing === 0}
                        onClick={handleBulkAutoOptimize}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:from-[#d4b068] hover:to-[#ebd089] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_35px_rgba(197,160,89,0.5)] flex items-center gap-2.5 disabled:opacity-40 cursor-pointer"
                    >
                        {bulkOptimizing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                <span>Optimizing...</span>
                            </>
                        ) : (
                            <>
                                <span>⚡</span>
                                <span>Auto-Optimize Missing ({stats.missing})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Indexed Images</span>
                        <span className="text-sm">📸</span>
                    </div>
                    <p className="text-3xl font-black text-white font-heading">{stats.total}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Found across database &amp; pages</p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-emerald-400 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Alt Text Optimized</span>
                        <span className="text-sm">✅</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-400 font-heading">{stats.approved}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Natural descriptive alt attributes</p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-amber-500 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Missing / Suboptimal Alt</span>
                        <span className="text-sm">⚠️</span>
                    </div>
                    <p className="text-3xl font-black text-amber-500 font-heading">{stats.missing}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Requires description or review</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
                        {[
                            { id: "all", label: "All Images", count: stats.total },
                            { id: "missing", label: "Missing Alt", count: stats.missing },
                            { id: "approved", label: "Optimized", count: stats.approved }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                    statusFilter === tab.id
                                        ? "bg-[#c5a059] text-black shadow-md font-bold"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    statusFilter === tab.id ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black hidden sm:inline">Category:</span>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-black/60 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#c5a059] focus:outline-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="wedding">Weddings</option>
                            <option value="blog">Journal / Blog</option>
                            <option value="service">Services</option>
                            <option value="commercial">Commercial</option>
                            <option value="drone">Drone / Aerial</option>
                            <option value="tech">Tech / Web</option>
                            <option value="home">Home Page</option>
                            <option value="about">About / Team</option>
                            <option value="luxury">Luxury Cinema</option>
                            <option value="general">General / Uploads</option>
                        </select>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search images by alt text, filename, page usage, or context title..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#c5a059] focus:outline-none transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Asset List */}
            {loading ? (
                <div className="p-16 text-center bg-[#0a0a0a] border border-white/5 rounded-2xl">
                    <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Scanning Website Images &amp; Alt Metadata...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="p-16 text-center bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                    <span className="text-4xl block">🎉</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-heading">
                        No Images Found Matching Filter
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        {statusFilter === "missing" 
                            ? "All website images in this category have optimized, descriptive alt text!"
                            : "Try adjusting your search query or category filter."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAssets.map((asset, idx) => {
                        const currentAlt = editingAlts[asset.url] ?? asset.alt ?? "";
                        const isMissing = !currentAlt || currentAlt.trim().length < 3;
                        const charCount = currentAlt.length;
                        const isSaving = savingUrl === asset.url;
                        const isSuggesting = suggestingUrl === asset.url;

                        return (
                            <div
                                key={asset.url || idx}
                                className={`bg-[#0a0a0a] border rounded-2xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row items-start gap-5 ${
                                    isMissing 
                                        ? "border-amber-500/20 hover:border-amber-500/40" 
                                        : "border-white/5 hover:border-white/15"
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-full sm:w-36 h-36 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0 relative group">
                                    <img
                                        src={asset.url}
                                        alt={currentAlt || "Asset thumbnail"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <button
                                            type="button"
                                            onClick={() => copyUrlToClipboard(asset.url)}
                                            className="px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[9px] text-gray-300 hover:text-white uppercase font-mono tracking-tighter"
                                            title="Copy full image URL"
                                        >
                                            {copiedUrl === asset.url ? "✓ Copied" : "📋 Copy"}
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                            isMissing ? "bg-amber-500/80 text-black font-bold" : "bg-emerald-500/80 text-black font-bold"
                                        }`}>
                                            {isMissing ? "Missing Alt" : "Optimized"}
                                        </span>
                                    </div>
                                </div>

                                {/* Content & Alt Editor */}
                                <div className="flex-1 min-w-0 space-y-3 w-full">
                                    {/* Header Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/5 text-[#c5a059] border border-white/10">
                                                {asset.category || "General"}
                                            </span>
                                            {asset.title && (
                                                <span className="text-xs font-bold text-white truncate max-w-sm">
                                                    {asset.title}
                                                </span>
                                            )}
                                        </div>

                                        {/* Usage Badges */}
                                        {asset.usedIn?.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-gray-400">
                                                <span>Used in:</span>
                                                {asset.usedIn.slice(0, 2).map((u, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                                                        {u.model}: {u.contextTitle || u.field}
                                                    </span>
                                                ))}
                                                {asset.usedIn.length > 2 && (
                                                    <span className="text-gray-500 font-mono">+{asset.usedIn.length - 2} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Alt Text Input Field */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <label className="font-black uppercase tracking-widest text-gray-400">
                                                Descriptive Alt Text (Google Image SEO &amp; Accessibility)
                                            </label>
                                            <span className={`font-mono ${
                                                charCount < 10 ? "text-amber-400" : charCount > 130 ? "text-gray-400" : "text-emerald-400"
                                            }`}>
                                                {charCount} / 125 chars
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                            <input
                                                type="text"
                                                value={currentAlt}
                                                onChange={(e) => handleAltChange(asset.url, e.target.value)}
                                                placeholder="Describe what is visible in the image naturally with relevant keywords..."
                                                className={`flex-1 bg-black/60 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                                                    isMissing ? "border-amber-500/40 focus:border-[#c5a059]" : "border-white/10 focus:border-[#c5a059]"
                                                }`}
                                            />

                                            <div className="flex items-center gap-2">
                                                {/* Smart AI Suggestion Button */}
                                                <button
                                                    type="button"
                                                    disabled={isSuggesting}
                                                    onClick={() => handleApplySuggestion(asset)}
                                                    className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                                    title="Generate smart, context-aware alt text suggestion"
                                                >
                                                    {isSuggesting ? (
                                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        <span>🤖</span>
                                                    )}
                                                    <span className="hidden sm:inline">Suggest Alt</span>
                                                </button>

                                                {/* Save Button */}
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => handleSaveAlt(asset)}
                                                    className="px-4 py-2.5 bg-[#c5a059] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                                >
                                                    {isSaving ? (
                                                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                    ) : (
                                                        <span>✓</span>
                                                    )}
                                                    <span>Save Alt</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Smart Suggestion Hint (if available and different from current) */}
                                    {asset.aiSuggestedAlt && asset.aiSuggestedAlt !== currentAlt && (
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                            <span className="text-[#c5a059] font-bold">Suggested:</span>
                                            <span className="truncate flex-1 italic text-gray-400">&ldquo;{asset.aiSuggestedAlt}&rdquo;</span>
                                            <button
                                                type="button"
                                                onClick={() => handleAltChange(asset.url, asset.aiSuggestedAlt)}
                                                className="text-[#c5a059] hover:underline uppercase font-black text-[9px] tracking-wider"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
