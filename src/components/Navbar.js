"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full nav-glass py-4 px-4 md:px-8 flex justify-between items-center transition-all duration-500 ${isScrolled ? "top-4 shadow-2xl" : "top-6"
                    }`}
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
                    <Link href="/luxury" className="hover:text-white transition-colors interactive">
                        LUXURY WEDDINGS
                    </Link>
                    <Link href="/commercial" className="hover:text-white transition-colors interactive">
                        COMMERCIAL
                    </Link>
                    <Link href="/tech" className="hover:text-white transition-colors interactive">
                        TECH
                    </Link>
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
