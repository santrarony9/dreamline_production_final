import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-20 border-t border-white/5 bg-[#050505]" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20">
                    <div className="sm:col-span-2">
                        <h2 className="font-heading text-3xl font-black mb-6">
                            DREAMLINE <span className="text-[#c5a059]">PRODUCTION</span>
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-8">
                            Kolkata's premier cinematic house. We specialize in luxury wedding
                            storytelling, high-end commercial production, and artistic photography
                            since 2010.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                            >
                                IG
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                            >
                                FB
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                            >
                                YT
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-[#c5a059] mb-8">
                            Explore
                        </h4>
                        <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors interactive">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-white transition-colors interactive"
                                >
                                    History
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/luxury"
                                    className="hover:text-white transition-colors interactive"
                                >
                                    Luxury Weddings
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/commercial"
                                    className="hover:text-white transition-colors interactive"
                                >
                                    Commercial
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-[#c5a059] mb-8">
                            Contact
                        </h4>
                        <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-white transition-colors interactive"
                                >
                                    Inquire
                                </Link>
                            </li>
                            <li id="footer-address">85, Tilottama Plaza, Kolkata 700082</li>
                            <li id="footer-phone">+91 82400 54002</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">
                        &copy; {new Date().getFullYear()} DREAMLINE PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                        <Link href="#" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
