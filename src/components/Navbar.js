"use client";
/* VERSION: 1.0.6 - FINAL DEPLOY */
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/content");
                const data = await res.json();
                setServices(data.home?.services || []);
            } catch (error) {
                console.error("Error fetching services for navbar:", error);
            }
        };
        fetchServices();
    }, []);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                                                    <span key={i} className="text-[7px] border border-white/10 px-1.5 py-0.5 rounded-full">{sub}</span>
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
                                                    <span key={i} className="text-[7px] border border-white/10 px-1.5 py-0.5 rounded-full">{sub}</span>
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
                                        <div key={idx} className="group/item">
                                            <Link href="/tech" className="block hover:text-white transition-all text-[10px] font-bold">{s.title}</Link>
                                            <div className="flex flex-wrap gap-1 mt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                                {(s.subcategories || []).map((sub, i) => (
                                                    <span key={i} className="text-[7px] border border-white/10 px-1.5 py-0.5 rounded-full">{sub}</span>
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

                    <Link href="/contact" className="hover:text-white transition-colors interactive">
                        CONTACT
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Theme Toggle Removed - Locked to Dark Aesthetic */}
                </div>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 interactive"
                >
                    <span className="w-6 h-[2px] bg-white block"></span>
                    <span className="w-6 h-[2px] bg-white block"></span>
                    <span className="w-6 h-[2px] bg-white block"></span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 w-full h-[100dvh] bg-black/95 z-[999] transition-all duration-500 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    } overflow-y-auto`}
            >
                <div className="flex justify-end p-10">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white text-4xl interactive"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-10 flex flex-col gap-6 text-[18px] font-black uppercase tracking-widest text-center">
                    <Link onClick={() => setIsMenuOpen(false)} href="/" className="interactive">
                        Home
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/about" className="interactive">
                        History
                    </Link>
                    <Link
                        onClick={() => setIsMenuOpen(false)}
                        href="/luxury"
                        className="interactive"
                    >
                        Luxury Weddings
                    </Link>
                    <Link
                        onClick={() => setIsMenuOpen(false)}
                        href="/commercial"
                        className="interactive"
                    >
                        Commercial
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/tech" className="interactive">
                        Tech
                    </Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/contact" className="interactive">
                        Contact
                    </Link>
                </div>
            </div>
        </>
    );
}
