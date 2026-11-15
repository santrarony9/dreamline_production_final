"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import SectionEditor from "./SectionEditor";
import LivePreviewModal from "./LivePreviewModal";
import SectionRenderer from "@/components/page-builder/SectionRenderer";
import ImageUploader from "@/components/admin/ImageUploader";
import { normalizePageSlug, isValidPageSlug } from "@/lib/slug-utils";

const SITE_URL = "https://dreamlineproduction.com";

const SECTION_CATALOG = [
    { type: "hero", label: "Hero Banner", desc: "Cinematic full-height hero with headline, video/image bg, and CTA buttons", icon: "🎬" },
    { type: "image-banner", label: "Image Banner", desc: "Prominent keyframe with centered overlay messaging", icon: "🖼️" },
    { type: "text", label: "Editorial Text", desc: "Rich text narrative with headings, paragraphs, and blockquotes", icon: "✍️" },
    { type: "image-text", label: "Image & Text Split", desc: "2-column layout with photo and compelling narrative side-by-side", icon: "🌓" },
    { type: "full-width-image", label: "Full-Width Keyframe", desc: "Edge-to-edge panoramic photography with caption", icon: "🌄" },
    { type: "gallery", label: "Image Gallery", desc: "Responsive multi-image photography showcase grid", icon: "🏛️" },
    { type: "video", label: "Video Showcase", desc: "Embedded video player for YouTube, Vimeo, or direct 4K MP4", icon: "🎥" },
    { type: "services", label: "Services Cards", desc: "Interactive cards displaying specialized production services", icon: "🗂️" },
    { type: "portfolio", label: "Portfolio Grid", desc: "Showcase client projects with tags and zoom effects", icon: "✨" },
    { type: "testimonials", label: "Client Testimonials", desc: "Reviews, quotes, and 5-star ratings from past couples and brands", icon: "💬" },
    { type: "faq", label: "Interactive FAQ", desc: "Collapsible accordion addressing common questions", icon: "❓" },
    { type: "contact-form", label: "Inquiry Form", desc: "Direct booking form connected to studio consultation desk", icon: "✉️" },
    { type: "cta", label: "Call to Action", desc: "High-impact conversion banner with gold gradient and booking link", icon: "📢" },
    { type: "custom-html", label: "Custom HTML", desc: "Raw HTML block for Google Maps, widgets, or third-party embeds", icon: "💻" }
];

export default function VisualPageBuilder({ initialPage, onSaveSuccess, onCancel }) {
    const [page, setPage] = useState(initialPage || {
        title: "",
        slug: "",
        description: "",
        featuredImage: "",
        bannerImage: "",
        template: "default",
        status: "published",
        publishDate: new Date().toISOString().split('T')[0],
        design: {
            fontFamily: "Instrument Sans",
            headingFont: "Unbounded",
            backgroundColor: "#050505",
            textColor: "#ffffff",
            accentColor: "#c5a059",
            containerWidth: "max-w-7xl"
        },
        sections: [],
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
            navLabel: "",
            navOrder: 99,
            inFooter: false,
            footerLabel: ""
        }
    });

    const [originalSlug] = useState(initialPage?.slug || "");
    const [isSlugManual, setIsSlugManual] = useState(!!initialPage?.slug);
    const [activeTab, setActiveTab] = useState("builder"); // builder | settings | seo | design | nav
    const [editingSectionIndex, setEditingSectionIndex] = useState(null);
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Slug validation state
    const [slugStatus, setSlugStatus] = useState({
        checking: false,
        available: null,
        message: ""
    });

    const checkTimeoutRef = useRef(null);

    const checkAvailability = useCallback(async (slugToCheck, excludeId) => {
        if (!slugToCheck || !isValidPageSlug(slugToCheck)) {
            setSlugStatus({
                checking: false,
                available: false,
                message: "Slug must contain only lowercase letters, numbers, and hyphens (2-200 chars)."
            });
            return;
        }

        setSlugStatus(prev => ({ ...prev, checking: true }));

        try {
            const res = await axios.get(`/api/pages/check-slug?slug=${encodeURIComponent(slugToCheck)}&excludeId=${excludeId || ""}`);
            if (res.data.available) {
                setSlugStatus({
                    checking: false,
                    available: true,
                    message: `Available! Final URL: ${SITE_URL}/${res.data.slug}/`
                });
            } else {
                setSlugStatus({
                    checking: false,
                    available: false,
                    message: res.data.reason || "Slug is already taken."
                });
            }
        } catch (err) {
            setSlugStatus({
                checking: false,
                available: false,
                message: err.response?.data?.error || "Error checking slug."
            });
        }
    }, []);

    // Handle Title change: auto-generate slug if not manually detached
    const handleTitleChange = (newTitle) => {
        const updated = { ...page, title: newTitle };
        if (!isSlugManual) {
            const autoSlug = normalizePageSlug(newTitle);
            updated.slug = autoSlug;
            if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
            checkTimeoutRef.current = setTimeout(() => {
                checkAvailability(autoSlug, page._id);
            }, 400);
        }
        setPage(updated);
    };

    // Handle manual slug input
    const handleSlugInput = (e) => {
        setIsSlugManual(true);
        const cleanSlug = normalizePageSlug(e.target.value);
        setPage({ ...page, slug: cleanSlug });

        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = setTimeout(() => {
            checkAvailability(cleanSlug, page._id);
        }, 400);
    };

    // Regenerate from title
    const regenerateSlug = () => {
        if (!page.title) return;
        const autoSlug = normalizePageSlug(page.title);
        setIsSlugManual(false);
        setPage({ ...page, slug: autoSlug });
        checkAvailability(autoSlug, page._id);
    };

    // Section actions
    const addSection = (type) => {
        const sectionDef = SECTION_CATALOG.find(s => s.type === type);
        const newSec = {
            id: `sec-${Date.now()}`,
            type,
            order: (page.sections || []).length,
            visible: true,
            settings: {
                heading: sectionDef?.label || "New Section",
                subheading: "Dreamline Production",
                description: "Describe this section with engaging narrative copy.",
                alignment: "center",
                paddingTop: "py-24",
                paddingBottom: "py-24",
                items: type === "faq" ? [
                    { question: "What camera gear does Dreamline shoot on?", answer: "We shoot primarily on Sony FX6 cinema cameras paired with prime cine lenses and DJI Inspire drones." },
                    { question: "What is your booking timeline for Kolkata weddings?", answer: "We recommend booking 4 to 8 months in advance for peak wedding season dates." }
                ] : type === "services" ? [
                    { icon: "💍", title: "Luxury Wedding Cinema", description: "Documentary-grade cinematic wedding storytelling.", url: "/luxury/" },
                    { icon: "🚁", title: "Drone Videography", description: "DGCA-certified aerial photography across Kolkata.", url: "/services/drone-videography-kolkata/" },
                    { icon: "🎥", title: "Commercial Ad Films", description: "High-conversion commercials for brands and enterprises.", url: "/commercial/" }
                ] : []
            }
        };

        const updatedSections = [...(page.sections || []), newSec];
        setPage({ ...page, sections: updatedSections });
        setShowCatalogModal(false);
        setEditingSectionIndex(updatedSections.length - 1);
    };

    const duplicateSection = (index) => {
        const target = page.sections[index];
        if (!target) return;
        const clone = JSON.parse(JSON.stringify(target));
        clone.id = `sec-${Date.now()}`;
        clone.settings.heading = `${clone.settings.heading || "Section"} (Copy)`;

        const updatedSections = [...page.sections];
        updatedSections.splice(index + 1, 0, clone);
        setPage({ ...page, sections: updatedSections });
    };

    const deleteSection = (index) => {
        if (!confirm("Delete this section?")) return;
        const updated = page.sections.filter((_, i) => i !== index);
        setPage({ ...page, sections: updated });
        if (editingSectionIndex === index) setEditingSectionIndex(null);
    };

    const moveSection = (index, direction) => {
        const targetIdx = index + direction;
        if (targetIdx < 0 || targetIdx >= page.sections.length) return;
        const updated = [...page.sections];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIdx, 0, moved);
        setPage({ ...page, sections: updated });
    };

    const toggleSectionVisibility = (index) => {
        const updated = [...page.sections];
        updated[index].visible = updated[index].visible === false ? true : false;
        setPage({ ...page, sections: updated });
    };

    // Save Page
    const handleSave = async (forceStatus = null) => {
        if (!page.title?.trim()) {
            alert("Page title is required.");
            setActiveTab("settings");
            return;
        }

        const finalSlug = page.slug || normalizePageSlug(page.title);
        if (!isValidPageSlug(finalSlug)) {
            alert(`Invalid URL slug: "${finalSlug}". Must be lowercase alphanumeric characters separated by single hyphens.`);
            setActiveTab("settings");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...page,
                slug: finalSlug,
                status: forceStatus || page.status || "published"
            };

            let savedPage;
            if (page._id) {
                const res = await axios.put(`/api/pages/${page._id}`, payload);
                savedPage = res.data;
            } else {
                const res = await axios.post("/api/pages", payload);
                savedPage = res.data;
            }

            onSaveSuccess(savedPage);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error saving page.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation & Action Bar */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                        <span>←</span> Pages
                    </button>
                    <span className="text-gray-600">|</span>
                    <h2 className="text-base font-black uppercase text-white truncate max-w-sm">
                        {page.title || "Untitled New Page"}
                    </h2>
                </div>

                {/* Sub-Tabs: Builder, Settings, SEO, Design, Navigation */}
                <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-2xl p-1 overflow-x-auto">
                    {[
                        { id: "builder", label: "Visual Canvas", icon: "🧱" },
                        { id: "settings", label: "Page Settings", icon: "⚙️" },
                        { id: "seo", label: "SEO & Social", icon: "🔍" },
                        { id: "design", label: "Global Styling", icon: "🎨" },
                        { id: "nav", label: "Menu Links", icon: "🧭" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Save & Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreviewModal(true)}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#c5a059] border border-[#c5a059]/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                        <span>👁️</span> Preview
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave("draft")}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        Save Draft
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(page.status === "draft" ? "published" : page.status)}
                        className="px-6 py-2.5 bg-[#c5a059] text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20"
                    >
                        {saving ? "Saving..." : page._id ? "Update Page" : "Publish Page"}
                    </button>
                </div>
            </div>

            {/* 301 Permanent Redirect Notice if slug changed */}
            {originalSlug && page.slug && originalSlug !== page.slug && (
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-xs text-amber-200 leading-relaxed">
                        <p className="font-bold uppercase tracking-wider mb-1">
                            Page URL Modified: Automatic 301 Permanent Redirect Activated
                        </p>
                        <p className="text-amber-300/80">
                            Saving this page will automatically create a 301 redirect from <code className="text-white bg-black/40 px-1 py-0.5 rounded">/{originalSlug}/</code> to <code className="text-white bg-black/40 px-1 py-0.5 rounded">/{page.slug}/</code>. Backlinks, bookmark links, and search rankings are preserved.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB 1: VISUAL CANVAS BUILDER */}
            {activeTab === "builder" && (
                <div className="space-y-6">
                    {/* Sections Controls Header */}
                    <div className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                Page Sections ({page.sections?.length || 0})
                            </span>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                                Drag, reorder, and configure modular components
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCatalogModal(true)}
                            className="bg-[#c5a059] text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20 flex items-center gap-2"
                        >
                            <span>+</span> Add Section
                        </button>
                    </div>

                    {/* Section Cards List */}
                    {page.sections?.length === 0 ? (
                        <div className="bg-[#0a0a0a] border-2 border-dashed border-white/10 rounded-3xl p-16 text-center space-y-4">
                            <span className="text-4xl block">🧱</span>
                            <h3 className="text-lg font-bold text-white uppercase">Canvas is Empty</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                Start building this page by adding a Hero Banner, Image Banner, Services Cards, or Editorial Text.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCatalogModal(true)}
                                className="inline-block bg-[#c5a059] text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                            >
                                + Add First Section
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {page.sections.map((section, idx) => {
                                const sectionMeta = SECTION_CATALOG.find(s => s.type === section.type);
                                return (
                                    <div
                                        key={section.id || idx}
                                        className={`bg-[#0a0a0a] border rounded-2xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                            section.visible === false
                                                ? "border-white/5 opacity-50 bg-black/40"
                                                : "border-white/10 hover:border-[#c5a059]/40"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                                                {sectionMeta?.icon || "📄"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">
                                                        #{idx + 1}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white uppercase">
                                                        {section.settings?.heading || sectionMeta?.label || "Section"}
                                                    </h4>
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-400">
                                                        {section.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-light">
                                                    {section.settings?.description || section.settings?.subheading || "Configured section"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons for Section */}
                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => moveSection(idx, -1)}
                                                disabled={idx === 0}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 flex items-center justify-center text-xs font-bold"
                                                title="Move Up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSection(idx, 1)}
                                                disabled={idx === page.sections.length - 1}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 flex items-center justify-center text-xs font-bold"
                                                title="Move Down"
                                            >
                                                ▼
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleSectionVisibility(idx)}
                                                className="px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase"
                                                title="Toggle Visibility"
                                            >
                                                {section.visible === false ? "Hidden 👁️‍🗨️" : "Visible 👁️"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => duplicateSection(idx)}
                                                className="px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold uppercase"
                                                title="Duplicate Section"
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingSectionIndex(idx)}
                                                className="px-4 h-8 rounded-lg bg-[#c5a059] text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors"
                                            >
                                                Edit Content
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteSection(idx)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold"
                                                title="Delete"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: PAGE SETTINGS & SLUG MANAGEMENT */}
            {activeTab === "settings" && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10 space-y-8">
                    <div className="border-b border-white/5 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059] mb-1">
                            📄 Page Identity & URL Architecture
                        </h3>
                        <p className="text-xs text-gray-400">
                            Configure page titles, custom clean URL slugs, and publication dates
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                Page Title *
                            </label>
                            <input
                                type="text"
                                value={page.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="e.g. Drone Photography in Kolkata"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xl font-bold outline-none focus:border-[#c5a059]"
                                required
                            />
                        </div>

                        {/* Custom URL Slug */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1">
                                    🔗 Custom URL Slug (SEO-Friendly)
                                </label>
                                <button
                                    type="button"
                                    onClick={regenerateSlug}
                                    className="text-[9px] uppercase font-bold text-gray-400 hover:text-[#c5a059] transition-colors"
                                >
                                    🔄 Generate from Title
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#c5a059]">
                                    <span className="text-xs font-mono text-gray-500 select-none mr-1">
                                        /
                                    </span>
                                    <input
                                        type="text"
                                        value={page.slug || ""}
                                        onChange={handleSlugInput}
                                        placeholder="drone-photography-kolkata"
                                        className="w-full bg-transparent text-white font-mono text-sm outline-none"
                                        required
                                    />
                                    <span className="text-xs font-mono text-gray-500 select-none ml-1">
                                        /
                                    </span>
                                </div>
                            </div>

                            {/* Live URL Availability Feedback */}
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-400 truncate">
                                    {SITE_URL}/{page.slug || "slug"}/
                                </span>
                                <div>
                                    {slugStatus.checking ? (
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                                            ⏳ Validating...
                                        </span>
                                    ) : slugStatus.available === true ? (
                                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                            ✅ Available
                                        </span>
                                    ) : slugStatus.available === false ? (
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                            ❌ {slugStatus.message}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Page Description */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                Page Description (Overview)
                            </label>
                            <textarea
                                value={page.description || ""}
                                onChange={(e) => setPage({ ...page, description: e.target.value })}
                                placeholder="A brief description of this page..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                            />
                        </div>

                        {/* Publishing Status & Template */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                    Status
                                </label>
                                <select
                                    value={page.status || "published"}
                                    onChange={(e) => setPage({ ...page, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold uppercase outline-none focus:border-[#c5a059]"
                                >
                                    <option value="published" className="bg-[#111] text-green-400">🟢 Published (Public)</option>
                                    <option value="draft" className="bg-[#111] text-amber-400">🟡 Save as Draft (Private)</option>
                                    <option value="scheduled" className="bg-[#111] text-purple-400">🟣 Scheduled</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                    Publish Date
                                </label>
                                <input
                                    type="date"
                                    value={page.publishDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setPage({ ...page, publishDate: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                    Page Template
                                </label>
                                <select
                                    value={page.template || "default"}
                                    onChange={(e) => setPage({ ...page, template: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold uppercase outline-none focus:border-[#c5a059]"
                                >
                                    <option value="default" className="bg-[#111]">Default Luxury</option>
                                    <option value="fullwidth" className="bg-[#111]">Full-Width Canvas</option>
                                    <option value="landing" className="bg-[#111]">Lead Capture Landing</option>
                                    <option value="minimal" className="bg-[#111]">Minimalist</option>
                                </select>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                Featured / Hero Image Keyframe
                            </label>
                            <ImageUploader
                                currentImage={page.featuredImage || ""}
                                recommendedSize="1600x900px recommended"
                                onUploadSuccess={(url) => setPage({ ...page, featuredImage: url })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: INDEPENDENT SEO MANAGEMENT */}
            {activeTab === "seo" && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10 space-y-6">
                    <div className="border-b border-white/5 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059] mb-1">
                            🔍 Search Engine Optimization (SEO) Hub
                        </h3>
                        <p className="text-xs text-gray-400">
                            Configure meta tags, canonical links, Open Graph cards, and structured schema
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Meta Title */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                                    SEO Meta Title
                                </label>
                                <span className={`text-[10px] font-mono ${(page.seo?.title?.length || 0) > 60 ? "text-amber-400" : "text-gray-500"}`}>
                                    {page.seo?.title?.length || 0}/60 characters
                                </span>
                            </div>
                            <input
                                type="text"
                                value={page.seo?.title || ""}
                                onChange={(e) => setPage({
                                    ...page,
                                    seo: { ...page.seo, title: e.target.value }
                                })}
                                placeholder={page.title ? `${page.title} | Dreamline Production` : "e.g. Drone Photography in Kolkata | Dreamline"}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                            />
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                                    Meta Description
                                </label>
                                <span className={`text-[10px] font-mono ${(page.seo?.description?.length || 0) > 160 ? "text-amber-400" : "text-gray-500"}`}>
                                    {page.seo?.description?.length || 0}/160 characters
                                </span>
                            </div>
                            <textarea
                                value={page.seo?.description || ""}
                                onChange={(e) => setPage({
                                    ...page,
                                    seo: { ...page.seo, description: e.target.value }
                                })}
                                placeholder="Enter compelling description for search engine results..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                            />
                        </div>

                        {/* Google SERP Card */}
                        <div className="bg-[#151515] border border-white/10 rounded-2xl p-5 space-y-1.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] mb-2">
                                Google Search Result Snippet Preview
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                                https://dreamlineproduction.com › {page.slug || "slug"}
                            </p>
                            <p className="text-base text-[#8ab4f8] font-medium line-clamp-1">
                                {page.seo?.title || page.title || "Page Title | Dreamline Production"}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {page.seo?.description || page.description || "Discover luxury wedding cinematography and high-end commercial video production in Kolkata."}
                            </p>
                        </div>

                        {/* Canonical & OG Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
                                    Canonical URL (Optional Override)
                                </label>
                                <input
                                    type="text"
                                    value={page.seo?.canonicalUrl || ""}
                                    onChange={(e) => setPage({
                                        ...page,
                                        seo: { ...page.seo, canonicalUrl: e.target.value }
                                    })}
                                    placeholder={`Default: ${SITE_URL}/${page.slug || "slug"}/`}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
                                    Social Sharing Image (OG Image)
                                </label>
                                <input
                                    type="text"
                                    value={page.seo?.ogImage || ""}
                                    onChange={(e) => setPage({
                                        ...page,
                                        seo: { ...page.seo, ogImage: e.target.value }
                                    })}
                                    placeholder="Defaults to Featured Image if empty"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none"
                                />
                            </div>
                        </div>

                        {/* Indexing Checkboxes */}
                        <div className="pt-4 border-t border-white/5 flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!page.seo?.noIndex}
                                    onChange={(e) => setPage({
                                        ...page,
                                        seo: { ...page.seo, noIndex: !e.target.checked }
                                    })}
                                    className="rounded border-white/20 text-[#c5a059] focus:ring-0"
                                />
                                <span className="text-xs text-gray-300">Allow Search Engines to Index (index)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!page.seo?.noFollow}
                                    onChange={(e) => setPage({
                                        ...page,
                                        seo: { ...page.seo, noFollow: !e.target.checked }
                                    })}
                                    className="rounded border-white/20 text-[#c5a059] focus:ring-0"
                                />
                                <span className="text-xs text-gray-300">Allow Search Engines to Follow Links (follow)</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: GLOBAL PAGE STYLING */}
            {activeTab === "design" && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10 space-y-6">
                    <div className="border-b border-white/5 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059] mb-1">
                            🎨 Page Theme & Custom Styling
                        </h3>
                        <p className="text-xs text-gray-400">
                            Customize page-specific color palette, typography, and container width
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                Background Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={page.design?.backgroundColor || "#050505"}
                                    onChange={(e) => setPage({
                                        ...page,
                                        design: { ...page.design, backgroundColor: e.target.value }
                                    })}
                                    className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={page.design?.backgroundColor || "#050505"}
                                    onChange={(e) => setPage({
                                        ...page,
                                        design: { ...page.design, backgroundColor: e.target.value }
                                    })}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                Accent Color (Gold Highlight)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={page.design?.accentColor || "#c5a059"}
                                    onChange={(e) => setPage({
                                        ...page,
                                        design: { ...page.design, accentColor: e.target.value }
                                    })}
                                    className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={page.design?.accentColor || "#c5a059"}
                                    onChange={(e) => setPage({
                                        ...page,
                                        design: { ...page.design, accentColor: e.target.value }
                                    })}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                Content Container Width
                            </label>
                            <select
                                value={page.design?.containerWidth || "max-w-7xl"}
                                onChange={(e) => setPage({
                                    ...page,
                                    design: { ...page.design, containerWidth: e.target.value }
                                })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none"
                            >
                                <option value="max-w-5xl" className="bg-[#111]">Narrow (max-w-5xl)</option>
                                <option value="max-w-7xl" className="bg-[#111]">Standard Luxury (max-w-7xl)</option>
                                <option value="max-w-full" className="bg-[#111]">Full-Bleed Edge to Edge</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: NAVIGATION & MENU INTEGRATION */}
            {activeTab === "nav" && (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10 space-y-6">
                    <div className="border-b border-white/5 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059] mb-1">
                            🧭 Website Navigation & Menu Management
                        </h3>
                        <p className="text-xs text-gray-400">
                            Choose whether this page should be linked in the header navigation or footer
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!page.navigation?.inNavbar}
                                    onChange={(e) => setPage({
                                        ...page,
                                        navigation: { ...page.navigation, inNavbar: e.target.checked }
                                    })}
                                    className="rounded border-white/20 text-[#c5a059] focus:ring-0 w-4 h-4"
                                />
                                <div>
                                    <span className="text-xs font-bold text-white uppercase block">
                                        Add to Top Header Navigation Bar
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        When checked, this page will be linked in the desktop & mobile navigation.
                                    </span>
                                </div>
                            </label>

                            {page.navigation?.inNavbar && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                                    <div>
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                            Menu Item Label
                                        </label>
                                        <input
                                            type="text"
                                            value={page.navigation?.navLabel || ""}
                                            onChange={(e) => setPage({
                                                ...page,
                                                navigation: { ...page.navigation, navLabel: e.target.value }
                                            })}
                                            placeholder={page.title ? page.title.toUpperCase() : "DRONE"}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                            Menu Position (Order)
                                        </label>
                                        <input
                                            type="number"
                                            value={page.navigation?.navOrder || 10}
                                            onChange={(e) => setPage({
                                                ...page,
                                                navigation: { ...page.navigation, navOrder: parseInt(e.target.value) || 10 }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!page.navigation?.inFooter}
                                    onChange={(e) => setPage({
                                        ...page,
                                        navigation: { ...page.navigation, inFooter: e.target.checked }
                                    })}
                                    className="rounded border-white/20 text-[#c5a059] focus:ring-0 w-4 h-4"
                                />
                                <div>
                                    <span className="text-xs font-bold text-white uppercase block">
                                        Add to Footer Navigation Links
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        When checked, this page will be displayed in the website footer link list.
                                    </span>
                                </div>
                            </label>

                            {page.navigation?.inFooter && (
                                <div className="pt-3 border-t border-white/5">
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                        Footer Link Label
                                    </label>
                                    <input
                                        type="text"
                                        value={page.navigation?.footerLabel || ""}
                                        onChange={(e) => setPage({
                                            ...page,
                                            navigation: { ...page.navigation, footerLabel: e.target.value }
                                        })}
                                        placeholder={page.title || "Custom Link"}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Catalog Modal: Select Section to Add */}
            {showCatalogModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[260] flex items-center justify-center p-4">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-base font-black uppercase tracking-tight text-white">
                                    Add Section to Page
                                </h3>
                                <p className="text-xs text-gray-400">Select a section component to insert</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCatalogModal(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold"
                            >
                                Cancel ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 overflow-y-auto mt-4 custom-scrollbar">
                            {SECTION_CATALOG.map((sec) => (
                                <button
                                    key={sec.type}
                                    type="button"
                                    onClick={() => addSection(sec.type)}
                                    className="bg-white/5 hover:bg-[#c5a059]/10 border border-white/10 hover:border-[#c5a059]/50 rounded-2xl p-5 text-left transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <span className="text-3xl block mb-3">{sec.icon}</span>
                                        <h4 className="text-xs font-bold uppercase text-white group-hover:text-[#c5a059] transition-colors mb-1.5">
                                            {sec.label}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                                            {sec.desc}
                                        </p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] mt-4 block">
                                        + Add Section
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Section Editor Drawer */}
            {editingSectionIndex !== null && page.sections[editingSectionIndex] && (
                <SectionEditor
                    section={page.sections[editingSectionIndex]}
                    onUpdate={(updatedSec) => {
                        const updatedSections = [...page.sections];
                        updatedSections[editingSectionIndex] = updatedSec;
                        setPage({ ...page, sections: updatedSections });
                    }}
                    onClose={() => setEditingSectionIndex(null)}
                />
            )}

            {/* Responsive Live Preview Modal */}
            {showPreviewModal && (
                <LivePreviewModal
                    page={page}
                    onClose={() => setShowPreviewModal(false)}
                />
            )}
        </div>
    );
}
