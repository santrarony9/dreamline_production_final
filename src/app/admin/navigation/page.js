"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

const DEFAULT_NAV_ITEMS = [
    { label: "HOME", href: "/" },
    { label: "ABOUT", href: "/about" },
    { label: "WEDDINGS", href: "/luxury" },
    { label: "COMMERCIAL", href: "/commercial" },
    { label: "BLOG", href: "/blogs" },
    { label: "CONTACT", href: "/contact" }
];

export default function NavigationAdmin() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [announcement, setAnnouncement] = useState({
        enabled: true,
        badge: "STUDIO HQ",
        text: "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082",
        link: "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9"
    });

    const [cta, setCta] = useState({
        label: "INQUIRE NOW",
        href: "/contact",
        enabled: true
    });

    const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);

    useEffect(() => {
        fetchNavSettings();
    }, []);

    const fetchNavSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/content");
            const global = res.data?.global || {};
            
            const defaultAddress = global.contact?.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082";
            const defaultGmbLink = global.google?.profileUrl || global.google?.mapsUrl || "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9";

            if (global.announcement) {
                setAnnouncement({
                    enabled: global.announcement.enabled !== false,
                    badge: global.announcement.badge || "STUDIO HQ",
                    text: global.announcement.text || defaultAddress,
                    link: global.announcement.link || defaultGmbLink
                });
            } else {
                setAnnouncement({
                    enabled: true,
                    badge: "STUDIO HQ",
                    text: defaultAddress,
                    link: defaultGmbLink
                });
            }

            if (global.navigation) {
                if (global.navigation.cta) {
                    setCta({
                        label: global.navigation.cta.label || "INQUIRE NOW",
                        href: global.navigation.cta.href || "/contact",
                        enabled: global.navigation.cta.enabled !== false
                    });
                }
                if (Array.isArray(global.navigation.items) && global.navigation.items.length > 0) {
                    setNavItems(global.navigation.items);
                }
            }
        } catch (err) {
            console.error("Error fetching navigation settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            await axios.post("/api/content", {
                global: {
                    announcement,
                    navigation: {
                        cta,
                        items: navItems
                    }
                }
            });
            setMessage("Navigation & announcement banner updated successfully!");
            setTimeout(() => setMessage(""), 4000);
        } catch (err) {
            console.error(err);
            setMessage("Error saving settings: " + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const addNavItem = () => {
        setNavItems([...navItems, { label: "NEW LINK", href: "/" }]);
    };

    const updateNavItem = (index, field, value) => {
        const updated = [...navItems];
        updated[index][field] = value;
        setNavItems(updated);
    };

    const removeNavItem = (index) => {
        setNavItems(navItems.filter((_, i) => i !== index));
    };

    const moveItem = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= navItems.length) return;
        const updated = [...navItems];
        const [moved] = updated.splice(index, 1);
        updated.splice(target, 0, moved);
        setNavItems(updated);
    };

    const resetToDefaults = () => {
        if (!confirm("Reset navigation menu to default 6 links?")) return;
        setNavItems(DEFAULT_NAV_ITEMS);
    };

    if (loading) {
        return (
            <div className="text-gray-500 uppercase text-xs font-bold tracking-widest py-20 text-center">
                Loading navigation architecture...
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-5xl pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Website Architecture</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Navigation <span className="text-gray-500">& Banner.</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={resetToDefaults}
                        className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl transition-all"
                    >
                        Reset Defaults
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        className="text-[10px] font-black text-[#c5a059] bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-black uppercase tracking-widest px-5 py-2 rounded-xl transition-all"
                    >
                        View Live Site ↗
                    </a>
                </div>
            </header>

            {/* Live Navigation Mockup Preview */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">👀 Live Visual Preview</h3>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Updates as you edit</span>
                </div>

                {/* Preview Banner */}
                {announcement.enabled && (
                    <div className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {announcement.badge && (
                                <span className="bg-black text-[#c5a059] px-2 py-0.5 rounded text-[8px] font-black">
                                    {announcement.badge}
                                </span>
                            )}
                            <span className="truncate">{announcement.text || "Your announcement text appears here"}</span>
                        </div>
                        <span className="text-[8px] font-bold">DIRECT LINE</span>
                    </div>
                )}

                {/* Preview Navbar */}
                <div className="bg-black/90 border border-white/15 rounded-full py-2.5 px-6 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-1">
                        <span className="font-heading font-black text-lg text-white">D<span className="text-[#c5a059]">/</span>P</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/80 overflow-x-auto hide-scrollbar">
                        {navItems.map((item, i) => (
                            <span key={i} className="hover:text-[#c5a059] whitespace-nowrap">{item.label}</span>
                        ))}
                        <span className="text-gray-500 whitespace-nowrap">SERVICES ▾</span>
                    </div>
                    {cta.enabled && (
                        <div className="bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                            {cta.label}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                {/* 1. TOP ANNOUNCEMENT BANNER */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-3xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                📢 Top Announcement / Notice Bar
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
                                placeholder="e.g. STUDIO HQ or NOTICE"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Announcement Message</label>
                            <input
                                type="text"
                                value={announcement.text}
                                onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                                placeholder="85, Tilottama Plaza, Tower 2, Karunamoyee Ghat Road, Kolkata..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Clickable Link (URL or Google Maps)</label>
                            <input
                                type="text"
                                value={announcement.link}
                                onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                                placeholder="https://maps.app.goo.gl/... or /contact"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-bold font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. MAIN NAVIGATION MENU */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-3xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                🧭 Main Navigation Links
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                Add, remove, rename, or reorder menu items in the main navigation pill.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addNavItem}
                            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-[#c5a059] hover:text-black text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <span>+</span> Add Menu Link
                        </button>
                    </div>

                    <div className="space-y-3">
                        {navItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-white/15 transition-all"
                            >
                                <span className="text-[10px] font-mono text-gray-600 font-bold px-2">
                                    #{index + 1}
                                </span>

                                <div className="flex-1 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateNavItem(index, "label", e.target.value)}
                                        placeholder="Display Label (e.g. WEDDINGS)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#c5a059] outline-none text-xs font-black uppercase"
                                    />
                                </div>

                                <div className="flex-1 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={(e) => updateNavItem(index, "href", e.target.value)}
                                        placeholder="URL path (e.g. /luxury)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#c5a059] outline-none text-xs font-mono"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => moveItem(index, -1)}
                                        className="p-2 text-gray-400 hover:text-white disabled:opacity-20 text-xs"
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        disabled={index === navItems.length - 1}
                                        onClick={() => moveItem(index, 1)}
                                        className="p-2 text-gray-400 hover:text-white disabled:opacity-20 text-xs"
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeNavItem(index)}
                                        className="p-2 text-red-500/60 hover:text-red-400 text-xs ml-2"
                                        title="Remove link"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. HEADER CTA BUTTON */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-3xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">
                                ✨ Navigation Call-to-Action (CTA) Button
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                The high-converting gold action button on the right side of the navbar.
                            </p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {cta.enabled ? "Enabled" : "Disabled"}
                            </span>
                            <input
                                type="checkbox"
                                checked={cta.enabled}
                                onChange={(e) => setCta({ ...cta, enabled: e.target.checked })}
                                className="w-5 h-5 accent-[#c5a059] cursor-pointer"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Button Text</label>
                            <input
                                type="text"
                                value={cta.label}
                                onChange={(e) => setCta({ ...cta, label: e.target.value })}
                                placeholder="INQUIRE NOW"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-black uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Button Link</label>
                            <input
                                type="text"
                                value={cta.href}
                                onChange={(e) => setCta({ ...cta, href: e.target.value })}
                                placeholder="/contact"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Save Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-12 md:right-12 md:left-auto md:translate-x-0 z-[100] flex items-center gap-4 md:gap-6 bg-black/90 backdrop-blur-xl border border-[#c5a059]/40 p-3 md:p-4 rounded-full shadow-2xl w-[90%] md:w-auto justify-center md:justify-start">
                    {message && (
                        <p className={`text-[10px] font-black uppercase tracking-widest px-4 ${message.includes("Error") ? "text-red-500" : "text-[#c5a059]"}`}>
                            {message}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#c5a059] text-black hover:bg-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-lg cursor-pointer"
                    >
                        {saving ? "Saving Changes..." : "Save Navigation"}
                    </button>
                </div>
            </form>
        </div>
    );
}
