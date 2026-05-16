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

    const weddingServices = services.filter(s => !s.category || s.category === "wedding");
    const commercialServices = services.filter(s => s.category === "commercial");
    const techServices = services.filter(s => s.category === "tech");

    return (
        <>
            <nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl rounded-full nav-glass py-2 px-6 md:px-8 flex justify-between items-center transition-all duration-500 ${isScrolled ? "top-4 shadow-2xl scale-[0.98]" : "top-6"
                    }`}
                style={{ overflow: 'visible' }}
            >
                {/* LOGO LEFT */}
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-end gap-1 group">
                        <span className="font-heading font-black text-2xl tracking-tighter text-white">D/P</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1.5"></span>
                    </Link>
                </div>

                {/* MENU RIGHT */}
                <div className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                    <Link href="/" className="transition-colors hover:text-white">
                        HOME
                    </Link>
                    <Link href="/about" className="transition-colors hover:text-white">
                        HISTORY
                    </Link>
                    
                    {/* SERVICES DROP */}
                    <div className="relative group/drop py-2">
                        <button className="flex items-center gap-2 transition-colors hover:text-white uppercase">
                            SERVICES
                            <svg className="w-2.5 h-2.5 opacity-40 group-hover/drop:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full right-0 w-64 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover/drop:opacity-100 group-hover/drop:translate-y-0 group-hover/drop:pointer-events-auto transition-all duration-500">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl text-left">
                                <div className="grid gap-6">
                                    <Link href="/luxury" className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors">
                                            <span className="text-[10px] text-white group-hover/item:text-black">W</span>
                                        </div>
                                        <span className="text-[9px] group-hover:text-white">LUXURY WEDDINGS</span>
                                    </Link>
                                    <Link href="/commercial" className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors">
                                            <span className="text-[10px] text-white group-hover/item:text-black">C</span>
                                        </div>
                                        <span className="text-[9px] group-hover:text-white">COMMERCIAL</span>
                                    </Link>
                                    <Link href="/tech" className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors">
                                            <span className="text-[10px] text-white group-hover/item:text-black">T</span>
                                        </div>
                                        <span className="text-[9px] group-hover:text-white">TECH</span>
                                    </Link>
                                    
                                    {/* Other Dynamic Services */}
                                    {services.length > 0 && (
                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            <span className="block text-[8px] text-gray-600 font-black tracking-widest uppercase">Other Solutions</span>
                                            {services.filter(s => !['wedding', 'commercial', 'tech'].includes(s.category)).map((service, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/services/${slugify(service.name)}`}
                                                    className="text-[9px] hover:text-[#c5a059] transition-colors block"
                                                >
                                                    {service.name.toUpperCase()}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/journal" className="transition-colors hover:text-white">
                        JOURNAL
                    </Link>
                    <Link href="/contact" className="transition-colors hover:text-white">
                        CONTACT
                    </Link>
                </div>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 relative z-[1001]"
                >
                    <span className={`w-6 h-[2px] bg-white block transition-transform ${isMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`}></span>
                    <span className={`w-6 h-[2px] bg-white block transition-opacity ${isMenuOpen ? "opacity-0" : ""}`}></span>
                    <span className={`w-6 h-[2px] bg-white block transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`}></span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 w-full h-[100dvh] bg-black/95 z-[999] transition-all duration-500 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    } overflow-y-auto`}
            >
                <div className="p-10 flex flex-col gap-8 text-[18px] font-black uppercase tracking-widest text-center mt-20">
                    <Link onClick={() => setIsMenuOpen(false)} href="/">
                        Home
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/about">
                        History
                    </Link>
                    
                    {/* Mobile Services */}
                    <div>
                        <button 
                            onClick={() => setOpenSubMenu(openSubMenu === 'services' ? null : 'services')}
                            className="w-full flex items-center justify-center gap-4 text-white"
                        >
                            Services
                            <svg className={`w-4 h-4 transition-transform ${openSubMenu === 'services' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`mt-6 grid gap-6 overflow-hidden transition-all duration-500 ${openSubMenu === 'services' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <Link onClick={() => setIsMenuOpen(false)} href="/luxury" className="text-[12px] text-gray-400">Luxury Weddings</Link>
                            <Link onClick={() => setIsMenuOpen(false)} href="/commercial" className="text-[12px] text-gray-400">Commercial</Link>
                            <Link onClick={() => setIsMenuOpen(false)} href="/tech" className="text-[12px] text-gray-400">Tech</Link>
                            
                            {services.filter(s => !['wedding', 'commercial', 'tech'].includes(s.category)).map((service, idx) => (
                                <Link
                                    key={idx}
                                    onClick={() => setIsMenuOpen(false)}
                                    href={`/services/${slugify(service.name)}`}
                                    className="text-[12px] text-gray-500 hover:text-[#c5a059]"
                                >
                                    {service.name.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link onClick={() => setIsMenuOpen(false)} href="/journal">
                        Journal
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/contact">
                        Contact
                    </Link>
                </div>
            </div>
        </>
    );
}
