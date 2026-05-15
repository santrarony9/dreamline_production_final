import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 bg-[#050505]" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="font-heading text-2xl font-black inline-block uppercase tracking-tighter interactive whitespace-nowrap">
                            DREAMLINE <span className="text-[#c5a059] relative">
                                PRODUCTION
                                <span className="text-[20px] absolute top-[-8px] right-[-25px] font-black">®</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
                            Kolkata's premier cinematic house & Pan-India luxury storyteller. Premium weddings and commercial films since 2010.
                        </p>
                        <div className="pt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-2 py-1 rounded">GST: 19EILPS2898F1ZE</span>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/" className="hover:text-white transition-colors interactive">Home</Link>
                        <Link href="/about" className="hover:text-white transition-colors interactive">History</Link>
                        <Link href="/luxury" className="hover:text-white transition-colors interactive">Luxury Weddings</Link>
                        <Link href="/commercial" className="hover:text-white transition-colors interactive">Commercial</Link>
                        <Link href="/tech" className="hover:text-white transition-colors interactive">Tech</Link>
                        <Link href="/contact" className="hover:text-white transition-colors interactive text-[#c5a059]">Inquire</Link>
                    </div>

                    {/* Contact & Social Section */}
                    <div className="lg:text-right space-y-6">
                        <div className="text-[10px] font-black text-white/50 flex flex-col sm:flex-row lg:justify-end gap-2 sm:gap-6 uppercase tracking-widest">
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
                                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                                >
                                    {platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legal & Bottom Row */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                        <Link href="/privacy-policy" className="hover:text-[#c5a059] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[#c5a059] transition-colors">Terms of Service</Link>
                        <Link href="/refund-policy" className="hover:text-[#c5a059] transition-colors">Refund & Cancellation</Link>
                        <Link href="/company-details" className="hover:text-[#c5a059] transition-colors text-white/80 font-black">Company Details</Link>
                    </div>
                    <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em] font-bold">
                        &copy; {new Date().getFullYear()} DREAMLINE PRODUCTION<sup className="text-[12px] ml-1 font-black">®</sup>. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}
