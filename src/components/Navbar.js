"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_NAVIGATION_SEED } from "@/lib/navigation-defaults";

export default function Navbar({ initialServices, siteContent }) {
    const pathname = usePathname();
    const [navItems, setNavItems] = useState(siteContent?.navigationTree || DEFAULT_NAVIGATION_SEED);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openMobileSubMenu, setOpenMobileSubMenu] = useState(null);
    const [openMobileCategory, setOpenMobileCategory] = useState("CORPORATE");
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const dropdownContainerRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    // Sync navigationTree from siteContent if updated
    useEffect(() => {
        if (Array.isArray(siteContent?.navigationTree) && siteContent.navigationTree.length > 0) {
            setNavItems(siteContent.navigationTree);
        }
    }, [siteContent?.navigationTree]);

    // Auto-sync navigation on window focus (for instant updates across browser tabs)
    useEffect(() => {
        const handleSyncNavigation = async () => {
            try {
                const res = await fetch("/api/navigation");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.items) && data.items.length > 0) {
                        setNavItems(data.items);
                    }
                }
            } catch (err) {
                // Background sync silent fallback
            }
        };

        window.addEventListener("focus", handleSyncNavigation);
        return () => window.removeEventListener("focus", handleSyncNavigation);
    }, []);

    // Handle scroll styling (floating pill elevation)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close all open dropdowns and mobile menus on route change
    useEffect(() => {
        setActiveDropdownId(null);
        setIsMenuOpen(false);
        setOpenMobileSubMenu(null);
        setOpenMobileCategory(null);
    }, [pathname]);

    // Close dropdown on click outside or Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
                setActiveDropdownId(null);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setActiveDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    // Hover & Click handlers for dynamic dropdowns with 280ms anti-flicker debounce
    const handleMouseEnter = (itemId) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveDropdownId(itemId);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveDropdownId(null);
        }, 280);
    };

    const handleToggleDropdown = (e, itemId) => {
        e.preventDefault();
        e.stopPropagation();
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveDropdownId(prev => prev === itemId ? null : itemId);
    };

    // Google Business & Studio Headquarters Info from database
    const google = siteContent?.global?.google || {};
    const contact = siteContent?.global?.contact || {};
    const businessAddress = contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082";
    const gmbUrl = google.profileUrl || google.mapsUrl || "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9";
    const directionsUrl = google.directionsUrl || "https://www.google.com/maps/dir/?api=1&destination=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&destination_place_id=ChIJj45i25BwAjoRO1La59wUhTs";

    const announcement = siteContent?.global?.announcement || {
        enabled: true,
        badge: "STUDIO HQ",
        text: businessAddress,
        link: gmbUrl
    };

    const headerAddressText = announcement.text || businessAddress;
    const headerAddressLink = announcement.link || gmbUrl;

    const cta = siteContent?.global?.navigation?.cta || {
        label: "GET A QUOTE",
        href: "/contact",
        enabled: true
    };

    const phone = siteContent?.global?.contact?.phone || "+91 82400 54002";
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // Helper: Determine if a menu link or any of its children is currently active
    const isItemActive = (item) => {
        if (!pathname) return false;
        if (item.url === "/" && pathname === "/") return true;
        if (item.url !== "/" && pathname.startsWith(item.url)) return true;
        if (Array.isArray(item.children) && item.children.length > 0) {
            return item.children.some(c => c.url && c.url !== "/" && pathname.startsWith(c.url));
        }
        return false;
    };

    // Helper: Group dropdown children by the "group" field if present
    const groupChildren = (children) => {
        if (!Array.isArray(children)) return [];
        const hasGroups = children.some(c => c.group && c.group.trim());
        if (!hasGroups) return null;

        const groupsMap = new Map();
        children.forEach(child => {
            const grp = child.group?.trim() || "General";
            if (!groupsMap.has(grp)) {
                groupsMap.set(grp, {
                    category: grp,
                    icon: child.icon || "🎬",
                    items: []
                });
            }
            groupsMap.get(grp).items.push(child);
        });

        return Array.from(groupsMap.values());
    };

    // Desktop items: active and marked for desktop display
    const desktopItems = (navItems || []).filter(item => item.isActive !== false && item.displayDesktop !== false);
    // Mobile items: active and marked for mobile display
    const mobileItems = (navItems || []).filter(item => item.isActive !== false && item.displayMobile !== false);

    return (
        <>
            {/* Top Announcement & Google Business Bar */}
            {announcement.enabled !== false && (
                <aside aria-label="Official Business Location & Announcement" className="w-full bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-wider py-1.5 px-4 sm:px-6 flex justify-between items-center z-[101] shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mx-auto lg:mx-0 min-w-0">
                        {announcement.badge && (
                            <span className="hidden sm:inline-block bg-black text-[#c5a059] px-2 py-0.5 rounded text-[8px] font-black tracking-widest flex-shrink-0">
                                {announcement.badge}
                            </span>
                        )}
                        <a 
                            href={headerAddressLink} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors flex items-center gap-1.5 font-bold truncate group"
                            title="Open Google Business Profile & Directions in a new tab"
                        >
                            <svg className="w-3.5 h-3.5 flex-shrink-0 text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span className="truncate max-w-[260px] sm:max-w-md md:max-w-lg lg:max-w-none">{headerAddressText}</span>
                            <span className="text-[10px] hidden sm:inline opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">↗</span>
                        </a>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 font-black text-[9px]">
                        <a 
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors underline font-bold"
                        >
                            Get Directions ↗
                        </a>
                        <span>|</span>
                        <div className="flex items-center gap-1.5">
                            <span>CALL:</span>
                            <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors underline font-bold">
                                {phone}
                            </a>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Floating Glass Navbar */}
            <nav
                ref={dropdownContainerRef}
                className={`fixed left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-6xl rounded-full nav-glass py-2.5 px-6 md:px-8 flex justify-between items-center transition-all duration-500 ${
                    isScrolled 
                        ? "top-3 md:top-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] scale-[0.99] border-white/15 bg-black/85 backdrop-blur-xl" 
                        : (announcement.enabled !== false ? "top-8 sm:top-9 lg:top-10" : "top-4 lg:top-6")
                }`}
                style={{ overflow: 'visible' }}
            >
                {/* COLUMN 1: BRAND LOGO */}
                <div className="flex items-center justify-start min-w-[120px]">
                    <Link href="/" className="flex items-end gap-1.5 group interactive" aria-label="Dreamline Production Home">
                        <span className="font-heading font-black text-2xl tracking-tighter text-white group-hover:text-[#c5a059] transition-colors">
                            D<span className="text-[#c5a059]">/</span>P
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1.5 animate-pulse"></span>
                    </Link>
                </div>

                {/* COLUMN 2: DYNAMIC HORIZONTAL MENU ITEMS */}
                <div className="hidden lg:flex justify-center items-center gap-5 xl:gap-7 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {desktopItems.map((item, idx) => {
                        const active = isItemActive(item);
                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                        const isDropdown = item.isDropdown || hasChildren;
                        const itemId = item.id || item._id || `nav-${idx}`;
                        const isOpen = activeDropdownId === itemId;
                        const grouped = hasChildren ? groupChildren(item.children) : null;
                        const isServicesMegaMenu = item.title === "SERVICES" || (grouped && grouped.length >= 4);

                        // Case A: Item with Dropdown / Submenu
                        if (isDropdown && hasChildren) {
                            return (
                                <div 
                                    key={itemId}
                                    className={isServicesMegaMenu ? "py-1" : "relative py-1"}
                                    onMouseEnter={() => handleMouseEnter(itemId)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="relative">
                                        <button
                                            type="button"
                                            aria-label={`Toggle ${item.title} menu`}
                                            aria-haspopup="true"
                                            aria-expanded={isOpen}
                                            onClick={(e) => handleToggleDropdown(e, itemId)}
                                            className={`flex items-center gap-1.5 uppercase font-black transition-colors cursor-pointer select-none py-1 ${
                                                isOpen || active ? "text-[#c5a059]" : "text-white/80 hover:text-white"
                                            }`}
                                        >
                                            <span>{item.title}</span>
                                            {item.badge && item.title !== "SERVICES" && (
                                                <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <svg 
                                                className={`w-2.5 h-2.5 transition-transform duration-300 ${
                                                    isOpen ? "rotate-180 text-[#c5a059]" : "opacity-50"
                                                }`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {active && !isOpen && (
                                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                                        )}

                                        {/* Invisible hover bridge to prevent cursor gap */}
                                        <div className="absolute top-full left-0 w-full h-4 pointer-events-auto" />
                                    </div>

                                    {/* Dropdown Menu Container */}
                                    <div 
                                        role="menu"
                                        aria-orientation="vertical"
                                        data-lenis-prevent="true"
                                        className={`absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[200] transition-all duration-300 ease-out whitespace-normal ${
                                            isOpen 
                                                ? "opacity-100 translate-y-0 pointer-events-auto visible" 
                                                : "opacity-0 -translate-y-2 pointer-events-none invisible"
                                        }`}
                                        style={{ 
                                            width: isServicesMegaMenu ? "min(1360px, 96vw)" : (grouped ? "780px" : "320px"), 
                                            maxWidth: "96vw" 
                                        }}
                                    >
                                        <div 
                                            data-lenis-prevent="true"
                                            className={`bg-[#0c0c0c] border border-[#c5a059]/35 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-left w-full whitespace-normal ${
                                            isServicesMegaMenu 
                                                ? "p-4 sm:p-5 lg:px-7 lg:py-4 max-h-[calc(100vh-80px)] xl:max-h-[calc(100vh-90px)] overflow-y-auto overscroll-contain custom-scrollbar" 
                                                : "p-6 lg:p-7"
                                        }`}>
                                            {/* Sub-variant 1: Mega Menu with Category Columns */}
                                            {grouped ? (
                                                <>
                                                    <div className={
                                                        isServicesMegaMenu
                                                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 xl:gap-6 items-start services-mega-grid-6col"
                                                            : `grid grid-cols-1 md:grid-cols-${Math.min(grouped.length, 3)} gap-6 items-start`
                                                    }>
                                                        {grouped.map((group, gIdx) => {
                                                            const catName = (group.category || "").toUpperCase().trim();
                                                            const isCorporate = catName === "CORPORATE";
                                                            const isDrone = catName === "DRONE & AERIAL" || catName.includes("DRONE");
                                                            const isTech = catName === "TECH";
                                                            const isEventManagement = catName === "EVENT MANAGEMENT";

                                                            // Column 3: DRONE & AERIAL (Exact screenshot design)
                                                            if (isDrone) {
                                                                return (
                                                                    <div key={gIdx} className="space-y-3 min-w-0 w-full">
                                                                        <div className="flex items-center pb-2.5 border-b border-[#242424]">
                                                                            <h3 className="text-xs font-black uppercase tracking-[0.22em] text-[#c5a059] truncate">
                                                                                DRONE &amp; AERIAL
                                                                            </h3>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            {group.items.map((sub, sIdx) => (
                                                                                <Link
                                                                                    key={sIdx}
                                                                                    href={sub.url}
                                                                                    target={sub.openInNewTab ? "_blank" : undefined}
                                                                                    rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                    role="menuitem"
                                                                                    onClick={() => setActiveDropdownId(null)}
                                                                                    className="group/item flex flex-col p-2 rounded-lg hover:bg-white/[0.04] transition-all text-left min-w-0 w-full box-border"
                                                                                >
                                                                                    <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
                                                                                        <span className="text-[12px] xl:text-[13px] font-black text-white group-hover/item:text-[#c5a059] uppercase tracking-wide transition-colors min-w-0 break-words whitespace-normal leading-tight">
                                                                                            {sub.title}
                                                                                        </span>
                                                                                        {sub.badge && (
                                                                                            <span className="text-[7.5px] bg-[#332815] text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded-[4px] font-black tracking-wider uppercase flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                                                                                {sub.badge}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {sub.description && (
                                                                                        <p className="services-mega-col-desc text-[9px] text-[#858d98] font-medium leading-relaxed mt-1 group-hover/item:text-gray-300 transition-colors uppercase tracking-wide">
                                                                                            {sub.description}
                                                                                        </p>
                                                                                    )}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // Column 2: CORPORATE (Commercial & Films)
                                                            if (isCorporate) {
                                                                return (
                                                                    <div key={gIdx} className="space-y-1 min-w-0 w-full flex flex-col justify-start pb-3">
                                                                        <div className="flex items-center pb-1.5 border-b border-[#c5a059]/20">
                                                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c5a059] truncate">
                                                                                CORPORATE
                                                                            </h3>
                                                                        </div>
                                                                        <div className="pb-1 border-b border-white/5 mb-0.5">
                                                                            <span className="text-[8.5px] font-black uppercase tracking-widest text-[#c5a059]/80 block truncate">
                                                                                COMMERCIAL &amp; FILMS
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-0.5 flex flex-col flex-1">
                                                                            {group.items.map((sub, sIdx) => {
                                                                                const isLast = sIdx === group.items.length - 1;
                                                                                return (
                                                                                    <Link
                                                                                        key={sIdx}
                                                                                        href={sub.url}
                                                                                        target={sub.openInNewTab ? "_blank" : undefined}
                                                                                        rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                        role="menuitem"
                                                                                        onClick={() => setActiveDropdownId(null)}
                                                                                        className={`group/item flex flex-col px-2 py-1 rounded-lg hover:bg-white/[0.05] border border-transparent hover:border-[#c5a059]/25 transition-all text-left min-w-0 w-full box-border ${
                                                                                            isLast ? "pb-2" : ""
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-start justify-between gap-1 w-full min-w-0">
                                                                                            <span className="services-mega-col-title text-[11px] font-bold text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors min-w-0 break-words whitespace-normal leading-tight">
                                                                                                {sub.title}
                                                                                            </span>
                                                                                            {sub.badge && (
                                                                                                <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                                                                                    {sub.badge}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        {sub.description && (
                                                                                            <p className="services-mega-col-desc text-[8.5px] text-gray-400 font-medium leading-[1.3] mt-0.5 group-hover/item:text-gray-300 transition-colors">
                                                                                                {sub.description}
                                                                                            </p>
                                                                                        )}
                                                                                    </Link>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // Column 5: TECH
                                                            if (isTech) {
                                                                return (
                                                                    <div key={gIdx} className="space-y-2.5 min-w-0 w-full">
                                                                        <div className="flex items-center pb-2 border-b border-[#c5a059]/20">
                                                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c5a059] truncate">
                                                                                TECH
                                                                            </h3>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            {group.items.map((sub, sIdx) => (
                                                                                <Link
                                                                                    key={sIdx}
                                                                                    href={sub.url}
                                                                                    target={sub.openInNewTab ? "_blank" : undefined}
                                                                                    rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                    role="menuitem"
                                                                                    onClick={() => setActiveDropdownId(null)}
                                                                                    className="group/item flex flex-col p-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-[#c5a059]/25 transition-all text-left min-w-0 w-full box-border"
                                                                                >
                                                                                    <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
                                                                                        <span className="text-[11.5px] xl:text-[12px] font-black text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors min-w-0 break-words whitespace-normal leading-tight">
                                                                                            {sub.title}
                                                                                        </span>
                                                                                        {sub.badge && (
                                                                                            <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                                                                                {sub.badge}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {sub.description && (
                                                                                        <p className="services-mega-col-desc text-[9px] text-gray-400 font-medium leading-relaxed mt-1 group-hover/item:text-gray-300 transition-colors uppercase tracking-wide">
                                                                                            {sub.description}
                                                                                        </p>
                                                                                    )}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // Column 6: EVENT MANAGEMENT
                                                            if (isEventManagement) {
                                                                const hasRealItems = group.items.length > 0 && group.items.some(it => it.badge !== "COMING SOON" && it.url !== "#");
                                                                return (
                                                                    <div key={gIdx} className="space-y-2.5 min-w-0 w-full">
                                                                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#c5a059]/20">
                                                                            <h3 className="text-[10.5px] xl:text-[11px] font-black uppercase tracking-[0.11em] xl:tracking-[0.13em] text-[#c5a059] whitespace-nowrap">
                                                                                EVENT MANAGEMENT
                                                                            </h3>
                                                                            <span className="text-[6.5px] xl:text-[7px] bg-[#332815] text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded font-black tracking-wider uppercase flex-shrink-0 whitespace-nowrap">
                                                                                COMING SOON
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            {hasRealItems ? (
                                                                                group.items.map((sub, sIdx) => (
                                                                                    <Link
                                                                                        key={sIdx}
                                                                                        href={sub.url}
                                                                                        target={sub.openInNewTab ? "_blank" : undefined}
                                                                                        rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                        role="menuitem"
                                                                                        onClick={() => setActiveDropdownId(null)}
                                                                                        className="group/item flex flex-col p-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-[#c5a059]/25 transition-all text-left min-w-0 w-full box-border"
                                                                                    >
                                                                                        <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
                                                                                            <span className="text-[11px] font-bold text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors min-w-0 break-words whitespace-normal leading-tight">
                                                                                                {sub.title}
                                                                                            </span>
                                                                                            {sub.badge && (
                                                                                                <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                                                                                    {sub.badge}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        {sub.description && (
                                                                                            <p className="services-mega-col-desc text-[9px] text-gray-400 font-medium leading-relaxed mt-0.5 group-hover/item:text-gray-300 transition-colors">
                                                                                                {sub.description}
                                                                                            </p>
                                                                                        )}
                                                                                    </Link>
                                                                                ))
                                                                            ) : (
                                                                                <div className="pt-2 space-y-2 select-none min-w-0 w-full text-left">
                                                                                    <p className="services-mega-col-desc text-[9px] text-gray-400 font-medium leading-relaxed">
                                                                                        {(group.items && group.items[0] && group.items[0].description) || "Full-scale corporate event planning, cultural festival stage production & artist coordination launching soon."}
                                                                                    </p>
                                                                                    <div className="flex items-center gap-1.5 pt-1 text-[8px] text-[#c5a059]/90 font-bold uppercase tracking-wider">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                                                                        <span>Launching Soon</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // Columns: WEDDING, SOCIAL, TECH & Any Dynamic Category
                                                            return (
                                                                <div key={gIdx} className="space-y-2.5 min-w-0 w-full">
                                                                    <div className="flex items-center pb-2 border-b border-[#c5a059]/20">
                                                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c5a059] truncate">
                                                                            {group.category}
                                                                        </h3>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {group.items.map((sub, sIdx) => {
                                                                            const isComingSoon = sub.badge === "COMING SOON" || sub.url === "#";
                                                                            if (isComingSoon) {
                                                                                return (
                                                                                    <div 
                                                                                        key={sIdx}
                                                                                        className="p-2.5 rounded-xl bg-white/[0.03] border border-[#c5a059]/20 space-y-1.5 select-none min-w-0 w-full box-border"
                                                                                    >
                                                                                        <div className="flex items-start justify-between gap-1 w-full min-w-0">
                                                                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider min-w-0 break-words whitespace-normal leading-tight">
                                                                                                {sub.title}
                                                                                            </span>
                                                                                            <span className="text-[7px] bg-[#332815] text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase flex-shrink-0 whitespace-nowrap self-start">
                                                                                                COMING SOON
                                                                                            </span>
                                                                                        </div>
                                                                                        {sub.description && (
                                                                                            <p className="services-mega-col-desc text-[8.5px] text-gray-400 font-medium leading-relaxed">
                                                                                                {sub.description}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <Link
                                                                                    key={sIdx}
                                                                                    href={sub.url}
                                                                                    target={sub.openInNewTab ? "_blank" : undefined}
                                                                                    rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                    role="menuitem"
                                                                                    onClick={() => setActiveDropdownId(null)}
                                                                                    className="group/item flex flex-col p-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-[#c5a059]/25 transition-all text-left min-w-0 w-full box-border"
                                                                                >
                                                                                    <div className="flex items-start justify-between gap-1.5 w-full min-w-0">
                                                                                        <span className="text-[11px] font-bold text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors min-w-0 break-words whitespace-normal leading-tight">
                                                                                            {sub.title}
                                                                                        </span>
                                                                                        {sub.badge && (
                                                                                            <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                                                                                {sub.badge}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {sub.description && (
                                                                                        <p className="services-mega-col-desc text-[9px] text-gray-400 font-medium leading-relaxed mt-0.5 group-hover/item:text-gray-300 transition-colors">
                                                                                            {sub.description}
                                                                                        </p>
                                                                                    )}
                                                                                </Link>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Dropdown Directory Footer */}
                                                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                            Studio HQ • 85, Tilottama Plaza, Karunamoyee Ghat Road, Kolkata
                                                        </span>
                                                        <Link
                                                            href={item.url || "/services/"}
                                                            role="menuitem"
                                                            onClick={() => setActiveDropdownId(null)}
                                                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#c5a059] hover:text-white uppercase tracking-widest transition-colors"
                                                        >
                                                            <span>Explore All {item.title}</span>
                                                            <span>→</span>
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Sub-variant 2: Sleek Single-Column Card List */
                                                <div className="space-y-1.5">
                                                    {item.children.map((sub, sIdx) => (
                                                        <Link
                                                            key={sIdx}
                                                            href={sub.url}
                                                            target={sub.openInNewTab ? "_blank" : undefined}
                                                            rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                            role="menuitem"
                                                            onClick={() => setActiveDropdownId(null)}
                                                            className="group/pitem flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all"
                                                        >
                                                            {sub.icon && <span className="text-base mt-0.5">{sub.icon}</span>}
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-bold text-white group-hover/pitem:text-[#c5a059] uppercase tracking-wider block transition-colors">
                                                                        {sub.title}
                                                                    </span>
                                                                    {sub.badge && (
                                                                        <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                                            {sub.badge}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {sub.description && (
                                                                    <span className="text-[10px] text-gray-400 font-medium block leading-tight mt-0.5">
                                                                        {sub.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Case B: Standard Direct Menu Link
                        return (
                            <Link 
                                key={itemId} 
                                href={item.url}
                                target={item.openInNewTab ? "_blank" : undefined}
                                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                                className={`relative py-1 transition-all group ${
                                    active ? "text-[#c5a059] font-black" : "text-white/80 hover:text-white"
                                }`}
                            >
                                <span>{item.title}</span>
                                {item.badge && (
                                    <span className="ml-1 text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                        {item.badge}
                                    </span>
                                )}
                                {active && (
                                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* COLUMN 3: CTA BUTTON ("GET A QUOTE") & MOBILE HAMBURGER BUTTON */}
                <div className="flex items-center justify-end gap-3 min-w-[120px]">
                    {/* Desktop CTA Button */}
                    {cta.enabled !== false && (
                        <Link
                            href={cta.href || "/contact"}
                            className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] transition-all duration-300 interactive shadow-md"
                        >
                            <span>{cta.label || "GET A QUOTE"}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    )}

                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        type="button"
                        aria-label="Toggle mobile navigation menu"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-white hover:text-[#c5a059] transition-colors relative z-[1001]"
                    >
                        <div className="w-6 h-5 flex flex-col justify-between">
                            <span className={`w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-left ${isMenuOpen ? "rotate-45 translate-x-1" : ""}`}></span>
                            <span className={`w-full h-[2px] bg-white rounded-full transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`}></span>
                            <span className={`w-full h-[2px] bg-white rounded-full transition-all duration-300 origin-left ${isMenuOpen ? "-rotate-45 translate-x-1" : ""}`}></span>
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Backdrop Blur */}
            <div 
                className={`fixed inset-0 bg-black/85 backdrop-blur-md z-[998] transition-opacity duration-500 lg:hidden ${
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Navigation Drawer */}
            <div
                data-lenis-prevent="true"
                className={`fixed top-0 right-0 h-[100dvh] w-[88vw] max-w-[420px] bg-[#080808] border-l border-white/10 z-[999] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col justify-between overflow-y-auto hide-scrollbar ${
                    isMenuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col text-left mt-24 px-6 sm:px-8 space-y-1">
                    {mobileItems.map((item, idx) => {
                        const active = isItemActive(item);
                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                        const isDropdown = item.isDropdown || hasChildren;
                        const itemId = item.id || item._id || `m-nav-${idx}`;
                        const isOpen = openMobileSubMenu === itemId;
                        const grouped = hasChildren ? groupChildren(item.children) : null;

                        // Case A: Mobile Expandable Submenu Accordion
                        if (isDropdown && hasChildren) {
                            return (
                                <div key={itemId} className="py-3.5 border-b border-white/5">
                                    <button 
                                        type="button"
                                        aria-label={`Toggle mobile ${item.title} submenu`}
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenMobileSubMenu(isOpen ? null : itemId)}
                                        className="w-full flex items-center justify-between font-heading text-xl font-black uppercase text-white hover:text-[#c5a059] transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{item.title}</span>
                                            {item.badge && item.title !== "SERVICES" && (
                                                <span className="text-[10px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-sans font-black tracking-widest">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </span>
                                        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#c5a059]' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div className={`grid overflow-hidden transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                        <div className="overflow-hidden flex flex-col gap-4 pl-3 border-l-2 border-[#c5a059]/40 py-2">
                                            {grouped ? (
                                                <div className="flex flex-col gap-2">
                                                    {grouped.map((group, gIdx) => {
                                                        const isCatOpen = openMobileCategory === group.category;
                                                        const isCorporate = group.category === "CORPORATE";
                                                        const isEventManagement = group.category === "EVENT MANAGEMENT";

                                                        return (
                                                            <div key={gIdx} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMobileCategory(prev => prev === group.category ? null : group.category);
                                                                    }}
                                                                    className="w-full flex items-center justify-between p-2.5 text-left hover:bg-white/5 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[11px] font-black uppercase tracking-wider text-[#c5a059]">
                                                                            {group.category}
                                                                        </span>
                                                                        {isEventManagement && (
                                                                            <span className="text-[7px] bg-[#332815] text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase border border-[#c5a059]/30">
                                                                                COMING SOON
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <svg 
                                                                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isCatOpen ? 'rotate-180 text-[#c5a059]' : ''}`} 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>

                                                                <div className={`grid overflow-hidden transition-all duration-300 ${isCatOpen ? 'grid-rows-[1fr] opacity-100 p-2 pt-0 border-t border-white/5' : 'grid-rows-[0fr] opacity-0'}`}>
                                                                    <div className="overflow-hidden flex flex-col gap-1 pt-1.5 pb-3">
                                                                        {(() => {
                                                                            const catName = (group.category || "").toUpperCase().trim();
                                                                            const isDrone = catName === "DRONE & AERIAL" || catName.includes("DRONE");
                                                                            const isCorporate = catName === "CORPORATE";

                                                                            return (
                                                                                <>
                                                                                    {isCorporate && (
                                                                                        <div className="pb-1 border-b border-white/5 mb-1 px-2">
                                                                                            <span className="text-[8.5px] font-black uppercase tracking-widest text-[#c5a059]/80 block">
                                                                                                COMMERCIAL &amp; FILMS
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {group.items.map((sub, sIdx) => {
                                                                                        const isComingSoon = sub.badge === "COMING SOON" || sub.url === "#";
                                                                                        if (isComingSoon) {
                                                                                            return (
                                                                                                <div key={sIdx} className="p-2 space-y-1.5 text-left select-none">
                                                                                                    <p className="text-[9px] text-gray-400 leading-relaxed">
                                                                                                        {sub.description}
                                                                                                    </p>
                                                                                                    <div className="flex items-center gap-1.5 pt-1 text-[8px] text-[#c5a059]/90 font-bold uppercase tracking-wider">
                                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                                                                                        <span>Launching Soon</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        }

                                                                                        return (
                                                                                            <Link
                                                                                                key={sIdx}
                                                                                                onClick={() => {
                                                                                                    setIsMenuOpen(false);
                                                                                                    setOpenMobileSubMenu(null);
                                                                                                }}
                                                                                                href={sub.url}
                                                                                                target={sub.openInNewTab ? "_blank" : undefined}
                                                                                                rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                                                                className="p-2 rounded-lg hover:bg-white/5 transition-colors flex flex-col gap-0.5 text-left"
                                                                                            >
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                                                                        {sub.title}
                                                                                                    </span>
                                                                                                    {sub.badge && (
                                                                                                        <span className={`text-[7px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${
                                                                                                            isDrone
                                                                                                                ? "bg-[#332815] text-[#c5a059] border border-[#c5a059]/30"
                                                                                                                : "bg-[#c5a059]/15 text-[#c5a059]"
                                                                                                        }`}>
                                                                                                            {sub.badge}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                {sub.description && (
                                                                                                    <p className="text-[9px] text-gray-400 leading-tight">
                                                                                                        {sub.description}
                                                                                                    </p>
                                                                                                )}
                                                                                            </Link>
                                                                                        );
                                                                                    })}
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                item.children.map((sub, sIdx) => (
                                                    <Link
                                                        key={sIdx}
                                                        onClick={() => {
                                                            setIsMenuOpen(false);
                                                            setOpenMobileSubMenu(null);
                                                        }}
                                                        href={sub.url}
                                                        target={sub.openInNewTab ? "_blank" : undefined}
                                                        rel={sub.openInNewTab ? "noopener noreferrer" : undefined}
                                                        className="py-1 text-xs font-bold text-gray-300 hover:text-[#c5a059] transition-colors flex items-center gap-2"
                                                    >
                                                        {sub.icon && <span>{sub.icon}</span>}
                                                        <span className="uppercase tracking-wider">{sub.title}</span>
                                                    </Link>
                                                ))
                                            )}
                                            <Link
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setOpenMobileSubMenu(null);
                                                }}
                                                href={item.url || "/services/"}
                                                className="pt-2 text-xs font-black text-[#c5a059] hover:text-white uppercase tracking-widest flex items-center gap-1"
                                            >
                                                <span>Explore All {item.title} →</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Case B: Standard Mobile Direct Menu Link
                        return (
                            <Link 
                                key={itemId}
                                onClick={() => setIsMenuOpen(false)} 
                                href={item.url}
                                target={item.openInNewTab ? "_blank" : undefined}
                                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                                className={`py-3.5 border-b border-white/5 font-heading text-xl font-black uppercase transition-colors flex items-center justify-between ${
                                    active ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                                }`}
                            >
                                <span>{item.title}</span>
                                {item.badge && (
                                    <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-sans font-black tracking-widest uppercase">
                                        {item.badge}
                                    </span>
                                )}
                                {active && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Drawer Bottom Section (Studio HQ & CTAs) */}
                <div className="p-6 space-y-4">
                    {/* Studio HQ Card */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded">
                                STUDIO HEADQUARTERS
                            </span>
                            <span className="text-[9px] text-yellow-400 font-bold">★ 4.9 Google</span>
                        </div>
                        <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                            {businessAddress}
                        </p>
                        <div className="flex gap-2 pt-1">
                            <a 
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 text-center rounded-lg bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-wider hover:bg-white transition-colors"
                            >
                                Directions ↗
                            </a>
                            <a 
                                href={gmbUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 text-center rounded-lg bg-white/10 text-white text-[9px] font-black uppercase tracking-wider hover:bg-white/20 transition-colors"
                            >
                                Google Maps ↗
                            </a>
                        </div>
                    </div>

                    {/* Mobile Get a Quote CTA */}
                    {cta.enabled !== false && (
                        <Link
                            onClick={() => setIsMenuOpen(false)}
                            href={cta.href || "/contact"}
                            className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#c5a059] text-black font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white transition-colors shadow-lg"
                        >
                            <span>{cta.label || "GET A QUOTE"}</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    )}

                    {/* Mobile Direct Telephone Call */}
                    <a 
                        href={`tel:${cleanPhone}`} 
                        className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>CALL: {phone}</span>
                    </a>
                </div>
            </div>
        </>
    );
}
