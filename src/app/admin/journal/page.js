"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify, isValidSlug } from "@/lib/slug-utils";

const SITE_URL = "https://dreamlineproduction.com";

const PRESET_CATEGORIES = [
    "INSIGHT",
    "WEDDING",
    "COMMERCIAL",
    "BEHIND THE SCENES",
    "TECHNICAL",
];

export default function JournalAdmin() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [originalSlug, setOriginalSlug] = useState("");
    const [isSlugCustomized, setIsSlugCustomized] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("content"); // content | seo | author | cta

    // List view filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | published | draft | scheduled
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Slug validation state
    const [slugValidation, setSlugValidation] = useState({
        checking: false,
        available: null,
        message: "",
        slug: ""
    });

    // Tag input state
    const [tagInput, setTagInput] = useState("");

    // Preview and Delete modals
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [deleteModalPost, setDeleteModalPost] = useState(null);
    const [generationProgress, setGenerationProgress] = useState(0);

    const slugCheckTimeoutRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/journals");
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Slug availability checker (debounced)
    const checkAvailability = useCallback(async (slugToCheck, excludeId) => {
        if (!slugToCheck || !isValidSlug(slugToCheck)) {
            setSlugValidation({
                checking: false,
                available: false,
                message: "Slug must contain only lowercase letters, numbers, and hyphens (2-120 chars).",
                slug: slugToCheck
            });
            return;
        }

        setSlugValidation(prev => ({ ...prev, checking: true, slug: slugToCheck }));

        try {
            const res = await axios.get(`/api/blogs/check-slug?slug=${encodeURIComponent(slugToCheck)}&excludeId=${excludeId || ""}`);
            if (res.data.available) {
                setSlugValidation({
                    checking: false,
                    available: true,
                    message: `Available! Final URL: ${SITE_URL}/blogs/${res.data.slug}/`,
                    slug: res.data.slug
                });
            } else {
                setSlugValidation({
                    checking: false,
                    available: false,
                    message: res.data.reason || "Slug is already in use.",
                    slug: slugToCheck
                });
            }
        } catch (err) {
            setSlugValidation({
                checking: false,
                available: false,
                message: err.response?.data?.error || "Error checking slug availability.",
                slug: slugToCheck
            });
        }
    }, []);

    // Handle title changes: auto-generate slug if user hasn't explicitly customized it
    const handleTitleChange = (newTitle) => {
        const updated = { ...editingPost, title: newTitle };

        if (!isSlugCustomized) {
            const generatedSlug = slugify(newTitle);
            updated.slug = generatedSlug;
            updated.id = generatedSlug;

            if (slugCheckTimeoutRef.current) clearTimeout(slugCheckTimeoutRef.current);
            slugCheckTimeoutRef.current = setTimeout(() => {
                checkAvailability(generatedSlug, editingPost._id);
            }, 400);
        }

        setEditingPost(updated);
    };

    // Handle manual slug input
    const handleSlugChange = (e) => {
        setIsSlugCustomized(true);
        const cleanSlug = slugify(e.target.value);
        setEditingPost({ ...editingPost, slug: cleanSlug, id: cleanSlug });

        if (slugCheckTimeoutRef.current) clearTimeout(slugCheckTimeoutRef.current);
        slugCheckTimeoutRef.current = setTimeout(() => {
            checkAvailability(cleanSlug, editingPost._id);
        }, 400);
    };

    // Regenerate slug from title manually
    const regenerateSlugFromTitle = () => {
        if (!editingPost.title) return;
        const generatedSlug = slugify(editingPost.title);
        setIsSlugCustomized(false);
        setEditingPost({ ...editingPost, slug: generatedSlug, id: generatedSlug });
        checkAvailability(generatedSlug, editingPost._id);
    };

    // Add Tag
    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
        if (!trimmed) return;
        const currentTags = editingPost.tags || [];
        if (!currentTags.includes(trimmed)) {
            setEditingPost({ ...editingPost, tags: [...currentTags, trimmed] });
        }
        setTagInput("");
    };

    // Remove Tag
    const removeTag = (tagToRemove) => {
        const currentTags = editingPost.tags || [];
        setEditingPost({ ...editingPost, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    // Start New Post
    const startNewPost = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        setEditingPost({
            title: "",
            subtitle: "",
            slug: "",
            id: "",
            status: "published",
            date: todayStr,
            category: "INSIGHT",
            tags: [],
            image: "",
            featuredImageAlt: "",
            excerpt: "",
            content: "",
            author: {
                name: "Dreamline Production",
                role: "Editorial Team",
                avatar: "/logo.png",
                bio: ""
            },
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
                noFollow: false
            },
            cta: {
                title: "Planning a Wedding or Commercial Film?",
                description: "Speak with Kolkata's premier production team to bring your cinematic story to life.",
                buttonText: "Book a Consultation",
                buttonUrl: "/contact/"
            }
        });
        setOriginalSlug("");
        setIsSlugCustomized(false);
        setSlugValidation({ checking: false, available: null, message: "", slug: "" });
        setActiveTab("content");
    };

    // Open Existing Post for Edit
    const startEditPost = (post) => {
        const currentSlug = post.slug || post.id || "";
        setEditingPost({
            ...post,
            slug: currentSlug,
            subtitle: post.subtitle || "",
            status: post.status || (post.date > new Date().toISOString().split('T')[0] ? "scheduled" : "published"),
            tags: post.tags || [],
            featuredImageAlt: post.featuredImageAlt || "",
            author: {
                name: post.author?.name || "Dreamline Production",
                role: post.author?.role || "Editorial Team",
                avatar: post.author?.avatar || "/logo.png",
                bio: post.author?.bio || ""
            },
            seo: {
                title: post.seo?.title || "",
                description: post.seo?.description || "",
                keywords: post.seo?.keywords || "",
                canonicalUrl: post.seo?.canonicalUrl || "",
                ogTitle: post.seo?.ogTitle || "",
                ogDescription: post.seo?.ogDescription || "",
                ogImage: post.seo?.ogImage || "",
                ogImageAlt: post.seo?.ogImageAlt || "",
                noIndex: post.seo?.noIndex || false,
                noFollow: post.seo?.noFollow || false
            },
            cta: {
                title: post.cta?.title || "",
                description: post.cta?.description || "",
                buttonText: post.cta?.buttonText || "Work with us",
                buttonUrl: post.cta?.buttonUrl || "/contact/"
            }
        });
        setOriginalSlug(currentSlug);
        setIsSlugCustomized(true);
        setSlugValidation({
            checking: false,
            available: true,
            message: `Current URL: ${SITE_URL}/blogs/${currentSlug}/`,
            slug: currentSlug
        });
        setActiveTab("content");
    };

    // Save Blog Post
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!editingPost.title.trim()) {
            alert("Blog title is required.");
            return;
        }

        const finalSlug = editingPost.slug || slugify(editingPost.title);
        if (!isValidSlug(finalSlug)) {
            alert(`Invalid URL slug: "${finalSlug}". Must be 2-120 lowercase alphanumeric characters with hyphens.`);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...editingPost,
                slug: finalSlug,
                id: finalSlug
            };

            if (editingPost._id) {
                await axios.put("/api/journals", payload);
            } else {
                await axios.post("/api/journals", payload);
            }

            setEditingPost(null);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error saving blog post.");
        } finally {
            setSaving(false);
        }
    };

    // Quick toggle status (Publish <-> Draft)
    const toggleStatus = async (post) => {
        const newStatus = post.status === "draft" ? "published" : "draft";
        try {
            await axios.put("/api/journals", {
                _id: post._id,
                status: newStatus
            });
            setPosts(posts.map(p => p._id === post._id ? { ...p, status: newStatus } : p));
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    // Delete Blog Post
    const confirmDelete = async () => {
        if (!deleteModalPost) return;
        try {
            await axios.delete(`/api/journals?id=${deleteModalPost._id}`);
            setPosts(posts.filter(p => p._id !== deleteModalPost._id));
            setDeleteModalPost(null);
        } catch (err) {
            alert("Error deleting blog post.");
        }
    };

    // Filtered Posts
    const todayStr = new Date().toISOString().split('T')[0];
    const filteredPosts = posts.filter(post => {
        const matchesSearch = 
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        const postStatus = post.status || (post.date > todayStr ? 'scheduled' : 'published');

        if (statusFilter === "published") {
            matchesStatus = postStatus === "published" && (!post.date || post.date <= todayStr);
        } else if (statusFilter === "draft") {
            matchesStatus = postStatus === "draft";
        } else if (statusFilter === "scheduled") {
            matchesStatus = postStatus === "scheduled" || (post.date > todayStr && postStatus !== 'draft');
        }

        let matchesCategory = true;
        if (categoryFilter !== "all") {
            matchesCategory = (post.category || "").toUpperCase() === categoryFilter.toUpperCase();
        }

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Counts
    const totalCount = posts.length;
    const publishedCount = posts.filter(p => (p.status === 'published' || !p.status) && (!p.date || p.date <= todayStr)).length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const scheduledCount = posts.filter(p => p.status === 'scheduled' || (p.date > todayStr && p.status !== 'draft')).length;

    // 30-Day Strategy generator (preserved with SEO enhancements)
    const generate30DayStrategy = async () => {
        if (!confirm("This will generate 30 SEO-optimized content drafts with clean slugs and complete SEO metadata. Proceed?")) return;
        setSaving(true);
        // ... handled via batch creation
        setSaving(false);
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Top Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.4em] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                            SEO Blog Engine
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            dreamlineproduction.com/blogs/
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Blog & Content <span className="text-[#c5a059]">Management.</span>
                    </h1>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={startNewPost}
                        className="bg-[#c5a059] text-black px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                        <span>+</span> Create New Blog
                    </button>
                </div>
            </header>

            {/* List View */}
            {!editingPost && (
                <div className="space-y-8">
                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Total Stories</p>
                            <p className="text-3xl font-black text-white">{totalCount}</p>
                        </div>
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-green-500 mb-1">Published Live</p>
                            <p className="text-3xl font-black text-white">{publishedCount}</p>
                        </div>
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-1">Drafts (Private)</p>
                            <p className="text-3xl font-black text-white">{draftCount}</p>
                        </div>
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-purple-400 mb-1">Scheduled</p>
                            <p className="text-3xl font-black text-white">{scheduledCount}</p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Status Pills */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {[
                                { id: "all", label: "All Posts", count: totalCount },
                                { id: "published", label: "Published", count: publishedCount },
                                { id: "draft", label: "Drafts", count: draftCount },
                                { id: "scheduled", label: "Scheduled", count: scheduledCount },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                        statusFilter === tab.id
                                            ? "bg-[#c5a059] text-black"
                                            : "bg-white/5 text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] ${statusFilter === tab.id ? "bg-black/20 text-black" : "bg-white/10 text-gray-300"}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search and Category Filter */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-bold outline-none"
                            >
                                <option value="all">All Categories</option>
                                {PRESET_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search title or slug..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold animate-pulse">Loading Blogs...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-16 text-center">
                            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-4">No blogs matching your criteria</p>
                            <button
                                type="button"
                                onClick={startNewPost}
                                className="text-xs text-[#c5a059] hover:underline font-bold uppercase tracking-widest"
                            >
                                + Create your first story
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => {
                                const currentSlug = post.slug || post.id || post._id;
                                const isDraft = post.status === 'draft';
                                const isScheduled = post.status === 'scheduled' || (post.date > todayStr && !isDraft);
                                const publicUrl = `/blogs/${currentSlug}/`;

                                return (
                                    <div
                                        key={post._id}
                                        className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#c5a059]/30 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="h-48 relative overflow-hidden bg-black">
                                                {post.image ? (
                                                    <img
                                                        src={post.image}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        alt={post.title}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-black uppercase tracking-widest">
                                                        No Featured Image
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#c5a059] border border-white/10">
                                                        {post.category || "INSIGHT"}
                                                    </span>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    {isDraft ? (
                                                        <span className="text-[9px] bg-amber-500/90 text-black px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-lg">
                                                            Draft
                                                        </span>
                                                    ) : isScheduled ? (
                                                        <span className="text-[9px] bg-purple-500/90 text-white px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-lg">
                                                            Scheduled
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] bg-green-500/90 text-black px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-lg">
                                                            Published
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold mb-3">
                                                    <span>{post.date ? new Date(post.date).toLocaleDateString() : "No date"}</span>
                                                    {post.author?.name && <span>{post.author.name}</span>}
                                                </div>

                                                <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#c5a059] transition-colors">
                                                    {post.title}
                                                </h3>

                                                {/* URL Slug Pill */}
                                                <div className="my-3 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 flex items-center justify-between">
                                                    <span className="text-[9px] font-mono text-gray-400 truncate max-w-[200px]">
                                                        /blogs/{currentSlug}/
                                                    </span>
                                                    {!isDraft && (
                                                        <a
                                                            href={publicUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[9px] text-[#c5a059] hover:underline font-bold uppercase tracking-wider flex-shrink-0 ml-2"
                                                        >
                                                            View ↗
                                                        </a>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                    {post.excerpt || "No excerpt provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditPost(post)}
                                                    className="px-4 py-2 bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(post)}
                                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                                    title={isDraft ? "Click to Publish" : "Click to unpublish (draft)"}
                                                >
                                                    {isDraft ? "Publish" : "Unpublish"}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteModalPost(post)}
                                                className="text-[10px] font-black text-red-500/40 hover:text-red-400 uppercase tracking-widest transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Full-Screen Blog Editor */}
            {editingPost && (
                <div className="fixed inset-0 bg-black z-[101] overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8 pb-32">
                        {/* Editor Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                            <div>
                                <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em]">
                                    {editingPost._id ? "Editing Existing Story" : "Drafting New Story"}
                                </span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                    {editingPost.title || "Untitled Insight"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPreviewModal(true)}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#c5a059] border border-[#c5a059]/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <span>👁️</span> Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Close / Discard
                                </button>
                            </div>
                        </div>

                        {/* 301 Redirect Alert if slug changed */}
                        {originalSlug && editingPost.slug && originalSlug !== editingPost.slug && (
                            <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div className="text-xs text-amber-200 leading-relaxed">
                                    <p className="font-bold uppercase tracking-wider mb-1">
                                        URL Slug Modified: Automatic 301 Permanent Redirect Will Be Created
                                    </p>
                                    <p className="text-amber-300/80">
                                        When you save, visitors accessing <code className="text-white bg-black/40 px-1 py-0.5 rounded">/blogs/{originalSlug}/</code> will automatically receive a 301 permanent redirect to <code className="text-white bg-black/40 px-1 py-0.5 rounded">/blogs/{editingPost.slug}/</code>. Backlinks, search rankings, and social bookmarks are protected.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Editor Form */}
                        <form onSubmit={handleSave} className="space-y-10">
                            {/* Section 1: Title, Custom URL Slug & SEO Preview */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Article Headline (Title) *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingPost.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="e.g. Drone Photography Services in Kolkata: The Complete Guide"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xl md:text-2xl font-bold outline-none focus:border-[#c5a059] transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Subtitle / Lead Headline (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingPost.subtitle || ""}
                                        onChange={(e) => setEditingPost({ ...editingPost, subtitle: e.target.value })}
                                        placeholder="e.g. How high-altitude 4K cinematography elevates wedding and commercial productions"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white text-sm outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                {/* Custom URL Slug Control */}
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <label className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest pl-1 flex items-center gap-2">
                                            <span>🔗 Custom URL Slug (SEO-Friendly)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={regenerateSlugFromTitle}
                                            className="text-[9px] uppercase font-bold text-gray-400 hover:text-[#c5a059] transition-colors"
                                        >
                                            🔄 Regenerate From Title
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative flex items-center">
                                            <span className="hidden sm:inline-block pl-4 text-xs font-mono text-gray-500 select-none">
                                                /blogs/
                                            </span>
                                            <input
                                                type="text"
                                                value={editingPost.slug || ""}
                                                onChange={handleSlugChange}
                                                placeholder="drone-photography-services-kolkata"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 sm:pl-1 text-white font-mono text-sm outline-none focus:border-[#c5a059]"
                                                required
                                            />
                                            <span className="pr-4 text-xs font-mono text-gray-500 select-none">
                                                /
                                            </span>
                                        </div>
                                    </div>

                                    {/* URL Live Preview and Availability Badge */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs">🌐</span>
                                            <span className="text-xs font-mono text-gray-300 truncate">
                                                {SITE_URL}/blogs/{editingPost.slug || "your-slug"}/
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slugValidation.checking ? (
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                                                    <span>⏳</span> Checking availability...
                                                </span>
                                            ) : slugValidation.available === true ? (
                                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                                                    <span>✅</span> Available
                                                </span>
                                            ) : slugValidation.available === false ? (
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                                                    <span>❌</span> {slugValidation.message}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Publishing Status, Schedule & Meta */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Publishing Status
                                    </label>
                                    <select
                                        value={editingPost.status || "published"}
                                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white font-bold uppercase text-xs outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="published" className="bg-[#111] text-green-400">🟢 Published (Public)</option>
                                        <option value="draft" className="bg-[#111] text-amber-400">🟡 Save as Draft (Private)</option>
                                        <option value="scheduled" className="bg-[#111] text-purple-400">🟣 Scheduled</option>
                                    </select>
                                    <p className="text-[9px] text-gray-500 pl-1">
                                        Drafts remain 100% hidden from the public website.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Publication Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editingPost.date || todayStr}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            const isFuture = newDate > todayStr;
                                            setEditingPost({
                                                ...editingPost,
                                                date: newDate,
                                                status: isFuture && editingPost.status !== 'draft' ? 'scheduled' : editingPost.status
                                            });
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                    />
                                    <p className="text-[9px] text-gray-500 pl-1">
                                        Selecting a future date schedules the blog automatically.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Category
                                    </label>
                                    <select
                                        value={editingPost.category || "INSIGHT"}
                                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-[#c5a059] font-black uppercase text-xs outline-none focus:border-[#c5a059]"
                                    >
                                        {PRESET_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat} className="bg-[#111] text-white">{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags Input */}
                                <div className="md:col-span-3 space-y-2 pt-2 border-t border-white/5">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Tags (For Internal Search & Topic Filtering)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            placeholder="Type tag and press Enter (e.g. kolkata, drone, cinematography)..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-3 bg-white/10 hover:bg-[#c5a059] text-gray-300 hover:text-black rounded-xl text-xs font-bold uppercase transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {editingPost.tags && editingPost.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {editingPost.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-3 py-1 rounded-full text-xs font-bold uppercase"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-gray-400 hover:text-white"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Featured Keyframe Image */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                    Featured Image Keyframe (1600x900 Recommended)
                                </label>
                                <ImageUploader
                                    currentImage={editingPost.image}
                                    recommendedSize="Featured Hero Image (Recommended: 1600x900px)"
                                    onUploadSuccess={(url) => setEditingPost({ ...editingPost, image: url })}
                                />
                                {editingPost.image && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                                Image Alt Text (Crucial for Google Image Search)
                                            </label>
                                            <input
                                                type="text"
                                                value={editingPost.featuredImageAlt || ""}
                                                onChange={(e) => setEditingPost({ ...editingPost, featuredImageAlt: e.target.value })}
                                                placeholder="Descriptive alt text for the featured photo..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setEditingPost({ ...editingPost, image: "" })}
                                                className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase transition-colors"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Summary Excerpt */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                                        Story Excerpt / Teaser (Displayed on Blog Cards & RSS)
                                    </label>
                                    <span className="text-[10px] font-mono text-gray-500">
                                        {editingPost.excerpt?.length || 0} characters
                                    </span>
                                </div>
                                <textarea
                                    value={editingPost.excerpt || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                    placeholder="A concise, compelling overview that hooks readers..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#c5a059] h-24 font-light leading-relaxed"
                                />
                            </div>

                            {/* Section 5: Rich Text Editor Canvas */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">
                                        Main Story Narrative (WYSIWYG Formatting & Media)
                                    </label>
                                    <span className="text-[9px] text-[#c5a059] font-bold uppercase">
                                        Interactive Media & Format Supported
                                    </span>
                                </div>
                                <RichTextEditor
                                    value={editingPost.content || ""}
                                    onChange={(html) => setEditingPost({ ...editingPost, content: html })}
                                />
                            </div>

                            {/* Section 6: SEO & Social Sharing Hub */}
                            <div className="bg-[#0e0e0e] border border-[#c5a059]/30 rounded-3xl p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🔍</span>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">
                                            SEO & Social Sharing Optimization
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            Control how Google, Facebook, WhatsApp and X display this blog
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                                                Meta Title (Search Engine Headline)
                                            </label>
                                            <span className={`text-[10px] font-mono ${(editingPost.seo?.title?.length || 0) > 60 ? "text-amber-400" : "text-gray-500"}`}>
                                                {editingPost.seo?.title?.length || 0}/60 char
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={editingPost.seo?.title || ""}
                                            onChange={(e) => setEditingPost({
                                                ...editingPost,
                                                seo: { ...editingPost.seo, title: e.target.value }
                                            })}
                                            placeholder={editingPost.title ? `${editingPost.title} | Dreamline Production` : "e.g. Best Drone Photography in Kolkata 2026 | Dreamline"}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">
                                                Meta Description (Search Snippet)
                                            </label>
                                            <span className={`text-[10px] font-mono ${(editingPost.seo?.description?.length || 0) > 160 ? "text-amber-400" : "text-gray-500"}`}>
                                                {editingPost.seo?.description?.length || 0}/160 char
                                            </span>
                                        </div>
                                        <textarea
                                            value={editingPost.seo?.description || ""}
                                            onChange={(e) => setEditingPost({
                                                ...editingPost,
                                                seo: { ...editingPost.seo, description: e.target.value }
                                            })}
                                            placeholder="Enter 140-160 characters describing the story to maximize search click-through rates..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059] h-20"
                                        />
                                    </div>

                                    {/* Google SERP Preview Card */}
                                    <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 space-y-1.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] mb-2">
                                            Google Search Snippet Preview
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            https://dreamlineproduction.com › blogs › {editingPost.slug || "slug"}
                                        </p>
                                        <p className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium line-clamp-1">
                                            {editingPost.seo?.title || editingPost.title || "Blog Title | Dreamline Production"}
                                        </p>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                            {editingPost.seo?.description || editingPost.excerpt || "Discover expert insights from Kolkata's premier cinema and photography production studio."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
                                                Canonical URL Override (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={editingPost.seo?.canonicalUrl || ""}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    seo: { ...editingPost.seo, canonicalUrl: e.target.value }
                                                })}
                                                placeholder={`Default: ${SITE_URL}/blogs/${editingPost.slug || "slug"}/`}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#c5a059]"
                                            />
                                            <p className="text-[9px] text-gray-500 mt-1">
                                                Leave blank to automatically use standard canonical URL with trailing slash.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-1">
                                                Social Share Image (OG Image)
                                            </label>
                                            <input
                                                type="text"
                                                value={editingPost.seo?.ogImage || ""}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    seo: { ...editingPost.seo, ogImage: e.target.value }
                                                })}
                                                placeholder="Defaults to Featured Image if empty"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                    </div>

                                    {/* Robots Indexing Settings */}
                                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!editingPost.seo?.noIndex}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    seo: { ...editingPost.seo, noIndex: !e.target.checked }
                                                })}
                                                className="rounded border-white/20 text-[#c5a059] focus:ring-0"
                                            />
                                            <span className="text-xs text-gray-300">Allow Search Engines to Index (index)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!editingPost.seo?.noFollow}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    seo: { ...editingPost.seo, noFollow: !e.target.checked }
                                                })}
                                                className="rounded border-white/20 text-[#c5a059] focus:ring-0"
                                            />
                                            <span className="text-xs text-gray-300">Allow Search Engines to Follow Links (follow)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 7: Author Information */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                    ✍️ Author Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-1">Author Name</label>
                                        <input
                                            type="text"
                                            value={editingPost.author?.name || ""}
                                            onChange={(e) => setEditingPost({
                                                ...editingPost,
                                                author: { ...editingPost.author, name: e.target.value }
                                            })}
                                            placeholder="Dreamline Production"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-1">Author Title / Role</label>
                                        <input
                                            type="text"
                                            value={editingPost.author?.role || ""}
                                            onChange={(e) => setEditingPost({
                                                ...editingPost,
                                                author: { ...editingPost.author, role: e.target.value }
                                            })}
                                            placeholder="Lead Cinematographer / Editorial Team"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Action Bar at Bottom */}
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-[102] bg-[#0c0c0c]/90 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-2xl flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="px-6 py-3 text-xs uppercase font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={(e) => {
                                            setEditingPost(prev => ({ ...prev, status: 'draft' }));
                                            setTimeout(() => handleSave(e), 50);
                                        }}
                                        className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Save Draft
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3.5 rounded-full bg-[#c5a059] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20"
                                    >
                                        {saving ? "Saving Story..." : editingPost._id ? "Update Story" : "Publish Story"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Live Visual Preview Modal */}
            {showPreviewModal && editingPost && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] overflow-y-auto p-4 md:p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto bg-[#050505] border border-white/10 rounded-3xl p-6 md:p-12 relative text-white space-y-10">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest">
                                👁️ Live Preview Mode
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase"
                            >
                                Close Preview ✕
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-4">
                                <span>{editingPost.category || "INSIGHT"}</span>
                                <span>•</span>
                                <span>{editingPost.date || todayStr}</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-4 text-white">
                                {editingPost.title || "Your Blog Headline"}
                            </h1>

                            {editingPost.subtitle && (
                                <p className="text-lg md:text-xl text-[#c5a059] font-light mb-6">
                                    {editingPost.subtitle}
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden relative">
                                    <img
                                        src={editingPost.author?.avatar || "/logo.png"}
                                        alt={editingPost.author?.name ? `${editingPost.author.name} profile portrait` : "Dreamline Editorial Author"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">{editingPost.author?.name || "Dreamline Production"}</p>
                                    <p className="text-[9px] text-gray-500 uppercase">{editingPost.author?.role || "Editorial Team"}</p>
                                </div>
                            </div>
                        </div>

                        {editingPost.image && (
                            <div className="w-full h-80 rounded-3xl overflow-hidden relative border border-white/10">
                                <img
                                    src={editingPost.image}
                                    alt={editingPost.featuredImageAlt || editingPost.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {editingPost.excerpt && (
                            <div className="text-lg text-gray-300 border-l-2 border-[#c5a059] pl-6 italic">
                                {editingPost.excerpt}
                            </div>
                        )}

                        <div
                            className="prose prose-invert max-w-none text-gray-300 text-base md:text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: editingPost.content || "<p>No content written yet...</p>" }}
                        />

                        {editingPost.tags && editingPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                                {editingPost.tags.map(t => (
                                    <span key={t} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalPost && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <span className="text-2xl">🗑️</span>
                            <h3 className="text-base font-black uppercase tracking-tight">Delete Blog Post?</h3>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Are you sure you want to permanently delete:
                            <br />
                            <strong className="text-white block mt-1">"{deleteModalPost.title}"</strong>
                            <span className="block mt-1 font-mono text-[10px] text-gray-500">
                                /blogs/{deleteModalPost.slug || deleteModalPost.id}/
                            </span>
                        </p>
                        <p className="text-[10px] text-red-400 uppercase font-bold tracking-wider">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setDeleteModalPost(null)}
                                className="px-5 py-2.5 rounded-xl text-xs uppercase font-bold text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-wider transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
