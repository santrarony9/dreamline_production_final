"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import VisualPageBuilder from "@/components/admin/page-builder/VisualPageBuilder";
import LivePreviewModal from "@/components/admin/page-builder/LivePreviewModal";

const SITE_URL = "https://dreamlineproduction.com";

export default function PagesAdmin() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | published | draft | scheduled
    const [templateFilter, setTemplateFilter] = useState("all");

    // Builder mode state
    const [builderPage, setBuilderPage] = useState(null); // null when viewing list, object when building
    const [previewModalPage, setPreviewModalPage] = useState(null);
    const [deleteModalPage, setDeleteModalPage] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [copiedSlug, setCopiedSlug] = useState("");

    useEffect(() => {
        fetchPages();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 4000);
    };

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/pages");
            setPages(res.data || []);
        } catch (err) {
            console.error("Error fetching pages:", err);
            showToast("Failed to load pages. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewPage = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        setBuilderPage({
            title: "",
            slug: "",
            description: "",
            featuredImage: "",
            bannerImage: "",
            template: "default",
            status: "published",
            publishDate: todayStr,
            author: "Dreamline Studio",
            design: {
                fontFamily: "Instrument Sans",
                headingFont: "Unbounded",
                backgroundColor: "#050505",
                textColor: "#ffffff",
                accentColor: "#c5a059",
                containerWidth: "max-w-7xl"
            },
            sections: [
                {
                    id: "hero-" + Date.now(),
                    type: "hero",
                    order: 0,
                    visible: true,
                    settings: {
                        heading: "Cinematic Visuals in Kolkata",
                        subheading: "Luxury Films & Commercial Storytelling",
                        badge: "NEW PAGE",
                        description: "Crafting extraordinary cinematic narratives, aerial visuals, and commercial films across Kolkata and pan-India.",
                        buttons: [
                            { label: "EXPLORE SERVICES", url: "/services/", style: "gold" },
                            { label: "CONTACT STUDIO", url: "/contact/", style: "outline" }
                        ],
                        backgroundColor: "#050505",
                        alignment: "center",
                        paddingTop: "py-28",
                        paddingBottom: "py-20"
                    }
                }
            ],
            seo: {
                title: "",
                description: "",
                keywords: "",
                canonicalUrl: "",
                ogTitle: "",
                ogDescription: "",
                ogImage: "",
                ogImageAlt: "",
                noIndex: false,
                noFollow: false,
                structuredDataType: "WebPage"
            },
            navigation: {
                inNavbar: false,
                inFooter: false,
                navLabel: "",
                navOrder: 99
            }
        });
    };

    const handleEditPage = (page) => {
        setBuilderPage(page);
    };

    const handleSaveSuccess = (savedPage) => {
        setBuilderPage(null);
        showToast(`Page "${savedPage.title}" saved successfully!`);
        fetchPages();
    };

    const handleDuplicatePage = async (page) => {
        setActionLoadingId(page._id);
        try {
            const res = await axios.post("/api/pages/duplicate", { id: page._id });
            showToast(`Duplicated "${page.title}" to draft copy.`);
            await fetchPages();
            if (res.data?.page) {
                setBuilderPage(res.data.page);
            }
        } catch (err) {
            console.error("Duplicate error:", err);
            showToast(err.response?.data?.error || "Failed to duplicate page.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleStatus = async (page) => {
        setActionLoadingId(page._id);
        const newStatus = page.status === "published" ? "draft" : "published";
        try {
            await axios.put(`/api/pages/${page._id}`, {
                ...page,
                status: newStatus
            });
            showToast(`Page status changed to ${newStatus.toUpperCase()}`);
            fetchPages();
        } catch (err) {
            console.error("Status toggle error:", err);
            showToast("Failed to update page status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeletePage = async () => {
        if (!deleteModalPage) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/pages/${deleteModalPage._id}`);
            showToast(`Page "${deleteModalPage.title}" deleted.`);
            setDeleteModalPage(null);
            fetchPages();
        } catch (err) {
            console.error("Delete error:", err);
            showToast("Failed to delete page.");
        } finally {
            setIsDeleting(false);
        }
    };

    const copyUrlToClipboard = (slug) => {
        const fullUrl = `${SITE_URL}/${slug}/`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(""), 2000);
            showToast("Page URL copied to clipboard!");
        }
    };

    // Filter pages
    const filteredPages = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return pages.filter(p => {
            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (p.title || "").toLowerCase().includes(q);
                const matchSlug = (p.slug || "").toLowerCase().includes(q);
                const matchDesc = (p.description || "").toLowerCase().includes(q);
                if (!matchTitle && !matchSlug && !matchDesc) return false;
            }

            // Status filter
            if (statusFilter === "published") {
                if (p.status !== "published" || (p.publishDate && p.publishDate > todayStr)) return false;
            } else if (statusFilter === "draft") {
                if (p.status !== "draft") return false;
            } else if (statusFilter === "scheduled") {
                const isScheduled = p.status === "scheduled" || (p.publishDate && p.publishDate > todayStr && p.status !== "draft");
                if (!isScheduled) return false;
            }

            // Template filter
            if (templateFilter !== "all") {
                if (p.template !== templateFilter) return false;
            }

            return true;
        });
    }, [pages, searchQuery, statusFilter, templateFilter]);

    // Statistics
    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        let published = 0;
        let draft = 0;
        let scheduled = 0;

        pages.forEach(p => {
            if (p.status === "draft") {
                draft++;
            } else if (p.status === "scheduled" || (p.publishDate && p.publishDate > todayStr)) {
                scheduled++;
            } else {
                published++;
            }
        });

        return { total: pages.length, published, draft, scheduled };
    }, [pages]);

    // If builder is active, render VisualPageBuilder full view
    if (builderPage) {
        return (
            <VisualPageBuilder
                initialPage={builderPage}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => setBuilderPage(null)}
            />
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-[#141414] border border-[#c5a059]/40 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header with Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📑</span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
                            Website Pages <span className="text-[#c5a059]">&amp; Builder</span>
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                        Design, configure, and publish unlimited custom landing pages, service showcases, and visual campaigns. Fully customized from the admin visual builder.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchPages}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center gap-2"
                        title="Reload page catalog"
                    >
                        <span>🔄</span>
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleCreateNewPage}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:from-[#d4b068] hover:to-[#ebd089] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_35px_rgba(197,160,89,0.5)] flex items-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                        <span className="text-base font-black leading-none">+</span>
                        <span>Create New Page</span>
                    </button>
                </div>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-500 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Pages</span>
                        <span className="text-sm">📚</span>
                    </div>
                    <p className="text-3xl font-black text-white font-heading">{stats.total}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Managed dynamically</p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-emerald-500 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Published</span>
                        <span className="text-sm">🟢</span>
                    </div>
                    <p className="text-3xl font-black text-white font-heading">{stats.published}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Accessible at public URLs</p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-blue-400 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Scheduled</span>
                        <span className="text-sm">⏱️</span>
                    </div>
                    <p className="text-3xl font-black text-white font-heading">{stats.scheduled}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Future publication dates</p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-amber-500 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">Drafts</span>
                        <span className="text-sm">📝</span>
                    </div>
                    <p className="text-3xl font-black text-white font-heading">{stats.draft}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Private &amp; unpublished</p>
                </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
                        {[
                            { id: "all", label: "All Pages", count: stats.total },
                            { id: "published", label: "Published", count: stats.published },
                            { id: "scheduled", label: "Scheduled", count: stats.scheduled },
                            { id: "draft", label: "Drafts", count: stats.draft }
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

                    {/* Template Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black hidden sm:inline">Template:</span>
                        <select
                            value={templateFilter}
                            onChange={(e) => setTemplateFilter(e.target.value)}
                            className="bg-black/60 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:border-[#c5a059] focus:outline-none"
                        >
                            <option value="all">All Templates</option>
                            <option value="default">Standard Studio</option>
                            <option value="blank">Blank Canvas</option>
                            <option value="landing">Conversion Landing Page</option>
                            <option value="service">Service Showcase</option>
                            <option value="story">Editorial Narrative</option>
                        </select>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pages by title, URL slug, or description..."
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

            {/* Pages Catalog Listing */}
            {loading ? (
                <div className="p-16 text-center bg-[#0a0a0a] border border-white/5 rounded-2xl">
                    <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Loading Custom Pages...</p>
                </div>
            ) : filteredPages.length === 0 ? (
                <div className="p-16 text-center bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                    <span className="text-4xl block">📄</span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-heading">
                        {pages.length === 0 ? "No Custom Pages Created Yet" : "No Matching Pages Found"}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        {pages.length === 0
                            ? "Launch your first custom page with our visual builder. Build hero sections, portfolio galleries, testimonials, and SEO metadata with no code."
                            : "Try adjusting your search query or status filter to see other custom pages."}
                    </p>
                    {pages.length === 0 && (
                        <button
                            type="button"
                            onClick={handleCreateNewPage}
                            className="px-6 py-3 bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg"
                        >
                            + Build Your First Page
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredPages.map((page) => {
                        const isPublished = page.status === "published";
                        const isScheduled = page.status === "scheduled" || (page.publishDate && new Date(page.publishDate) > new Date());
                        const fullPublicUrl = `${SITE_URL}/${page.slug}/`;
                        const sectionCount = page.sections?.length || 0;
                        const hasAliases = (page.aliases && page.aliases.length > 0) || (page.redirectHistory && page.redirectHistory.length > 0);

                        return (
                            <div
                                key={page._id}
                                className="bg-[#0a0a0a] border border-white/5 hover:border-white/15 rounded-2xl p-5 md:p-6 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                            >
                                {/* Left Info Block */}
                                <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex-shrink-0 relative group-hover:border-[#c5a059]/40 transition-colors">
                                        {page.featuredImage || page.bannerImage ? (
                                            <img
                                                src={page.featuredImage || page.bannerImage}
                                                alt={page.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-black p-2 text-center">
                                                <span className="text-xl">🏛️</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">Dreamline</span>
                                            </div>
                                        )}
                                        <div className="absolute top-1 right-1">
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#c5a059] font-black uppercase tracking-tighter">
                                                {sectionCount} {sectionCount === 1 ? 'sec' : 'secs'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Text Info */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Status Badge */}
                                            {isScheduled ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                                    Scheduled ({page.publishDate})
                                                </span>
                                            ) : isPublished ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                                    Draft
                                                </span>
                                            )}

                                            {/* Template Badge */}
                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10">
                                                {page.template || "default"}
                                            </span>

                                            {/* Navigation Badges */}
                                            {page.navigation?.inNavbar && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                                    🧭 In Header Nav
                                                </span>
                                            )}
                                            {page.navigation?.inFooter && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                                    ⚓ In Footer
                                                </span>
                                            )}

                                            {/* 301 Redirects Badge */}
                                            {hasAliases && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" title="Has 301 redirect history">
                                                    ↪️ 301 Active
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors truncate">
                                            {page.title}
                                        </h2>

                                        {/* URL Bar */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <div className="inline-flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-[11px] text-gray-300 max-w-full overflow-hidden">
                                                <span className="text-[#c5a059]">/{page.slug}/</span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyUrlToClipboard(page.slug)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                    title="Copy public URL"
                                                >
                                                    {copiedSlug === page.slug ? "✓ Copied" : "📋"}
                                                </button>
                                            </div>

                                            {isPublished && (
                                                <a
                                                    href={`/${page.slug}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] text-[#c5a059] hover:text-white transition-colors uppercase font-bold tracking-wider"
                                                >
                                                    <span>Open Live</span>
                                                    <span>↗</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Metadata Footer */}
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 pt-1">
                                            <span>Author: <strong className="text-gray-400">{page.author || "Dreamline"}</strong></span>
                                            <span>•</span>
                                            <span>Updated: <strong className="text-gray-400">{new Date(page.updatedAt || page.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</strong></span>
                                            {page.seo?.title && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[200px]" title={page.seo.title}>SEO: {page.seo.title}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center justify-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                    {/* Edit in Visual Builder */}
                                    <button
                                        type="button"
                                        onClick={() => handleEditPage(page)}
                                        className="px-4 py-2.5 bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:from-[#d4b068] hover:to-[#ebd089] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                        title="Open in Visual Builder"
                                    >
                                        <span>🛠️</span>
                                        <span>Edit Builder</span>
                                    </button>

                                    {/* Preview Modal */}
                                    <button
                                        type="button"
                                        onClick={() => setPreviewModalPage(page)}
                                        className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
                                        title="Preview Responsive Layout (Desktop/Tablet/Mobile)"
                                    >
                                        <span>👁️</span>
                                        <span className="hidden sm:inline">Preview</span>
                                    </button>

                                    {/* Toggle Publish / Draft */}
                                    <button
                                        type="button"
                                        disabled={actionLoadingId === page._id}
                                        onClick={() => handleToggleStatus(page)}
                                        className={`px-3 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all flex items-center gap-1.5 ${
                                            isPublished
                                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        }`}
                                        title={isPublished ? "Unpublish to draft" : "Publish now"}
                                    >
                                        {actionLoadingId === page._id ? (
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <span>{isPublished ? "Unpublish" : "Publish"}</span>
                                        )}
                                    </button>

                                    {/* Duplicate */}
                                    <button
                                        type="button"
                                        disabled={actionLoadingId === page._id}
                                        onClick={() => handleDuplicatePage(page)}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-xl border border-white/10 transition-all"
                                        title="Duplicate page as new draft"
                                    >
                                        📑
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => setDeleteModalPage(page)}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl border border-red-500/20 transition-all"
                                        title="Delete custom page"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Live Preview Modal */}
            {previewModalPage && (
                <LivePreviewModal
                    page={previewModalPage}
                    onClose={() => setPreviewModalPage(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalPage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
                        <div className="flex items-center gap-3 text-red-400">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-lg font-black uppercase tracking-wider font-heading">
                                Delete Custom Page?
                            </h3>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            Are you sure you want to permanently delete <strong className="text-white">&ldquo;{deleteModalPage.title}&rdquo;</strong>?
                        </p>

                        <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1 text-[11px] text-red-300">
                            <p>• URL <code className="text-white font-mono">/{deleteModalPage.slug}/</code> will return 404.</p>
                            <p>• Associated 301 redirects and navigation links will be removed.</p>
                            <p>• This action cannot be undone.</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteModalPage(null)}
                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-black uppercase tracking-wider rounded-xl border border-white/10 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeletePage}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete Permanently</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
