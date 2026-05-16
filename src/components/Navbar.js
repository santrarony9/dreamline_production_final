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
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl rounded-full nav-glass py-2 px-4 md:px-8 flex justify-between items-center transition-all duration-500 ${isScrolled ? "top-4 shadow-2xl" : "top-6"
                    }`}
                style={{ overflow: 'visible' }}
            >
                <div className="font-heading font-black text-lg tracking-tighter">
                    <Link href="/" className="interactive flex items-end gap-1 group">
                        <span className="font-heading font-black text-2xl tracking-tighter text-white">D/P</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1.5 group-hover:scale-150 transition-transform"></span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    <Link href="/" className="hover:text-white transition-colors interactive">
                        HOME
                    </Link>
                    <Link href="/about" className="hover:text-white transition-colors interactive">
                        HISTORY
                    </Link>
                    
                    {/* LUXURY WEDDINGS DROP */}
                    <div className="relative group py-2">
                        <Link href="/luxury" className="hover:text-white transition-colors interactive flex items-center gap-1">
                            LUXURY WEDDINGS
                            <svg className="w-2.5 h-2.5 opacity-50 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                        </Link>
                        <div className="absolute top-full left-0 w-64 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                                <Link href="/luxury" className="block text-[10px] text-[#c5a059] font-black hover:pl-2 transition-all">VIEW ALL WEDDINGS</Link>
                                <div className="h-px bg-white/5 w-full"></div>
                                <div className="space-y-3">
                                    <span className="block text-[8px] text-gray-600 font-black tracking-[0.2em] mb-1">DIVISIONS</span>
                                    {weddingServices.length > 0 ? weddingServices.map((s, idx) => (
                                        <div key={idx} className="group/item">
                                            <Link href="/luxury#services" className="block hover:text-white transition-all text-[10px] font-bold">{s.title}</Link>
                                            <div className="flex flex-wrap gap-1 mt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                                {(s.subcategories || []).map((sub, i) => (
                                                    <Link key={i} href={`/services/${slugify(sub)}`} className="text-[7px] border border-white/10 px-1.5 py-0.5 rounded-full hover:bg-white hover:text-black transition-all">{sub}</Link>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <span className="text-[9px] text-gray-600 italic">No services added yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COMMERCIAL DROP */}
                    <div className="relative group py-2">
                        <Link href="/commercial" className="hover:text-white transition-colors interactive flex items-center gap-1">
                            COMMERCIAL
                            <svg className="w-2.5 h-2.5 opacity-50 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                        </Link>
                        <div className="absolute top-full left-0 w-64 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                                <Link href="/commercial" className="block text-[10px] text-[#c5a059] font-black hover:pl-2 transition-all">COMMERCIAL SHOWCASE</Link>
                                <div className="h-px bg-white/5 w-full"></div>
                                <div className="space-y-3">
                                    <span className="block text-[8px] text-gray-600 font-black tracking-[0.2em] mb-1">SPECIALIZATIONS</span>
                                    {commercialServices.length > 0 ? commercialServices.map((s, idx) => (
                                        <div key={idx} className="group/item">
                                            <Link href="/commercial" className="block hover:text-white transition-all text-[10px] font-bold">{s.title}</Link>
                                            <div className="flex flex-wrap gap-1 mt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                                {(s.subcategories || []).map((sub, i) => (
                                                    <Link key={i} href={`/services/${slugify(sub)}`} className="text-[7px] border border-white/10 px-1.5 py-0.5 rounded-full hover:bg-white hover:text-black transition-all">{sub}</Link>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <span className="text-[9px] text-gray-600 italic">No services added yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TECH DROP */}
                    <div className="relative group py-2">
                        <Link href="/tech" className="hover:text-white transition-colors interactive flex items-center gap-1">
                            TECH
                            <svg className="w-2.5 h-2.5 opacity-50 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                        </Link>
                        <div className="absolute top-full left-0 w-64 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                                <Link href="/tech" className="block text-[10px] text-[#c5a059] font-black hover:pl-2 transition-all">TECH DIVISIONS</Link>
                                <div className="h-px bg-white/5 w-full"></div>
                                <div className="space-y-3">
                                    <span className="block text-[8px] text-gray-600 font-black tracking-[0.2em] mb-1">SOLUTIONS</span>
                                    {techServices.length > 0 ? techServices.map((s, idx) => (
                                        <Link key={idx} href={`/tech/${slugify(s.name)}`} className="block text-[9px] hover:text-[#c5a059] transition-all">{s.name.toUpperCase()}</Link>
                                    )) : <span className="text-[8px] text-gray-700 italic">No active solutions</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SERVICES DROP */}
                    <div className="relative group/drop py-2">
                        <button className="flex items-center gap-2 hover:text-white transition-colors uppercase interactive">
                            SERVICES
                            <svg className="w-2.5 h-2.5 opacity-40 group-hover/drop:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover/drop:opacity-100 group-hover/drop:translate-y-0 group-hover/drop:pointer-events-auto transition-all duration-500">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                                <div className="grid gap-4">
                                    {services.map((service, idx) => (
                                        <Link
                                            key={idx}
                                            href={`/tech/${slugify(service.name)}`}
                                            className="text-[9px] hover:text-[#c5a059] transition-colors border-b border-white/5 pb-2 last:border-0 last:pb-0 block"
                                        >
                                            {service.name.toUpperCase()}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/drop py-2">
                        <button className="flex items-center gap-2 hover:text-white transition-colors uppercase interactive">
                            WORKS
                            <svg className="w-2.5 h-2.5 opacity-40 group-hover/drop:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover/drop:opacity-100 group-hover/drop:translate-y-0 group-hover/drop:pointer-events-auto transition-all duration-500">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                                <div className="grid gap-6">
                                    <Link href="/luxury" className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors">
                                            <span className="text-[10px] text-white group-hover/item:text-black">W</span>
                                        </div>
                                        <span className="text-[9px] group-hover:text-white">WEDDINGS</span>
                                    </Link>
                                    <Link href="/commercial" className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-[#c5a059] transition-colors">
                                            <span className="text-[10px] text-white group-hover/item:text-black">C</span>
                                        </div>
                                        <span className="text-[9px] group-hover:text-white">COMMERCIAL</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/journal" className="hover:text-white transition-colors interactive">
                        JOURNAL
                    </Link>
                    <Link href="/contact" className="hover:text-white transition-colors interactive">
                        CONTACT
                    </Link>
                </div>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 interactive relative z-[1001]"
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
                    <Link onClick={() => setIsMenuOpen(false)} href="/" className="interactive">
                        Home
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/about" className="interactive">
                        History
                    </Link>
                    
                    {/* Mobile Services */}
                    <div>
                        <button 
                            onClick={() => setOpenSubMenu(openSubMenu === 'services' ? null : 'services')}
                            className="w-full flex items-center justify-center gap-4 text-white interactive"
                        >
                            Services
                            <svg className={`w-4 h-4 transition-transform ${openSubMenu === 'services' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`mt-6 grid gap-4 overflow-hidden transition-all duration-500 ${openSubMenu === 'services' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {services.map((service, idx) => (
                                <Link
                                    key={idx}
                                    onClick={() => setIsMenuOpen(false)}
                                    href={`/tech/${slugify(service.name)}`}
                                    className="text-[12px] text-gray-500 hover:text-[#c5a059]"
                                >
                                    {service.name.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Works */}
                    <div>
                        <button 
                            onClick={() => setOpenSubMenu(openSubMenu === 'works' ? null : 'works')}
                            className="w-full flex items-center justify-center gap-4 text-white interactive"
                        >
                            Works
                            <svg className={`w-4 h-4 transition-transform ${openSubMenu === 'works' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`mt-6 grid gap-6 overflow-hidden transition-all duration-500 ${openSubMenu === 'works' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <Link onClick={() => setIsMenuOpen(false)} href="/luxury" className="text-[12px] text-gray-500">
                                WEDDINGS
                            </Link>
                            <Link onClick={() => setIsMenuOpen(false)} href="/commercial" className="text-[12px] text-gray-500">
                                COMMERCIAL
                            </Link>
                        </div>
                    </div>

                    <Link onClick={() => setIsMenuOpen(false)} href="/journal" className="interactive">
                        Journal
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/contact" className="interactive">
                        Contact
                    </Link>
                </div>
            </div>
        </>
    );
}
