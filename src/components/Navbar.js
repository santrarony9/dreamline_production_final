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
                    <Link href="/" className="interactive flex items-center gap-2">
                        <Image
                            src="/logo.svg"
                            alt="Dreamline Logo"
                            width={100}
                            height={32}
                            className={`h-8 w-auto grayscale ${theme === 'light' ? 'invert-0' : 'invert'}`}
                        />
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
                    <Link href="/tech" className="hover:text-white transition-colors interactive text-[#c5a059]">
                        TECH
                    </Link>
                    <Link href="/contact" className="hover:text-white transition-colors interactive">
                        CONTACT
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle interactive p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
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
                        className="interactive text-[#c5a059]"
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
                    <Link onClick={() => setIsMenuOpen(false)} href="/tech" className="interactive text-[#c5a059]">
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
