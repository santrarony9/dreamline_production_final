"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Curated flagship services catalog matching the website's pages
const SERVICE_GROUPS = [
    {
        category: "Weddings & Celebrations",
        icon: "💍",
        items: [
            {
                title: "Luxury Wedding Cinema",
                desc: "Cinematic 4K films & candid photography",
                href: "/services/wedding-photography-kolkata/",
                badge: "Signature"
            },
            {
                title: "Pre-Wedding Cinema",
                desc: "Romantic destination narratives & shoots",
                href: "/services/pre-wedding-shoot-kolkata/"
            },
            {
                title: "Traditional & Rice Ceremonies",
                desc: "Bengali rituals & family celebrations",
                href: "/services/rice-ceremony-photography-kolkata/"
            }
        ]
    },
    {
        category: "Commercial & Digital",
        icon: "🎥",
        items: [
            {
                title: "Commercial Ad Films",
                desc: "Brand commercials, TVCs & campaign films",
                href: "/services/video-production-agency-kolkata/",
                badge: "Featured"
            },
            {
                title: "Corporate & Documentaries",
                desc: "Executive profiles & corporate stories",
                href: "/services/corporate-photography-kolkata/"
            },
            {
                title: "Drone & Aerial Shoots",
                desc: "DGCA-certified 4K aerial cinematography",
                href: "/services/drone-videography-kolkata/"
            },
            {
                title: "Tech & 3D Solutions",
                desc: "3D mapping, VFX & digital innovation",
                href: "/tech"
            }
        ]
    }
];

export default function Navbar({ initialServices, siteContent }) {
    const pathname = usePathname();
    const [services, setServices] = useState(initialServices || []);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    const dropdownRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const triggerBtnRef = useRef(null);

    useEffect(() => {
        if (initialServices) {
            setServices(initialServices);
        }
    }, [initialServices]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdowns on route changes
    useEffect(() => {
        setIsServicesOpen(false);
        setIsMenuOpen(false);
        setOpenSubMenu(null);
    }, [pathname]);

    // Handle clicks outside dropdown and Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsServicesOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isServicesOpen) {
                setIsServicesOpen(false);
                if (triggerBtnRef.current) {
                    triggerBtnRef.current.focus();
                }
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
    }, [isServicesOpen]);

    // Smooth hover & click handlers with debouncing to prevent flickering
    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsServicesOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsServicesOpen(false);
        }, 220); // 220ms grace period prevents disappearing when moving mouse
    };

    const handleToggleServices = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsServicesOpen(prev => !prev);
    };

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const getServiceLink = (service) => {
        if (!service) return '/services/';
        if (typeof service === 'string') {
            const clean = service.toLowerCase().trim();
            if (clean.includes('luxury') || (clean.includes('wedding') && !clean.includes('pre-wedding'))) return '/services/wedding-photography-kolkata/';
            if (clean.includes('pre-wedding')) return '/services/pre-wedding-shoot-kolkata/';
            if (clean.includes('rice') || clean.includes('annaprashan')) return '/services/rice-ceremony-photography-kolkata/';
            if (clean.includes('commercial')) return '/services/video-production-agency-kolkata/';
            if (clean.includes('corporate')) return '/services/corporate-photography-kolkata/';
            if (clean.includes('drone')) return '/services/drone-videography-kolkata/';
            if (clean.includes('podcast')) return '/services/podcast-production-kolkata/';
            if (clean.includes('documentary')) return '/services/documentary-film-production-kolkata/';
            if (clean.includes('brand promotion') || clean.includes('brand film')) return '/services/brand-promotion-kolkata/';
            if (clean.includes('3d') || clean.includes('mapping')) return '/services/3d-area-mapping-kolkata/';
            if (clean.includes('2d') || clean.includes('animation')) return '/services/2d-animation-kolkata/';
            return `/services/${slugify(clean)}/`;
        }

        const cat = service.category || '';
        const title = (service.title || service.name || '').toLowerCase();
        
        if (service.href) return service.href.endsWith('/') ? service.href : `${service.href}/`;
        if (service.slug) return `/services/${service.slug}/`;
        if (cat === 'wedding' || title.includes('luxury') || (title.includes('wedding') && !title.includes('pre-wedding'))) return '/services/wedding-photography-kolkata/';
        if (title.includes('pre-wedding')) return '/services/pre-wedding-shoot-kolkata/';
        if (title.includes('rice') || title.includes('annaprashan')) return '/services/rice-ceremony-photography-kolkata/';
        if (cat === 'commercial' && !title.includes('corporate') && !title.includes('brand promotion')) return '/services/video-production-agency-kolkata/';
        if (title.includes('corporate')) return '/services/corporate-photography-kolkata/';
        if (title.includes('brand promotion') || title.includes('brand film')) return '/services/brand-promotion-kolkata/';
        if (title.includes('drone')) return '/services/drone-videography-kolkata/';
        if (title.includes('podcast')) return '/services/podcast-production-kolkata/';
        if (title.includes('documentary')) return '/services/documentary-film-production-kolkata/';
        return `/services/${slugify(service.title || service.name || '')}/`;
    };

    // Google Business & Studio Headquarters Info
    const google = siteContent?.global?.google || {};
    const contact = siteContent?.global?.contact || {};
    const businessName = google.businessName || siteContent?.global?.company?.name || "Dreamline Production";
    const businessAddress = contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082";
    const gmbUrl = google.profileUrl || google.mapsUrl || "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9";
    const directionsUrl = google.directionsUrl || "https://www.google.com/maps/dir/?api=1&destination=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&destination_place_id=ChIJj45i25BwAjoRO1La59wUhTs";

    // Dynamic announcement from database
    const announcement = siteContent?.global?.announcement || {
        enabled: true,
        badge: "STUDIO HQ",
        text: businessAddress,
        link: gmbUrl
    };

    const headerAddressText = announcement.text || businessAddress;
    const headerAddressLink = announcement.link || gmbUrl;

    // Dynamic CTA button
    const cta = siteContent?.global?.navigation?.cta || {
        label: "INQUIRE NOW",
        href: "/contact",
        enabled: true
    };

    const phone = siteContent?.global?.contact?.phone || "+91 82400 54002";
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // Dynamic or fallback navigation menu items
    const customNavItems = siteContent?.global?.navigation?.items;
    const defaultNavItems = [
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
        { label: "WEDDINGS", href: "/luxury" },
        { label: "COMMERCIAL", href: "/commercial" },
        { label: "BLOG", href: "/blogs" },
        { label: "CONTACT", href: "/contact" },
    ];
    const navItems = (Array.isArray(customNavItems) && customNavItems.length > 0) ? customNavItems : defaultNavItems;

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    const isServicesActive = pathname?.startsWith('/services') || pathname === '/luxury' || pathname === '/commercial' || pathname === '/tech';

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

            <nav
                className={`fixed left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-6xl rounded-full nav-glass py-2.5 px-6 md:px-8 flex justify-between items-center transition-all duration-500 ${
                    isScrolled 
                        ? "top-3 md:top-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] scale-[0.99] border-white/15 bg-black/85 backdrop-blur-xl" 
                        : (announcement.enabled !== false ? "top-8 sm:top-9 lg:top-10" : "top-4 lg:top-6")
                }`}
                style={{ overflow: 'visible' }}
            >
                {/* COLUMN 1: LOGO */}
                <div className="flex items-center justify-start min-w-[120px]">
                    <Link href="/" className="flex items-end gap-1.5 group interactive">
                        <span className="font-heading font-black text-2xl tracking-tighter text-white group-hover:text-[#c5a059] transition-colors">
                            D<span className="text-[#c5a059]">/</span>P
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1.5 animate-pulse"></span>
                    </Link>
                </div>

                {/* COLUMN 2: CENTERED NAVIGATION */}
                <div className="hidden lg:flex justify-center items-center gap-6 xl:gap-8 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {navItems.map((item, idx) => {
                        const active = isActive(item.href);
                        return (
                            <Link 
                                key={idx} 
                                href={item.href} 
                                className={`relative py-1 transition-all group ${
                                    active 
                                        ? "text-[#c5a059] font-black" 
                                        : "text-white/75 hover:text-white"
                                }`}
                            >
                                <span>{item.label}</span>
                                {active && (
                                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                                )}
                            </Link>
                        );
                    })}

                    {/* SERVICES DROPDOWN (Hybrid Click + Hover with Anti-Flicker Bridge) */}
                    <div 
                        ref={dropdownRef}
                        className="relative py-1"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button 
                            ref={triggerBtnRef}
                            type="button"
                            aria-label="Toggle services menu" 
                            aria-haspopup="true"
                            aria-expanded={isServicesOpen}
                            onClick={handleToggleServices}
                            className={`flex items-center gap-1.5 uppercase font-black transition-colors cursor-pointer select-none py-1 ${
                                isServicesOpen || isServicesActive ? "text-[#c5a059]" : "text-white/75 hover:text-white"
                            }`}
                        >
                            <span>SERVICES</span>
                            <svg 
                                className={`w-2.5 h-2.5 transition-transform duration-300 ${
                                    isServicesOpen ? "rotate-180 text-[#c5a059]" : "opacity-40"
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Invisible bridge to prevent mouseleave gap */}
                        <div className="absolute -bottom-3 left-0 w-full h-3 pointer-events-auto" />

                        {/* Dropdown Menu Container */}
                        <div 
                            role="menu"
                            aria-orientation="vertical"
                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[200] transition-all duration-300 ease-out ${
                                isServicesOpen 
                                    ? "opacity-100 translate-y-0 pointer-events-auto visible" 
                                    : "opacity-0 -translate-y-2 pointer-events-none invisible"
                            }`}
                            style={{ minWidth: "580px", maxWidth: "94vw" }}
                        >
                            <div className="bg-[#0c0c0c]/98 backdrop-blur-2xl border border-[#c5a059]/25 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
                                <div className="grid grid-cols-2 gap-6">
                                    {SERVICE_GROUPS.map((group, gIdx) => (
                                        <div key={gIdx} className="space-y-3">
                                            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                                <span className="text-sm">{group.icon}</span>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">
                                                    {group.category}
                                                </h3>
                                            </div>
                                            <div className="space-y-1.5">
                                                {group.items.map((item, iIdx) => (
                                                    <Link
                                                        key={iIdx}
                                                        href={item.href}
                                                        role="menuitem"
                                                        onClick={() => setIsServicesOpen(false)}
                                                        className="group/item flex flex-col p-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors">
                                                                {item.title}
                                                            </span>
                                                            {item.badge && (
                                                                <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-0.5 group-hover/item:text-gray-300 transition-colors">
                                                            {item.desc}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Services from Database (if customized) */}
                                {services.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                Additional Production Specialties:
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {services.map((srv, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={getServiceLink(srv)}
                                                    role="menuitem"
                                                    onClick={() => setIsServicesOpen(false)}
                                                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    {(srv.title || srv.name || '').toUpperCase()}
                                                </Link>
                                            ))}
                                            <Link
                                                href="/services/podcast-production-kolkata/"
                                                role="menuitem"
                                                onClick={() => setIsServicesOpen(false)}
                                                className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                PODCAST SHOOTS
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Directory Footer */}
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                        Studio HQ • Kolkata & Destination
                                    </span>
                                    <Link
                                        href="/services/"
                                        role="menuitem"
                                        onClick={() => setIsServicesOpen(false)}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#c5a059] hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        <span>View All Services (12+)</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: CTA & MOBILE TOGGLE */}
                <div className="flex items-center justify-end gap-3 min-w-[120px]">
                    {/* Desktop CTA Button */}
                    {cta.enabled !== false && (
                        <Link
                            href={cta.href || "/contact"}
                            className="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] transition-all duration-300 interactive"
                        >
                            <span>{cta.label || "INQUIRE NOW"}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        aria-label="Toggle mobile menu"
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

            {/* Mobile Menu Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[998] transition-opacity duration-500 lg:hidden ${
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Drawer */}
            <div
                className={`fixed top-0 right-0 h-[100dvh] w-[88vw] max-w-[420px] bg-[#080808] border-l border-white/10 z-[999] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col justify-between overflow-y-auto hide-scrollbar ${
                    isMenuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col text-left mt-24 px-8 space-y-1">
                    {navItems.map((item, idx) => {
                        const active = isActive(item.href);
                        return (
                            <Link 
                                key={idx}
                                onClick={() => setIsMenuOpen(false)} 
                                href={item.href} 
                                className={`py-4 border-b border-white/5 font-heading text-2xl font-black uppercase transition-colors flex items-center justify-between ${
                                    active ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                                }`}
                            >
                                <span>{item.label}</span>
                                {active && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                            </Link>
                        );
                    })}
                    
                    {/* Mobile Services Accordion */}
                    <div className="py-4 border-b border-white/5">
                        <button 
                            type="button"
                            aria-label="Toggle mobile services menu"
                            aria-expanded={openSubMenu === 'services'}
                            onClick={() => setOpenSubMenu(openSubMenu === 'services' ? null : 'services')}
                            className="w-full flex items-center justify-between font-heading text-2xl font-black uppercase text-white hover:text-[#c5a059] transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>SERVICES</span>
                                <span className="text-[10px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-sans font-black tracking-widest">
                                    12+
                                </span>
                            </span>
                            <svg className={`w-5 h-5 transition-transform duration-300 ${openSubMenu === 'services' ? 'rotate-180 text-[#c5a059]' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`grid overflow-hidden transition-all duration-300 ${openSubMenu === 'services' ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                            <div className="overflow-hidden flex flex-col gap-3 pl-4 border-l-2 border-[#c5a059]/40 py-2">
                                {SERVICE_GROUPS.flatMap(g => g.items).map((item, idx) => (
                                    <Link
                                        key={idx}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setOpenSubMenu(null);
                                        }}
                                        href={item.href}
                                        className="py-1 text-xs font-bold text-gray-300 hover:text-[#c5a059] transition-colors flex items-center justify-between group"
                                    >
                                        <span className="uppercase tracking-wider">{item.title}</span>
                                        {item.badge && (
                                            <span className="text-[8px] bg-white/5 text-[#c5a059] px-2 py-0.5 rounded font-black">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                                <Link
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setOpenSubMenu(null);
                                    }}
                                    href="/services/"
                                    className="pt-2 text-xs font-black text-[#c5a059] hover:text-white uppercase tracking-widest flex items-center gap-1"
                                >
                                    <span>Explore All Services →</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                    {/* Studio HQ & Google Business Profile Card */}
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

                    <Link
                        onClick={() => setIsMenuOpen(false)}
                        href={cta.href || "/contact"}
                        className="w-full py-4 flex items-center justify-center gap-2 bg-[#c5a059] text-black font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                        <span>{cta.label || "INQUIRE NOW"}</span>
                    </Link>

                    <a 
                        href={`tel:${cleanPhone}`} 
                        className="w-full py-3.5 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors"
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
