"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar({ initialServices }) {
    const [services, setServices] = useState(initialServices || []);

    useEffect(() => {
        if (initialServices) {
            setServices(initialServices);
        }
    }, [initialServices]);

    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const getServiceLink = (service) => {
        switch (service.category) {
            case 'wedding': return '/luxury';
            case 'commercial': return '/commercial';
            case 'tech': return '/tech';
            default: return `/services/${slugify(service.title || service.name || '')}`;
        }
    };

    const getInitial = (title) => (title || 'S')[0].toUpperCase();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    return (
        <>
            <nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl rounded-full nav-glass py-2 px-8 flex justify-between lg:grid lg:grid-cols-3 items-center transition-all duration-500 ${isScrolled ? "top-4 shadow-2xl scale-[0.98]" : "top-6"
                    }`}
                style={{ overflow: 'visible' }}
            >
                {/* COLUMN 1: LOGO */}
                <div className="flex justify-start">
                    <Link href="/" className="flex items-end gap-1 group">
                        <span className="font-heading font-black text-2xl tracking-tighter text-white">D/P</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1.5"></span>
                    </Link>
                </div>

                {/* COLUMN 2: CENTERED MENU */}
                <div className="hidden lg:flex justify-center items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                    <Link href="/" className="transition-colors">
                        HOME
                    </Link>
                    <Link href="/about" className="transition-colors">
                        HISTORY
                    </Link>
                    
                    {/* SERVICES DROP */}
                    <div className="relative group/drop py-2">
                        <button aria-label="Toggle services menu" className="flex items-center gap-2 transition-colors uppercase">
                            SERVICES
                            <svg className="w-2.5 h-2.5 opacity-40 group-hover/drop:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover/drop:opacity-100 group-hover/drop:translate-y-0 group-hover/drop:pointer-events-auto transition-all duration-500">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl text-left">
                                <div className="grid gap-6">
                                    {services.map((service, idx) => (
                                        <Link key={idx} href={getServiceLink(service)} className="flex items-center gap-4 group/item">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors flex-shrink-0">
                                                <span className="text-[10px] text-white group-hover/item:text-black">
                                                    {getInitial(service.title || service.name)}
                                                </span>
                                            </div>
                                            <span className="text-[9px] group-hover:text-white uppercase leading-tight">
                                                {(service.title || service.name || '').toUpperCase()}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/journal" className="transition-colors">
                        JOURNAL
                    </Link>
                    <Link href="/contact" className="transition-colors">
                        CONTACT
                    </Link>
                </div>

                {/* COLUMN 3: MOBILE BUTTON / DESKTOP PLACEHOLDER */}
                <div className="flex justify-end">
                    <button
                        aria-label="Toggle mobile menu"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden flex flex-col gap-1.5 relative z-[1001]"
                    >
                        <span className={`w-6 h-[2px] bg-white block transition-transform ${isMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`}></span>
                        <span className={`w-6 h-[2px] bg-white block transition-opacity ${isMenuOpen ? "opacity-0" : ""}`}></span>
                        <span className={`w-6 h-[2px] bg-white block transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`}></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] transition-opacity duration-500 lg:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Premium Mobile Side Drawer */}
            <div
                className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[400px] bg-[#050505] border-l border-white/10 z-[999] transform transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] lg:hidden flex flex-col justify-between overflow-y-auto hide-scrollbar ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col text-left mt-24 px-10">
                    <Link onClick={() => setIsMenuOpen(false)} href="/" className="py-5 border-b border-white/5 font-heading text-3xl font-black uppercase text-white hover:text-[#c5a059] transition-colors">
                        HOME
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/about" className="py-5 border-b border-white/5 font-heading text-3xl font-black uppercase text-white hover:text-[#c5a059] transition-colors">
                        HISTORY
                    </Link>
                    
                    {/* Mobile Services */}
                    <div className="py-5 border-b border-white/5">
                        <button 
                            aria-label="Toggle mobile services menu"
                            onClick={() => setOpenSubMenu(openSubMenu === 'services' ? null : 'services')}
                            className="w-full flex items-center justify-between font-heading text-3xl font-black uppercase text-white hover:text-[#c5a059] transition-colors"
                        >
                            SERVICES
                            <svg className={`w-6 h-6 transition-transform duration-300 ${openSubMenu === 'services' ? 'rotate-180 text-[#c5a059]' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`grid overflow-hidden transition-all duration-500 ${openSubMenu === 'services' ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                            <div className="overflow-hidden flex flex-col gap-5 pl-4 border-l-2 border-[#c5a059]/30">
                                {services.map((service, idx) => (
                                    <Link
                                        key={idx}
                                        onClick={() => setIsMenuOpen(false)}
                                        href={getServiceLink(service)}
                                        className="text-[11px] font-black tracking-widest text-gray-400 hover:text-white transition-colors uppercase"
                                    >
                                        {(service.title || service.name || '').toUpperCase()}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link onClick={() => setIsMenuOpen(false)} href="/journal" className="py-5 border-b border-white/5 font-heading text-3xl font-black uppercase text-white hover:text-[#c5a059] transition-colors">
                        JOURNAL
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/contact" className="py-5 font-heading text-3xl font-black uppercase text-white hover:text-[#c5a059] transition-colors">
                        CONTACT
                    </Link>
                </div>

                <div className="p-10 mb-8">
                    <a 
                        href="tel:+918240054002" 
                        className="w-full py-5 flex items-center justify-center gap-3 bg-[#c5a059] text-black font-black text-sm tracking-[0.2em] uppercase rounded-full hover:bg-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        CALL NOW
                    </a>
                </div>
            </div>
        </>
    );
}
