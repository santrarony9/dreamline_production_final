"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ImageUploader from "@/components/admin/ImageUploader";

const BLANK_ITEM = {
    title: "",
    url: "",
    type: "internal",
    parentId: "",
    order: 0,
    openInNewTab: false,
    isActive: true,
    displayDesktop: true,
    displayMobile: true,
    badge: "",
    description: "",
    group: "",
    icon: "",
    isDropdown: false
};

const BLANK_BANNER = {
    title: "",
    subtitle: "",
    description: "",
    image: "",
    ctaText: "Learn More",
    ctaLink: "/services",
    badge: "Featured",
    order: 0,
    isActive: true
};

export default function NavigationAdmin() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "success" });

    // Active tab: 'menu' | 'hero' | 'banners' | 'notice'
    const [activeTab, setActiveTab] = useState("menu");

    // Navigation state from DB
    const [rootItems, setRootItems] = useState([]);
    const [flatItems, setFlatItems] = useState([]);
    const [availablePages, setAvailablePages] = useState({
        corePages: [],
        servicePages: [],
        customPages: [],
        blogArticles: []
    });

    // Homepage Hero Banner state
    const [heroBanner, setHeroBanner] = useState({
        titleLine1: "Visionary",
        titleLine2: "Cinema.",
        subtitle: "EST. 2010 • DREAMLINE PRODUCTION",
        backgroundImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80",
        cta1Text: "Explore Weddings",
        cta1Link: "/luxury",
        cta2Text: "Commercial Works",
        cta2Link: "/commercial"
    });

    // Promotional & Page Banners list
    const [promoBanners, setPromoBanners] = useState([]);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deletingBanner, setDeletingBanner] = useState(null);

    // Top announcement banner & CTA settings
    const [announcement, setAnnouncement] = useState({
        enabled: true,
        badge: "STUDIO HQ",
        text: "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082",
        link: "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9"
    });

    const [cta, setCta] = useState({
        label: "GET A QUOTE",
        href: "/contact",
        enabled: true
    });

    const [contact, setContact] = useState({
        phone: "+91 82400 54002",
        address: "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082",
        email: "support@dreamlineproduction.com"
    });

    // Active modal states for Menu Items
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [draggedItemId, setDraggedItemId] = useState(null);

    const showToast = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "success" }), 4500);
    };

    const fetchNavigationData = useCallback(async () => {
        setLoading(true);
        try {
            const [navRes, contentRes] = await Promise.all([
                axios.get("/api/admin/navigation"),
                axios.get("/api/content").catch(() => ({ data: {} }))
            ]);

            if (navRes.data?.success) {
                setRootItems(navRes.data.rootItems || []);
                setFlatItems(navRes.data.flatItems || []);
                setAvailablePages(navRes.data.availablePages || {});
            }

            const rawContent = contentRes.data || {};
            const global = rawContent.global || {};
            const home = rawContent.home || {};

            // Hero Banner
            if (home.hero) {
                setHeroBanner({
                    titleLine1: home.hero.titleLine1 || "Visionary",
                    titleLine2: home.hero.titleLine2 || "Cinema.",
                    subtitle: home.hero.subtitle || "EST. 2010 • DREAMLINE PRODUCTION",
                    backgroundImage: home.hero.backgroundImage || "",
                    cta1Text: home.hero.cta1Text || "Explore Weddings",
                    cta1Link: home.hero.cta1Link || "/luxury",
                    cta2Text: home.hero.cta2Text || "Commercial Works",
                    cta2Link: home.hero.cta2Link || "/commercial"
                });
            }

            // Promotional Banners
            if (Array.isArray(rawContent.banners)) {
                setPromoBanners(rawContent.banners);
            }

            // Contact
            if (global.contact) {
                setContact({
                    phone: global.contact.phone || "+91 82400 54002",
                    address: global.contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082",
                    email: global.contact.email || "support@dreamlineproduction.com"
                });
            }

            // Top Announcement Bar
            if (global.announcement) {
                setAnnouncement({
                    enabled: global.announcement.enabled !== false,
                    badge: global.announcement.badge || "STUDIO HQ",
                    text: global.announcement.text || "",
                    link: global.announcement.link || ""
                });
            }

            // Header CTA Button
            if (global.navigation?.cta) {
                setCta({
                    label: global.navigation.cta.label || "GET A QUOTE",
                    href: global.navigation.cta.href || "/contact",
                    enabled: global.navigation.cta.enabled !== false
                });
            }
        } catch (err) {
            console.error("Error fetching navigation data:", err);
            showToast("Failed to load navigation data: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNavigationData();
    }, [fetchNavigationData]);

    // -------------------------------------------------------------------------
    // MENU ITEM ACTIONS
    // -------------------------------------------------------------------------
    const handleAddNewRoot = () => {
        const nextOrder = rootItems.length + 1;
        setEditingItem({
            ...BLANK_ITEM,
            order: nextOrder,
            parentId: ""
        });
        setIsModalOpen(true);
    };

    const handleAddSubmenu = (parent) => {
        const parentId = parent.id || parent._id;
        const currentSubCount = parent.children?.length || 0;
        setEditingItem({
            ...BLANK_ITEM,
            parentId: parentId,
            order: currentSubCount + 1,
            group: parent.title === "SERVICES" ? "Weddings & Celebrations" : ""
        });
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem({
            ...item,
            id: item.id || item._id,
            parentId: item.parentId ? item.parentId.toString() : ""
        });
        setIsModalOpen(true);
    };

    const handleSelectPage = (e) => {
        const selectedUrl = e.target.value;
        if (!selectedUrl) return;

        const allPages = [
            ...(availablePages.corePages || []),
            ...(availablePages.servicePages || []),
            ...(availablePages.customPages || []),
            ...(availablePages.blogArticles || [])
        ];

        const match = allPages.find(p => p.url === selectedUrl);
        setEditingItem(prev => ({
            ...prev,
            url: selectedUrl,
            title: prev.title ? prev.title : (match ? match.title.toUpperCase() : ""),
            type: "internal"
        }));
    };

    const handleSaveItemModal = async (e) => {
        e.preventDefault();
        if (!editingItem.title.trim()) {
            showToast("Menu Title is required.", "error");
            return;
        }
        if (!editingItem.url.trim()) {
            showToast("Menu URL / Page Link is required.", "error");
            return;
        }

        setSaving(true);
        try {
            if (editingItem.id) {
                const res = await axios.put("/api/admin/navigation", editingItem);
                showToast(res.data?.message || "Menu item updated successfully!");
            } else {
                const res = await axios.post("/api/admin/navigation", editingItem);
                showToast(res.data?.message || "Menu item created successfully!");
            }
            setIsModalOpen(false);
            setEditingItem(null);
            await fetchNavigationData();
        } catch (err) {
            console.error(err);
            showToast("Error saving menu item: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item) => {
        const id = item.id || item._id;
        const newStatus = !item.isActive;
        try {
            await axios.put("/api/admin/navigation", {
                id,
                title: item.title,
                url: item.url,
                isActive: newStatus
            });
            showToast(`"${item.title}" marked as ${newStatus ? 'Active' : 'Inactive'}.`);
            await fetchNavigationData();
        } catch (err) {
            showToast("Error toggling status: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;
        const id = deletingItem.id || deletingItem._id;
        setSaving(true);
        try {
            const res = await axios.delete(`/api/admin/navigation?id=${id}`);
            showToast(res.data?.message || "Menu item deleted successfully!");
            setDeletingItem(null);
            await fetchNavigationData();
        } catch (err) {
            console.error(err);
            showToast("Error deleting item: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleMoveRoot = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= rootItems.length) return;

        const newRoots = [...rootItems];
        const [moved] = newRoots.splice(index, 1);
        newRoots.splice(targetIndex, 0, moved);
        setRootItems(newRoots);

        const payload = newRoots.map((it, idx) => ({
            id: it.id || it._id,
            order: idx + 1,
            parentId: null
        }));

        try {
            await axios.put("/api/admin/navigation", { action: "reorder", items: payload });
            showToast("Menu order updated!");
        } catch (err) {
            showToast("Failed to reorder: " + err.message, "error");
            await fetchNavigationData();
        }
    };

    const handleMoveSub = async (parentIndex, subIndex, direction) => {
        const parent = rootItems[parentIndex];
        if (!parent || !Array.isArray(parent.children)) return;

        const targetSubIndex = subIndex + direction;
        if (targetSubIndex < 0 || targetSubIndex >= parent.children.length) return;

        const newChildren = [...parent.children];
        const [moved] = newChildren.splice(subIndex, 1);
        newChildren.splice(targetSubIndex, 0, moved);

        const newRoots = [...rootItems];
        newRoots[parentIndex] = { ...parent, children: newChildren };
        setRootItems(newRoots);

        const parentId = parent.id || parent._id;
        const payload = newChildren.map((it, idx) => ({
            id: it.id || it._id,
            order: idx + 1,
            parentId: parentId
        }));

        try {
            await axios.put("/api/admin/navigation", { action: "reorder", items: payload });
            showToast(`Reordered submenus for "${parent.title}".`);
        } catch (err) {
            showToast("Failed to reorder submenus: " + err.message, "error");
            await fetchNavigationData();
        }
    };

    const handleDragStart = (e, itemId) => {
        setDraggedItemId(itemId);
        e.dataTransfer.setData("text/plain", itemId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetItemId) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetItemId) return;

        const fromIndex = rootItems.findIndex(it => (it.id || it._id) === draggedItemId);
        const toIndex = rootItems.findIndex(it => (it.id || it._id) === targetItemId);

        if (fromIndex === -1 || toIndex === -1) return;

        const newRoots = [...rootItems];
        const [moved] = newRoots.splice(fromIndex, 1);
        newRoots.splice(toIndex, 0, moved);
        setRootItems(newRoots);
        setDraggedItemId(null);

        const payload = newRoots.map((it, idx) => ({
            id: it.id || it._id,
            order: idx + 1,
            parentId: null
        }));

        try {
            await axios.put("/api/admin/navigation", { action: "reorder", items: payload });
            showToast("Menu reordered via drag-and-drop!");
        } catch (err) {
            showToast("Failed to reorder: " + err.message, "error");
            await fetchNavigationData();
        }
    };

    const handleResetDefaults = async () => {
        const confirmed = confirm("Are you sure you want to reset the navigation menu to Dreamline Production flagship defaults? Any custom links will be restored to defaults.");
        if (!confirmed) return;

        setSaving(true);
        try {
            const res = await axios.post("/api/admin/navigation/reset");
            showToast(res.data?.message || "Navigation reset to defaults!");
            await fetchNavigationData();
        } catch (err) {
            showToast("Reset failed: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------------------------------
    // BANNER ACTIONS
    // -------------------------------------------------------------------------
    const handleSaveHeroBanner = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post("/api/content", {
                home: {
                    hero: heroBanner
                }
            });
            showToast("Homepage Hero Banner updated successfully!");
        } catch (err) {
            showToast("Error saving hero banner: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleOpenAddBanner = () => {
        setEditingBanner({
            ...BLANK_BANNER,
            order: promoBanners.length + 1
        });
    };

    const handleSavePromoBanner = async (e) => {
        e.preventDefault();
        if (!editingBanner.title.trim()) {
            showToast("Banner Title is required.", "error");
            return;
        }

        setSaving(true);
        let updatedList;
        if (editingBanner._id || editingBanner.id) {
            const bannerId = editingBanner._id || editingBanner.id;
            updatedList = promoBanners.map(b => (b._id === bannerId || b.id === bannerId) ? editingBanner : b);
        } else {
            updatedList = [...promoBanners, { ...editingBanner, id: Date.now().toString() }];
        }

        try {
            await axios.post("/api/content", { banners: updatedList });
            setPromoBanners(updatedList);
            setEditingBanner(null);
            showToast("Banner saved successfully!");
        } catch (err) {
            showToast("Error saving banner: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePromoBanner = async () => {
        if (!deletingBanner) return;
        const bannerId = deletingBanner._id || deletingBanner.id;
        const updatedList = promoBanners.filter(b => b._id !== bannerId && b.id !== bannerId);

        setSaving(true);
        try {
            await axios.post("/api/content", { banners: updatedList });
            setPromoBanners(updatedList);
            setDeletingBanner(null);
            showToast("Banner deleted successfully!");
        } catch (err) {
            showToast("Error deleting banner: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNoticeAndCta = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post("/api/content", {
                global: {
                    announcement,
                    navigation: {
                        cta
                    },
                    contact
                }
            });
            showToast("Top Announcement & CTA button saved successfully!");
        } catch (err) {
            showToast("Error saving notice & CTA: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-black">
                    Loading Navigation &amp; Banner Architecture...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl pb-32">
            {/* Toast Notification */}
            {message.text && (
                <div className={`fixed bottom-6 right-6 z-[999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-black uppercase tracking-wider animate-bounce ${
                    message.type === "error" 
                        ? "bg-red-950/90 border-red-500 text-red-200" 
                        : "bg-emerald-950/90 border-emerald-500 text-emerald-200"
                }`}>
                    <span>{message.type === "error" ? "⚠️" : "✓"}</span>
                    <span>{message.text}</span>
                </div>
            )}

            {/* Header with Title & Top Actions */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/10">
                <div>
                    <span className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2 block">
                        Control Center
                    </span>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-heading">
                        Navigation <span className="text-gray-500">&amp; Banner Studio.</span>
                    </h1>
                    <p className="text-gray-400 text-xs font-medium mt-1 max-w-2xl leading-relaxed">
                        Customize your website navigation bar, dropdown menus, homepage hero banner, promotional banners, and announcement notice bars in real time without editing source code.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        disabled={saving}
                        className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all"
                    >
                        Reset Defaults
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                    >
                        <span>Live Site</span>
                        <span>↗</span>
                    </a>
                    {activeTab === "menu" ? (
                        <button
                            type="button"
                            onClick={handleAddNewRoot}
                            className="text-[10px] font-black text-black bg-[#c5a059] hover:bg-white uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                        >
                            <span>+ Add Menu Item</span>
                        </button>
                    ) : activeTab === "banners" ? (
                        <button
                            type="button"
                            onClick={handleOpenAddBanner}
                            className="text-[10px] font-black text-black bg-[#c5a059] hover:bg-white uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                        >
                            <span>+ Add Banner</span>
                        </button>
                    ) : null}
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-6 text-xs font-black uppercase tracking-widest overflow-x-auto hide-scrollbar">
                <button
                    onClick={() => setActiveTab("menu")}
                    className={`pb-3 transition-colors relative whitespace-nowrap ${
                        activeTab === "menu" ? "text-[#c5a059]" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span>🧭 Main Menu &amp; Submenus ({flatItems.length})</span>
                    {activeTab === "menu" && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]"></span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("hero")}
                    className={`pb-3 transition-colors relative whitespace-nowrap ${
                        activeTab === "hero" ? "text-[#c5a059]" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span>🎬 Homepage Hero Banner</span>
                    {activeTab === "hero" && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]"></span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("banners")}
                    className={`pb-3 transition-colors relative whitespace-nowrap ${
                        activeTab === "banners" ? "text-[#c5a059]" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span>🖼️ Promotional Banners ({promoBanners.length})</span>
                    {activeTab === "banners" && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]"></span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("notice")}
                    className={`pb-3 transition-colors relative whitespace-nowrap ${
                        activeTab === "notice" ? "text-[#c5a059]" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span>📢 Notice Bar &amp; CTA Button</span>
                    {activeTab === "notice" && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#c5a059]"></span>
                    )}
                </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: MENU ITEMS & HIERARCHY */}
            {/* ========================================================================= */}
            {activeTab === "menu" && (
                <div className="space-y-8">
                    {/* Live Visual Preview of Desktop Header */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                                <span>👀 Live Navbar Preview</span>
                                <span className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                                    Desktop Glass Floating Mode
                                </span>
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase">
                                Real-time render
                            </span>
                        </div>

                        {/* Top Banner simulation */}
                        {announcement.enabled && (
                            <div className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="bg-black text-[#c5a059] px-2 py-0.5 rounded text-[8px] font-black">
                                        {announcement.badge || "STUDIO HQ"}
                                    </span>
                                    <span className="truncate">{announcement.text || "Official Studio Headquarters"}</span>
                                </div>
                                <span className="text-[8px] font-bold">CALL: {contact.phone || "+91 82400 54002"}</span>
                            </div>
                        )}

                        {/* Floating Navbar Simulation */}
                        <div className="bg-black/90 border border-white/15 rounded-full py-2.5 px-6 flex items-center justify-between shadow-2xl">
                            <div className="flex items-center gap-1.5">
                                <span className="font-heading font-black text-xl text-white">D<span className="text-[#c5a059]">/</span>P</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                            </div>
                            <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-white/80 overflow-x-auto hide-scrollbar py-1">
                                {rootItems.filter(it => it.isActive !== false && it.displayDesktop !== false).map((it, i) => {
                                    const hasSubs = Array.isArray(it.children) && it.children.length > 0;
                                    return (
                                        <div key={i} className="flex items-center gap-1 whitespace-nowrap group cursor-default">
                                            <span className="hover:text-[#c5a059] transition-colors">{it.title}</span>
                                            {it.badge && (
                                                <span className="text-[7px] bg-[#c5a059]/20 text-[#c5a059] px-1 py-0.2 rounded font-black">
                                                    {it.badge}
                                                </span>
                                            )}
                                            {(it.isDropdown || hasSubs) && (
                                                <span className="text-gray-500 text-[8px]">▾</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {cta.enabled !== false && (
                                <div className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                                    {cta.label || "GET A QUOTE"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Items Hierarchy Builder */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                                    Menu Structure ({rootItems.length} Top-Level Items)
                                </h2>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Drag items or use the up/down arrows to reorder. Click &quot;+ Submenu&quot; to add nested dropdown items.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddNewRoot}
                                className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-[#c5a059] hover:text-black text-white px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
                            >
                                + Add Top-Level Menu
                            </button>
                        </div>

                        {/* Hierarchical Cards List */}
                        <div className="space-y-3">
                            {rootItems.map((item, index) => {
                                const itemId = item.id || item._id;
                                const subCount = Array.isArray(item.children) ? item.children.length : 0;
                                const isItemDropdown = item.isDropdown || subCount > 0;

                                return (
                                    <div
                                        key={itemId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, itemId)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, itemId)}
                                        className={`bg-[#0a0a0a] border rounded-2xl transition-all duration-300 ${
                                            draggedItemId === itemId 
                                                 ? "border-[#c5a059] opacity-50 scale-[0.99]" 
                                                 : "border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        {/* ROOT ITEM ROW */}
                                        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                {/* Drag handle & Order Controls */}
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className="text-gray-600 cursor-grab active:cursor-grabbing text-sm select-none" title="Drag to reorder">
                                                        ⋮⋮
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <button
                                                            type="button"
                                                            disabled={index === 0}
                                                            onClick={() => handleMoveRoot(index, -1)}
                                                            className="text-gray-500 hover:text-[#c5a059] disabled:opacity-20 text-[9px] leading-tight"
                                                            title="Move Up"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={index === rootItems.length - 1}
                                                            onClick={() => handleMoveRoot(index, 1)}
                                                            className="text-gray-500 hover:text-[#c5a059] disabled:opacity-20 text-[9px] leading-tight"
                                                            title="Move Down"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-500 font-bold w-4 text-center">
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                {/* Title & Target Details */}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-black uppercase tracking-wider text-white truncate">
                                                            {item.title}
                                                        </h3>
                                                        {item.badge && (
                                                            <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-black uppercase">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        {isItemDropdown && (
                                                            <span className="text-[8px] bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded font-black uppercase">
                                                                Dropdown ({subCount} items)
                                                            </span>
                                                        )}
                                                        {!item.isActive && (
                                                            <span className="text-[8px] bg-red-950/60 border border-red-500/40 text-red-300 px-2 py-0.5 rounded font-black uppercase">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                                                        <span className="truncate">{item.url}</span>
                                                        <span>•</span>
                                                        <span className="uppercase">{item.type}</span>
                                                        {item.openInNewTab && <span>• [New Tab ↗]</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Item Action Buttons & Visibility Toggles */}
                                            <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 flex-wrap">
                                                {/* Desktop / Mobile badges */}
                                                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[9px] font-mono text-gray-400">
                                                    <span className={item.displayDesktop !== false ? "text-white" : "opacity-30 line-through"}>🖥️ Desk</span>
                                                    <span>|</span>
                                                    <span className={item.displayMobile !== false ? "text-white" : "opacity-30 line-through"}>📱 Mob</span>
                                                </div>

                                                {/* Active toggle button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(item)}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                        item.isActive !== false 
                                                            ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900" 
                                                            : "bg-red-950/50 border-red-500/40 text-red-300 hover:bg-red-900"
                                                    }`}
                                                >
                                                    {item.isActive !== false ? "Active" : "Hidden"}
                                                </button>

                                                {/* Add Submenu Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddSubmenu(item)}
                                                    className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-white/5 hover:bg-[#c5a059] hover:text-black border border-white/10 transition-all"
                                                    title="Add Submenu to this item"
                                                >
                                                    + Submenu
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditItem(item)}
                                                    className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                                                    title="Edit configuration"
                                                >
                                                    ✏️
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingItem(item)}
                                                    className="p-1.5 rounded-xl text-red-400 hover:text-red-200 hover:bg-red-950/60 border border-red-500/20 transition-all"
                                                    title="Delete item"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* NESTED SUBMENU ITEMS */}
                                        {Array.isArray(item.children) && item.children.length > 0 && (
                                            <div className="bg-[#050505] border-t border-white/5 p-3 sm:p-4 rounded-b-2xl space-y-2">
                                                <div className="flex items-center justify-between pb-1 pl-6">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]">
                                                        Submenu Items ({item.children.length})
                                                    </span>
                                                    <span className="text-[8px] font-mono text-gray-500 uppercase">
                                                        Nested under &quot;{item.title}&quot;
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 pl-4 sm:pl-6 border-l-2 border-[#c5a059]/30 ml-2">
                                                    {item.children.map((sub, sIdx) => {
                                                        const subId = sub.id || sub._id;
                                                        return (
                                                            <div 
                                                                key={subId}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 gap-2 transition-all"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="flex flex-col flex-shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            disabled={sIdx === 0}
                                                                            onClick={() => handleMoveSub(index, sIdx, -1)}
                                                                            className="text-gray-500 hover:text-[#c5a059] disabled:opacity-20 text-[8px] leading-tight"
                                                                        >
                                                                            ▲
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={sIdx === item.children.length - 1}
                                                                            onClick={() => handleMoveSub(index, sIdx, 1)}
                                                                            className="text-gray-500 hover:text-[#c5a059] disabled:opacity-20 text-[8px] leading-tight"
                                                                        >
                                                                            ▼
                                                                        </button>
                                                                    </div>

                                                                    {sub.icon && <span className="text-sm">{sub.icon}</span>}
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                                                {sub.title}
                                                                            </span>
                                                                            {sub.group && (
                                                                                <span className="text-[7px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-mono uppercase">
                                                                                    {sub.group}
                                                                                </span>
                                                                            )}
                                                                            {sub.badge && (
                                                                                <span className="text-[7px] bg-[#c5a059]/20 text-[#c5a059] px-1.5 py-0.5 rounded font-black uppercase">
                                                                                    {sub.badge}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[9px] font-mono text-gray-500 truncate block">
                                                                            {sub.url}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleActive(sub)}
                                                                        className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
                                                                            sub.isActive !== false ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"
                                                                        }`}
                                                                    >
                                                                        {sub.isActive !== false ? "On" : "Off"}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditItem(sub)}
                                                                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                                                        title="Edit submenu"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDeletingItem(sub)}
                                                                        className="p-1 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-950/40"
                                                                        title="Delete submenu"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: HOMEPAGE HERO BANNER */}
            {/* ========================================================================= */}
            {activeTab === "hero" && (
                <form onSubmit={handleSaveHeroBanner} className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                    🎬 Homepage Hero Banner
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    Primary full-screen cinematic banner displayed at the very top of your homepage.
                                </p>
                            </div>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1.5 rounded-xl hover:bg-[#c5a059] hover:text-black transition-all self-start sm:self-auto"
                            >
                                View on Website ↗
                            </a>
                        </div>

                        {/* Title & Subtitle inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Primary Title (Line 1)</label>
                                <input
                                    type="text"
                                    value={heroBanner.titleLine1}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, titleLine1: e.target.value })}
                                    placeholder="Visionary"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Secondary Title (Line 2)</label>
                                <input
                                    type="text"
                                    value={heroBanner.titleLine2}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, titleLine2: e.target.value })}
                                    placeholder="Cinema."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Narrative Subtitle</label>
                                <input
                                    type="text"
                                    value={heroBanner.subtitle}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })}
                                    placeholder="EST. 2010 • DREAMLINE PRODUCTION"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                />
                            </div>
                        </div>

                        {/* Background Media Uploader */}
                        <div className="space-y-3 pt-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Cinematic Backdrop Asset (Image or Video)</label>
                            <ImageUploader
                                currentImage={heroBanner.backgroundImage}
                                recommendedSize="Cinematic Backdrop (Video MP4 or Image URL) - 1920x1080 (16:9)"
                                onUploadSuccess={(url) => setHeroBanner({ ...heroBanner, backgroundImage: url })}
                            />
                            {heroBanner.backgroundImage && (
                                <button
                                    type="button"
                                    onClick={() => setHeroBanner({ ...heroBanner, backgroundImage: "" })}
                                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
                                >
                                    Clear Asset
                                </button>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Primary Button Label</label>
                                <input
                                    type="text"
                                    value={heroBanner.cta1Text}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, cta1Text: e.target.value })}
                                    placeholder="Explore Weddings"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Primary Button Target URL</label>
                                <input
                                    type="text"
                                    value={heroBanner.cta1Link}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, cta1Link: e.target.value })}
                                    placeholder="/luxury"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Secondary Button Label</label>
                                <input
                                    type="text"
                                    value={heroBanner.cta2Text}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, cta2Text: e.target.value })}
                                    placeholder="Commercial Works"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Secondary Button Target URL</label>
                                <input
                                    type="text"
                                    value={heroBanner.cta2Link}
                                    onChange={(e) => setHeroBanner({ ...heroBanner, cta2Link: e.target.value })}
                                    placeholder="/commercial"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3.5 rounded-2xl bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                            >
                                {saving ? "Saving Changes..." : "Save Hero Banner"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: PROMOTIONAL & MULTI-BANNERS */}
            {/* ========================================================================= */}
            {activeTab === "banners" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white">
                                Promotional &amp; Seasonal Banners ({promoBanners.length})
                            </h2>
                            <p className="text-[11px] text-gray-500 font-medium">
                                Create promotional highlight banners, season discounts, or special event cards displayed across your website.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenAddBanner}
                            className="text-[10px] font-black uppercase tracking-widest bg-[#c5a059] hover:bg-white text-black px-4 py-2 rounded-xl transition-all shadow-md"
                        >
                            + Add New Banner
                        </button>
                    </div>

                    {promoBanners.length === 0 ? (
                        <div className="p-12 text-center bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl space-y-4">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No promotional banners configured yet.</p>
                            <button
                                type="button"
                                onClick={handleOpenAddBanner}
                                className="text-[10px] font-black uppercase tracking-widest bg-[#c5a059] text-black px-6 py-2.5 rounded-xl hover:bg-white transition-all shadow-lg"
                            >
                                Create Your First Banner
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {promoBanners.map((banner, bIdx) => (
                                <div key={banner._id || banner.id || bIdx} className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden hover:border-[#c5a059]/40 transition-all flex flex-col justify-between">
                                    {banner.image ? (
                                        <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${banner.image})` }}>
                                            <div className="absolute inset-0 bg-black/40"></div>
                                            {banner.badge && (
                                                <span className="absolute top-4 left-4 bg-black/80 text-[#c5a059] border border-[#c5a059]/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                    {banner.badge}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-28 bg-white/5 flex items-center justify-center text-gray-500 text-xs font-mono uppercase">
                                            No Image Asset
                                        </div>
                                    )}

                                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-base font-black text-white uppercase tracking-tight">
                                                    {banner.title}
                                                </h3>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                    banner.isActive !== false ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-red-950 text-red-400 border border-red-500/30"
                                                }`}>
                                                    {banner.isActive !== false ? "Active" : "Hidden"}
                                                </span>
                                            </div>
                                            {banner.subtitle && (
                                                <p className="text-[#c5a059] text-xs font-bold uppercase tracking-wider mt-0.5">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                            {banner.description && (
                                                <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                                                    {banner.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[180px]">
                                                {banner.ctaLink || "/"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingBanner(banner)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all text-xs"
                                                    title="Edit Banner"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingBanner(banner)}
                                                    className="p-2 rounded-xl text-red-400 hover:text-red-200 hover:bg-red-950/60 border border-red-500/20 transition-all text-xs"
                                                    title="Delete Banner"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: ANNOUNCEMENT NOTICE BAR & CTA BUTTON */}
            {/* ========================================================================= */}
            {activeTab === "notice" && (
                <form onSubmit={handleSaveNoticeAndCta} className="space-y-8 animate-in fade-in duration-300">
                    {/* Top Announcement Bar */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                    📢 Top Announcement Bar
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    Appears at the very top of the desktop website (studio address, promotions, awards).
                                </p>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {announcement.enabled ? "Enabled" : "Disabled"}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={announcement.enabled}
                                    onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                                    className="w-5 h-5 accent-[#c5a059] cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Badge Tag</label>
                                <input
                                    type="text"
                                    value={announcement.badge}
                                    onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
                                    placeholder="STUDIO HQ"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Announcement Text / Address</label>
                                <input
                                    type="text"
                                    value={announcement.text}
                                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                                    placeholder="85, Tilottama Plaza, Tower 2, Karunamoyee Ghat Road..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Link Destination (Google Maps / URL)</label>
                                <input
                                    type="text"
                                    value={announcement.link}
                                    onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                                    placeholder="https://maps.app.goo.gl/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Studio Contact Info */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
                        <div className="pb-4 border-b border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                📞 Header Studio Phone &amp; Support Email
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                Contact phone number displayed on the right side of the desktop announcement banner.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Phone Number (Call / WhatsApp)</label>
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    placeholder="+91 82400 54002"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Official Support Email</label>
                                <input
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    placeholder="support@dreamlineproduction.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Button Settings */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                    🔘 Primary Header CTA Button
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    Gold call-to-action button placed at the right of the desktop navigation bar and in the mobile drawer.
                                </p>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {cta.enabled !== false ? "Visible" : "Hidden"}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={cta.enabled !== false}
                                    onChange={(e) => setCta({ ...cta, enabled: e.target.checked })}
                                    className="w-5 h-5 accent-[#c5a059] cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Button Label</label>
                                <input
                                    type="text"
                                    value={cta.label}
                                    onChange={(e) => setCta({ ...cta, label: e.target.value })}
                                    placeholder="GET A QUOTE"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Target Link URL</label>
                                <input
                                    type="text"
                                    value={cta.href}
                                    onChange={(e) => setCta({ ...cta, href: e.target.value })}
                                    placeholder="/contact"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3.5 rounded-2xl bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                            >
                                {saving ? "Saving Changes..." : "Save Notice & CTA Settings"}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* ========================================================================= */}
            {/* MODAL 1: ADD / EDIT MENU ITEM */}
            {/* ========================================================================= */}
            {isModalOpen && editingItem && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                    {editingItem.id ? "Edit Menu Configuration" : "New Navigation Item"}
                                </span>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                    {editingItem.title || "Configure Menu Item"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveItemModal} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Quick Page Selector */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#c5a059]/20 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] block">
                                    ⚡ Quick Select from Existing Pages
                                </label>
                                <select
                                    onChange={handleSelectPage}
                                    defaultValue=""
                                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                >
                                    <option value="">-- Choose a website page to auto-fill --</option>
                                    
                                    <optgroup label="Core Pages">
                                        {(availablePages.corePages || []).map((cp, idx) => (
                                            <option key={idx} value={cp.url}>{cp.title} ({cp.url})</option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="Service Pages">
                                        {(availablePages.servicePages || []).map((sp, idx) => (
                                            <option key={idx} value={sp.url}>{sp.title} ({sp.url})</option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="Custom Landing Pages">
                                        {(availablePages.customPages || []).map((cp, idx) => (
                                            <option key={idx} value={cp.url}>{cp.title} ({cp.url})</option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="Blog Posts">
                                        {(availablePages.blogArticles || []).map((ba, idx) => (
                                            <option key={idx} value={ba.url}>{ba.title} ({ba.url})</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Core Fields: Title, URL, Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Menu Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.title}
                                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        placeholder="e.g. DRONE PHOTOGRAPHY"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Menu URL / Page Link <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.url}
                                        onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                                        placeholder="e.g. /services/drone-photography-kolkata/"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-mono font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Menu Type
                                    </label>
                                    <select
                                        value={editingItem.type}
                                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                    >
                                        <option value="internal">Internal Website Page</option>
                                        <option value="external">External Link (New Site)</option>
                                        <option value="custom">Custom Hash / Anchor Link</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Parent Menu (For Submenus / Dropdowns)
                                    </label>
                                    <select
                                        value={editingItem.parentId || ""}
                                        onChange={(e) => setEditingItem({ ...editingItem, parentId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                    >
                                        <option value="">-- None (Top-Level Menu Item) --</option>
                                        {rootItems
                                            .filter(r => (r.id || r._id) !== editingItem.id)
                                            .map((r) => (
                                                <option key={r.id || r._id} value={r.id || r._id}>
                                                    ↳ Under: {r.title}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Visibility & Behavior Toggles */}
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                                    Display &amp; Device Controls
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.isActive !== false}
                                            onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                                            className="w-4 h-4 accent-[#c5a059]"
                                        />
                                        <span>Active</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.displayDesktop !== false}
                                            onChange={(e) => setEditingItem({ ...editingItem, displayDesktop: e.target.checked })}
                                            className="w-4 h-4 accent-[#c5a059]"
                                        />
                                        <span>🖥️ Desktop</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.displayMobile !== false}
                                            onChange={(e) => setEditingItem({ ...editingItem, displayMobile: e.target.checked })}
                                            className="w-4 h-4 accent-[#c5a059]"
                                        />
                                        <span>📱 Mobile</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.openInNewTab}
                                            onChange={(e) => setEditingItem({ ...editingItem, openInNewTab: e.target.checked })}
                                            className="w-4 h-4 accent-[#c5a059]"
                                        />
                                        <span>Open in New Tab</span>
                                    </label>
                                </div>
                            </div>

                            {/* Optional Dropdown & Mega-Menu Enrichment */}
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Dropdown &amp; Mega-Menu Enhancements (Optional)
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase text-[#c5a059]">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.isDropdown}
                                            onChange={(e) => setEditingItem({ ...editingItem, isDropdown: e.target.checked })}
                                            className="w-3.5 h-3.5 accent-[#c5a059]"
                                        />
                                        <span>Mark as Dropdown</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">
                                            Badge / Tag
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.badge || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                                            placeholder="e.g. Certified / Signature"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">
                                            Icon / Emoji
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.icon || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                                            placeholder="e.g. 🛸, 🎥, 💍, ✨"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">
                                            Submenu Group Category
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.group || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, group: e.target.value })}
                                            placeholder="e.g. Drone & Aerial"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:col-span-3">
                                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">
                                            Teaser Description (For mega-menu cards)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingItem.description || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                            placeholder="e.g. DGCA-certified 4K aerial photography for architecture & events"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#c5a059] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-7 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                                >
                                    {saving ? "Saving..." : (editingItem.id ? "Save & Publish" : "Create Item")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: DELETE CONFIRMATION FOR MENU ITEM */}
            {/* ========================================================================= */}
            {deletingItem && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 text-center space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-xl">
                            🗑️
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase text-white tracking-tight">
                                Delete Menu Item?
                            </h3>
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                Are you sure you want to delete <span className="text-white font-bold">&quot;{deletingItem.title}&quot;</span>?
                                {Array.isArray(deletingItem.children) && deletingItem.children.length > 0 && (
                                    <span className="text-red-400 block mt-2 font-bold">
                                        ⚠️ Warning: This will also delete all {deletingItem.children.length} attached submenu item(s).
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingItem(null)}
                                className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleConfirmDelete}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                            >
                                {saving ? "Deleting..." : "Yes, Delete Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: ADD / EDIT PROMOTIONAL BANNER */}
            {/* ========================================================================= */}
            {editingBanner && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                                    {editingBanner._id || editingBanner.id ? "Edit Promotional Banner" : "New Promotional Banner"}
                                </span>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                    {editingBanner.title || "Configure Banner"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingBanner(null)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSavePromoBanner} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Banner Heading <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingBanner.title}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                        placeholder="e.g. Wedding Season 2026 Special"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Subtitle / Tagline
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.subtitle || ""}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                                        placeholder="e.g. Early Bird Discounts Available"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Badge Label
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.badge || ""}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                                        placeholder="e.g. Limited Offer / Featured"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editingBanner.description || ""}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                                        placeholder="Brief description of the promotion or announcement..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Banner Image Asset
                                    </label>
                                    <ImageUploader
                                        currentImage={editingBanner.image}
                                        recommendedSize="Promotional Banner - 1200x630 or 1920x800"
                                        onUploadSuccess={(url) => setEditingBanner({ ...editingBanner, image: url })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Button Label
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.ctaText || ""}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                                        placeholder="Book Now"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Button Link Destination
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.ctaLink || ""}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                                        placeholder="/contact"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#c5a059] outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                <input
                                    type="checkbox"
                                    id="bannerActiveCheckbox"
                                    checked={editingBanner.isActive !== false}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                                    className="w-4 h-4 accent-[#c5a059] cursor-pointer"
                                />
                                <label htmlFor="bannerActiveCheckbox" className="text-xs font-bold text-white cursor-pointer select-none">
                                    Banner Active &amp; Visible on Website
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingBanner(null)}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-7 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                                >
                                    {saving ? "Saving..." : "Save Banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: DELETE CONFIRMATION FOR BANNER */}
            {/* ========================================================================= */}
            {deletingBanner && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl w-full max-w-md p-6 text-center space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-xl">
                            🗑️
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase text-white tracking-tight">
                                Delete Banner?
                            </h3>
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                Are you sure you want to delete <span className="text-white font-bold">&quot;{deletingBanner.title}&quot;</span>?
                            </p>
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingBanner(null)}
                                className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleDeletePromoBanner}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                            >
                                {saving ? "Deleting..." : "Yes, Delete Banner"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
