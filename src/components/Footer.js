import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 bg-[#050505]" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="font-heading text-2xl font-black inline-block uppercase tracking-tighter interactive">
                            DREAMLINE<sup className="text-[10px] ml-0.5">®</sup> <span className="text-[#c5a059]">PRODUCTION</span>
                        </Link>
                        <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
                            Kolkata's premier cinematic house & Pan-India luxury storyteller. Premium weddings and commercial films since 2010.
                        </p>
                        <div className="pt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700 border border-white/5 px-2 py-1 rounded">Reg No: WB-PR-00XXXXXX</span>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/" className="hover:text-white transition-colors interactive">Home</Link>
                        <Link href="/about" className="hover:text-white transition-colors interactive">History</Link>
                        <Link href="/luxury" className="hover:text-white transition-colors interactive">Luxury Weddings</Link>
                        <Link href="/commercial" className="hover:text-white transition-colors interactive">Commercial</Link>
                        <Link href="/tech" className="hover:text-white transition-colors interactive">Tech</Link>
                        <Link href="/contact" className="hover:text-white transition-colors interactive text-[#c5a059]">Inquire</Link>
                    </div>

                    {/* Contact & Social Section */}
                    <div className="lg:text-right space-y-4">
                        <div className="text-[10px] font-black text-white/50 space-x-6 uppercase tracking-widest">
                            <span>+91 82400 54002</span>
                            <span className="hidden sm:inline">|</span>
                            <span>Kolkata, WB</span>
                        </div>
                        <div className="flex lg:justify-end gap-3">
                            {['IG', 'FB', 'YT'].map((platform) => (
                                <a
                                    key={platform}
                                    href={`https://www.${platform === 'IG' ? 'instagram' : platform === 'FB' ? 'facebook' : 'youtube'}.com/dreamlineproduction/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                                >
                                    {platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legal & Bottom Row */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                        <Link href="/privacy-policy" className="hover:text-[#c5a059] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[#c5a059] transition-colors">Terms of Service</Link>
                        <Link href="/refund-policy" className="hover:text-[#c5a059] transition-colors">Refund & Cancellation</Link>
                    </div>
                    <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em] font-bold">
                        &copy; {new Date().getFullYear()} DREAMLINE<sup className="text-[6px] ml-0.5">®</sup> PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}
