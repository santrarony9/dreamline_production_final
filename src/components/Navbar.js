"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Curated flagship services catalog matching the website's existing verified pages
const SERVICE_GROUPS = [
    {
        category: "Drone & Aerial",
        icon: "🛸",
        items: [
            {
                title: "Drone Photography",
                desc: "DGCA-certified 4K aerial photography for architecture & events",
                href: "/services/drone-photography-kolkata/",
                badge: "Certified"
            },
            {
                title: "Drone Videography",
                desc: "Cinematic 4K FPV aerial cinematography & dynamic reels",
                href: "/services/drone-videography-kolkata/",
                badge: "Popular"
            },
            {
                title: "3D Area Mapping",
                desc: "Aerial photogrammetry, topographical surveys & 3D models",
                href: "/services/3d-area-mapping-kolkata/"
            }
        ]
    },
    {
        category: "Commercial & Corporate",
        icon: "🎥",
        items: [
            {
                title: "Video Production Agency",
                desc: "Brand commercials, TVCs, ad films & digital campaigns",
                href: "/services/video-production-agency-kolkata/",
                badge: "Featured"
            },
            {
                title: "Corporate Photography",
                desc: "Executive portraits, facility walkthroughs & brand stories",
                href: "/services/corporate-photography-kolkata/"
            },
            {
                title: "Podcast Production",
                desc: "Multi-camera 4K podcast recording & audio engineering in Kolkata",
                href: "/services/podcast-production-kolkata/"
            },
            {
                title: "Documentary Films",
                desc: "Engaging cultural narratives & corporate documentaries",
                href: "/services/documentary-film-production-kolkata/"
            }
        ]
    },
    {
        category: "Weddings & Celebrations",
        icon: "💍",
        items: [
            {
                title: "Wedding Photography",
                desc: "Luxury candid photography & emotional Bengali rituals",
                href: "/services/wedding-photography-kolkata/",
                badge: "Signature"
            },
            {
                title: "Pre-Wedding Shoots",
                desc: "Cinematic romantic storytelling at Prinsep Ghat & heritage sites",
                href: "/services/pre-wedding-shoot-kolkata/"
            },
            {
                title: "Rice Ceremony",
                desc: "Traditional Annaprashan milestones & cherished family rituals",
                href: "/services/rice-ceremony-photography-kolkata/"
            }
        ]
    }
];

const PORTFOLIO_GROUPS = [
    {
        title: "Master Portfolio",
        desc: "Complete showcase of cinema & commercial work",
        href: "/portfolio/",
        icon: "✨"
    },
    {
        title: "Luxury Wedding Cinema",
        desc: "Award-winning Bengali & destination wedding films",
        href: "/luxury",
        icon: "💍"
    },
    {
        title: "Commercial & Ad Films",
        desc: "High-impact brand campaigns, TVCs & corporate stories",
        href: "/commercial",
        icon: "🎥"
    },
    {
        title: "Tech & 3D Innovation",
        desc: "3D area mapping, VFX & digital web engineering",
        href: "/tech",
        icon: "💻"
    }
];

export default function Navbar({ initialServices, siteContent }) {
    const pathname = usePathname();
    const [services, setServices] = useState(initialServices || []);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openMobileSubMenu, setOpenMobileSubMenu] = useState(null);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

    const servicesDropdownRef = useRef(null);
    const portfolioDropdownRef = useRef(null);
    const servicesTimeoutRef = useRef(null);
    const portfolioTimeoutRef = useRef(null);
    const servicesTriggerRef = useRef(null);
    const portfolioTriggerRef = useRef(null);

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

    // Close all dropdowns and mobile menus on route change
    useEffect(() => {
        setIsServicesOpen(false);
        setIsPortfolioOpen(false);
        setIsMenuOpen(false);
        setOpenMobileSubMenu(null);
    }, [pathname]);

    // Handle clicks outside dropdowns and Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target)) {
                setIsServicesOpen(false);
            }
            if (portfolioDropdownRef.current && !portfolioDropdownRef.current.contains(e.target)) {
                setIsPortfolioOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (isServicesOpen) {
                    setIsServicesOpen(false);
                    servicesTriggerRef.current?.focus();
                }
                if (isPortfolioOpen) {
                    setIsPortfolioOpen(false);
                    portfolioTriggerRef.current?.focus();
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
            if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
            if (portfolioTimeoutRef.current) clearTimeout(portfolioTimeoutRef.current);
        };
    }, [isServicesOpen, isPortfolioOpen]);

    // Hover & Click handlers for Services Dropdown with 280ms anti-flicker debounce
    const handleServicesEnter = () => {
        if (servicesTimeoutRef.current) {
            clearTimeout(servicesTimeoutRef.current);
            servicesTimeoutRef.current = null;
        }
        setIsPortfolioOpen(false);
        setIsServicesOpen(true);
    };

    const handleServicesLeave = () => {
        servicesTimeoutRef.current = setTimeout(() => {
            setIsServicesOpen(false);
        }, 280);
    };

    const handleToggleServices = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (servicesTimeoutRef.current) {
            clearTimeout(servicesTimeoutRef.current);
            servicesTimeoutRef.current = null;
        }
        setIsPortfolioOpen(false);
        setIsServicesOpen(prev => !prev);
    };

    // Hover & Click handlers for Portfolio Dropdown
    const handlePortfolioEnter = () => {
        if (portfolioTimeoutRef.current) {
            clearTimeout(portfolioTimeoutRef.current);
            portfolioTimeoutRef.current = null;
        }
        setIsServicesOpen(false);
        setIsPortfolioOpen(true);
    };

    const handlePortfolioLeave = () => {
        portfolioTimeoutRef.current = setTimeout(() => {
            setIsPortfolioOpen(false);
        }, 280);
    };

    const handleTogglePortfolio = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (portfolioTimeoutRef.current) {
            clearTimeout(portfolioTimeoutRef.current);
            portfolioTimeoutRef.current = null;
        }
        setIsServicesOpen(false);
        setIsPortfolioOpen(prev => !prev);
    };

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const getServiceLink = (service) => {
        if (!service) return '/services/';
        if (typeof service === 'string') {
            const clean = service.toLowerCase().trim();
            if (clean.includes('drone photography')) return '/services/drone-photography-kolkata/';
            if (clean.includes('drone videography') || clean.includes('drone')) return '/services/drone-videography-kolkata/';
            if (clean.includes('luxury') || (clean.includes('wedding') && !clean.includes('pre-wedding'))) return '/services/wedding-photography-kolkata/';
            if (clean.includes('pre-wedding')) return '/services/pre-wedding-shoot-kolkata/';
            if (clean.includes('rice') || clean.includes('annaprashan')) return '/services/rice-ceremony-photography-kolkata/';
            if (clean.includes('commercial')) return '/services/video-production-agency-kolkata/';
            if (clean.includes('corporate')) return '/services/corporate-photography-kolkata/';
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
        if (title.includes('drone photography')) return '/services/drone-photography-kolkata/';
        if (title.includes('drone')) return '/services/drone-videography-kolkata/';
        if (cat === 'wedding' || title.includes('luxury') || (title.includes('wedding') && !title.includes('pre-wedding'))) return '/services/wedding-photography-kolkata/';
        if (title.includes('pre-wedding')) return '/services/pre-wedding-shoot-kolkata/';
        if (title.includes('rice') || title.includes('annaprashan')) return '/services/rice-ceremony-photography-kolkata/';
        if (cat === 'commercial' && !title.includes('corporate') && !title.includes('brand promotion')) return '/services/video-production-agency-kolkata/';
        if (title.includes('corporate')) return '/services/corporate-photography-kolkata/';
        if (title.includes('brand promotion') || title.includes('brand film')) return '/services/brand-promotion-kolkata/';
        if (title.includes('podcast')) return '/services/podcast-production-kolkata/';
        if (title.includes('documentary')) return '/services/documentary-film-production-kolkata/';
        return `/services/${slugify(service.title || service.name || '')}/`;
    };

    // Google Business & Studio Headquarters Info
    const google = siteContent?.global?.google || {};
    const contact = siteContent?.global?.contact || {};
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

    // Dynamic CTA button (Defaults to "GET A QUOTE")
    const cta = siteContent?.global?.navigation?.cta || {
        label: "GET A QUOTE",
        href: "/contact",
        enabled: true
    };

    const phone = siteContent?.global?.contact?.phone || "+91 82400 54002";
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    const isServicesActive = pathname?.startsWith('/services');
    const isPortfolioActive = pathname?.startsWith('/portfolio') || pathname === '/luxury' || pathname === '/commercial' || pathname === '/tech' || pathname?.startsWith('/wedding/');

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
                            <svg 
                                width={14} 
                                height={14} 
                                style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px", maxWidth: "14px", maxHeight: "14px" }} 
                                className="w-3.5 h-3.5 flex-shrink-0 text-black group-hover:text-white transition-colors" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
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

            {/* Main Navigation Glass Bar */}
            <nav
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

                {/* COLUMN 2: MAIN NAVIGATION HIERARCHY (Home, About Us, Services, Portfolio, Blogs, Contact Us) */}
                <div className="hidden lg:flex justify-center items-center gap-5 xl:gap-7 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {/* 1. HOME */}
                    <Link 
                        href="/" 
                        className={`relative py-1 transition-all group ${
                            isActive("/") ? "text-[#c5a059] font-black" : "text-white/80 hover:text-white"
                        }`}
                    >
                        <span>HOME</span>
                        {isActive("/") && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}
                    </Link>

                    {/* 2. ABOUT US */}
                    <Link 
                        href="/about" 
                        className={`relative py-1 transition-all group ${
                            isActive("/about") ? "text-[#c5a059] font-black" : "text-white/80 hover:text-white"
                        }`}
                    >
                        <span>ABOUT US</span>
                        {isActive("/about") && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}
                    </Link>

                    {/* 3. SERVICES (Mega Dropdown with Anti-Flicker Bridge) */}
                    <div 
                        ref={servicesDropdownRef}
                        className="relative py-1"
                        onMouseEnter={handleServicesEnter}
                        onMouseLeave={handleServicesLeave}
                    >
                        <button 
                            ref={servicesTriggerRef}
                            type="button"
                            aria-label="Toggle services menu" 
                            aria-haspopup="true"
                            aria-expanded={isServicesOpen}
                            onClick={handleToggleServices}
                            className={`flex items-center gap-1.5 uppercase font-black transition-colors cursor-pointer select-none py-1 ${
                                isServicesOpen || isServicesActive ? "text-[#c5a059]" : "text-white/80 hover:text-white"
                            }`}
                        >
                            <span>SERVICES</span>
                            <svg 
                                width={10}
                                height={10}
                                style={{ width: "10px", height: "10px", minWidth: "10px", minHeight: "10px" }}
                                className={`w-2.5 h-2.5 transition-transform duration-300 ${
                                    isServicesOpen ? "rotate-180 text-[#c5a059]" : "opacity-50"
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isServicesActive && !isServicesOpen && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}

                        {/* Invisible bridge to prevent mouseleave gap */}
                        <div className="absolute top-full left-0 w-full h-3 pointer-events-auto" />

                        {/* Dropdown Menu Container */}
                        <div 
                            role="menu"
                            aria-orientation="vertical"
                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[200] transition-all duration-300 ease-out ${
                                isServicesOpen 
                                    ? "opacity-100 translate-y-0 pointer-events-auto visible" 
                                    : "opacity-0 -translate-y-2 pointer-events-none invisible"
                            }`}
                            style={{ minWidth: "780px", maxWidth: "94vw" }}
                        >
                            <div className="bg-[#0c0c0c]/98 backdrop-blur-2xl border border-[#c5a059]/30 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
                                <div className="grid grid-cols-3 gap-6">
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
                                                        className="group/item flex flex-col p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <span className="text-xs font-bold text-white group-hover/item:text-[#c5a059] uppercase tracking-wider transition-colors">
                                                                {item.title}
                                                            </span>
                                                            {item.badge && (
                                                                <span className="text-[7px] bg-[#c5a059]/15 text-[#c5a059] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-0.5 group-hover/item:text-gray-300 transition-colors line-clamp-2">
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
                                                More Production Specialties:
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
                                                href="/services/commercial-ad-films-kolkata/"
                                                role="menuitem"
                                                onClick={() => setIsServicesOpen(false)}
                                                className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                COMMERCIAL AD FILMS
                                            </Link>
                                            <Link
                                                href="/services/2d-animation-kolkata/"
                                                role="menuitem"
                                                onClick={() => setIsServicesOpen(false)}
                                                className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                2D ANIMATION
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Directory Footer */}
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                        Studio HQ • 85, Tilottama Plaza, Kolkata
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

                    {/* 4. PORTFOLIO (Interactive Dropdown + Direct Click) */}
                    <div 
                        ref={portfolioDropdownRef}
                        className="relative py-1"
                        onMouseEnter={handlePortfolioEnter}
                        onMouseLeave={handlePortfolioLeave}
                    >
                        <Link 
                            ref={portfolioTriggerRef}
                            href="/portfolio/"
                            onClick={() => setIsPortfolioOpen(false)}
                            className={`flex items-center gap-1 uppercase font-black transition-colors cursor-pointer select-none py-1 ${
                                isPortfolioOpen || isPortfolioActive ? "text-[#c5a059]" : "text-white/80 hover:text-white"
                            }`}
                        >
                            <span>PORTFOLIO</span>
                            <svg 
                                width={8}
                                height={8}
                                style={{ width: "8px", height: "8px", minWidth: "8px", minHeight: "8px" }}
                                className={`w-2 h-2 transition-transform duration-300 ${
                                    isPortfolioOpen ? "rotate-180 text-[#c5a059]" : "opacity-40"
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </Link>
                        {isPortfolioActive && !isPortfolioOpen && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}

                        {/* Invisible bridge */}
                        <div className="absolute top-full left-0 w-full h-3 pointer-events-auto" />

                        {/* Portfolio Quick Dropdown Container */}
                        <div 
                            role="menu"
                            aria-orientation="vertical"
                            className={`absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-[200] transition-all duration-300 ease-out ${
                                isPortfolioOpen 
                                    ? "opacity-100 translate-y-0 pointer-events-auto visible" 
                                    : "opacity-0 -translate-y-2 pointer-events-none invisible"
                            }`}
                            style={{ minWidth: "320px" }}
                        >
                            <div className="bg-[#0c0c0c]/98 backdrop-blur-2xl border border-[#c5a059]/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-left space-y-1.5">
                                {PORTFOLIO_GROUPS.map((pGroup, pIdx) => (
                                    <Link
                                        key={pIdx}
                                        href={pGroup.href}
                                        role="menuitem"
                                        onClick={() => setIsPortfolioOpen(false)}
                                        className="group/pitem flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all"
                                    >
                                        <span className="text-base mt-0.5">{pGroup.icon}</span>
                                        <div>
                                            <span className="text-xs font-bold text-white group-hover/pitem:text-[#c5a059] uppercase tracking-wider block transition-colors">
                                                {pGroup.title}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium block leading-tight mt-0.5">
                                                {pGroup.desc}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. BLOGS */}
                    <Link 
                        href="/blogs" 
                        className={`relative py-1 transition-all group ${
                            isActive("/blogs") ? "text-[#c5a059] font-black" : "text-white/80 hover:text-white"
                        }`}
                    >
                        <span>BLOGS</span>
                        {isActive("/blogs") && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}
                    </Link>

                    {/* 6. CONTACT US */}
                    <Link 
                        href="/contact" 
                        className={`relative py-1 transition-all group ${
                            isActive("/contact") ? "text-[#c5a059] font-black" : "text-white/80 hover:text-white"
                        }`}
                    >
                        <span>CONTACT US</span>
                        {isActive("/contact") && (
                            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></span>
                        )}
                    </Link>
                </div>

                {/* COLUMN 3: CTA BUTTON ("GET A QUOTE") & MOBILE HAMBURGER TOGGLE */}
                <div className="flex items-center justify-end gap-3 min-w-[120px]">
                    {/* Desktop CTA Button */}
                    {cta.enabled !== false && (
                        <Link
                            href={cta.href || "/contact"}
                            className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] transition-all duration-300 interactive shadow-md"
                        >
                            <span>{cta.label || "GET A QUOTE"}</span>
                            <svg 
                                width={12} 
                                height={12} 
                                style={{ width: "12px", height: "12px", minWidth: "12px", minHeight: "12px" }} 
                                className="w-3 h-3" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
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
                className={`fixed inset-0 bg-black/85 backdrop-blur-md z-[998] transition-opacity duration-500 lg:hidden ${
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Navigation Drawer */}
            <div
                className={`fixed top-0 right-0 h-[100dvh] w-[88vw] max-w-[420px] bg-[#080808] border-l border-white/10 z-[999] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col justify-between overflow-y-auto hide-scrollbar ${
                    isMenuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col text-left mt-24 px-6 sm:px-8 space-y-1">
                    {/* 1. HOME */}
                    <Link 
                        onClick={() => setIsMenuOpen(false)} 
                        href="/" 
                        className={`py-3.5 border-b border-white/5 font-heading text-xl font-black uppercase transition-colors flex items-center justify-between ${
                            isActive("/") ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                        }`}
                    >
                        <span>HOME</span>
                        {isActive("/") && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                    </Link>

                    {/* 2. ABOUT US */}
                    <Link 
                        onClick={() => setIsMenuOpen(false)} 
                        href="/about" 
                        className={`py-3.5 border-b border-white/5 font-heading text-xl font-black uppercase transition-colors flex items-center justify-between ${
                            isActive("/about") ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                        }`}
                    >
                        <span>ABOUT US</span>
                        {isActive("/about") && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                    </Link>
                    
                    {/* 3. SERVICES (Expandable Accordion) */}
                    <div className="py-3.5 border-b border-white/5">
                        <button 
                            type="button"
                            aria-label="Toggle mobile services menu"
                            aria-expanded={openMobileSubMenu === 'services'}
                            onClick={() => setOpenMobileSubMenu(openMobileSubMenu === 'services' ? null : 'services')}
                            className="w-full flex items-center justify-between font-heading text-xl font-black uppercase text-white hover:text-[#c5a059] transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>SERVICES</span>
                                <span className="text-[10px] bg-[#c5a059]/15 text-[#c5a059] px-2 py-0.5 rounded font-sans font-black tracking-widest">
                                    10+
                                </span>
                            </span>
                            <svg 
                                width={20} 
                                height={20} 
                                style={{ width: "20px", height: "20px", minWidth: "20px", minHeight: "20px" }} 
                                className={`w-5 h-5 transition-transform duration-300 ${openMobileSubMenu === 'services' ? 'rotate-180 text-[#c5a059]' : 'text-white/60'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`grid overflow-hidden transition-all duration-300 ${openMobileSubMenu === 'services' ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                            <div className="overflow-hidden flex flex-col gap-4 pl-3 border-l-2 border-[#c5a059]/40 py-2">
                                {SERVICE_GROUPS.map((group, gIdx) => (
                                    <div key={gIdx} className="space-y-1.5">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5 pb-1">
                                            <span>{group.icon}</span>
                                            <span>{group.category}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 pl-2">
                                            {group.items.map((item, iIdx) => (
                                                <Link
                                                    key={iIdx}
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setOpenMobileSubMenu(null);
                                                    }}
                                                    href={item.href}
                                                    className="py-1 text-xs font-bold text-gray-300 hover:text-[#c5a059] transition-colors flex items-center justify-between"
                                                >
                                                    <span className="uppercase tracking-wider">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="text-[7px] bg-white/5 text-[#c5a059] px-1.5 py-0.5 rounded font-black">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <Link
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setOpenMobileSubMenu(null);
                                    }}
                                    href="/services/"
                                    className="pt-2 text-xs font-black text-[#c5a059] hover:text-white uppercase tracking-widest flex items-center gap-1"
                                >
                                    <span>Explore All Services →</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 4. PORTFOLIO (Expandable Accordion) */}
                    <div className="py-3.5 border-b border-white/5">
                        <button 
                            type="button"
                            aria-label="Toggle mobile portfolio menu"
                            aria-expanded={openMobileSubMenu === 'portfolio'}
                            onClick={() => setOpenMobileSubMenu(openMobileSubMenu === 'portfolio' ? null : 'portfolio')}
                            className="w-full flex items-center justify-between font-heading text-xl font-black uppercase text-white hover:text-[#c5a059] transition-colors"
                        >
                            <span>PORTFOLIO</span>
                            <svg 
                                width={20} 
                                height={20} 
                                style={{ width: "20px", height: "20px", minWidth: "20px", minHeight: "20px" }} 
                                className={`w-5 h-5 transition-transform duration-300 ${openMobileSubMenu === 'portfolio' ? 'rotate-180 text-[#c5a059]' : 'text-white/60'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`grid overflow-hidden transition-all duration-300 ${openMobileSubMenu === 'portfolio' ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                            <div className="overflow-hidden flex flex-col gap-2 pl-3 border-l-2 border-[#c5a059]/40 py-2">
                                {PORTFOLIO_GROUPS.map((pGroup, pIdx) => (
                                    <Link
                                        key={pIdx}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setOpenMobileSubMenu(null);
                                        }}
                                        href={pGroup.href}
                                        className="py-1 text-xs font-bold text-gray-300 hover:text-[#c5a059] transition-colors flex items-center gap-2"
                                    >
                                        <span>{pGroup.icon}</span>
                                        <span className="uppercase tracking-wider">{pGroup.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. BLOGS */}
                    <Link 
                        onClick={() => setIsMenuOpen(false)} 
                        href="/blogs" 
                        className={`py-3.5 border-b border-white/5 font-heading text-xl font-black uppercase transition-colors flex items-center justify-between ${
                            isActive("/blogs") ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                        }`}
                    >
                        <span>BLOGS</span>
                        {isActive("/blogs") && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                    </Link>

                    {/* 6. CONTACT US */}
                    <Link 
                        onClick={() => setIsMenuOpen(false)} 
                        href="/contact" 
                        className={`py-3.5 border-b border-white/5 font-heading text-xl font-black uppercase transition-colors flex items-center justify-between ${
                            isActive("/contact") ? "text-[#c5a059]" : "text-white hover:text-[#c5a059]"
                        }`}
                    >
                        <span>CONTACT US</span>
                        {isActive("/contact") && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                    </Link>
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
                    <Link
                        onClick={() => setIsMenuOpen(false)}
                        href={cta.href || "/contact"}
                        className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#c5a059] text-black font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                        <span>{cta.label || "GET A QUOTE"}</span>
                        <svg 
                            width={14} 
                            height={14} 
                            style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px" }} 
                            className="w-3.5 h-3.5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>

                    {/* Mobile Direct Call */}
                    <a 
                        href={`tel:${cleanPhone}`} 
                        className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors"
                    >
                        <svg 
                            width={16} 
                            height={16} 
                            style={{ width: "16px", height: "16px", minWidth: "16px", minHeight: "16px" }} 
                            className="w-4 h-4 text-[#c5a059]" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>CALL: {phone}</span>
                    </a>
                </div>
            </div>
        </>
    );
}
