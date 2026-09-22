import Link from "next/link";

export default function Footer({ siteContent }) {
    const socialLinks = siteContent?.global?.social || {};
    const contact = siteContent?.global?.contact || {};
    
    const platforms = [
        { id: 'instagram', label: 'IG', link: socialLinks.instagram || "https://instagram.com/dreamlineproduction" },
        { id: 'facebook', label: 'FB', link: socialLinks.facebook || "https://facebook.com/dreamlineproduction" },
        { id: 'youtube', label: 'YT', link: socialLinks.youtube || "https://youtube.com/dreamlineproduction" }
    ];

    return (
        <footer className="py-12 border-t border-white/5 bg-[#050505]" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="font-heading text-2xl font-black inline-block uppercase tracking-tighter interactive whitespace-nowrap">
                            DREAMLINE <span className="text-[#c5a059] relative">
                                PRODUCTION<sup className="text-[#c5a059] text-[14px] ml-0.5">®</sup>
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
                            <a href={`tel:${contact.phone || "+918240054002"}`} className="hover:text-[#c5a059] transition-colors">{contact.phone || "+91 82400 54002"}</a>
                            <span className="hidden sm:inline">|</span>
                            <span>Kolkata, WB</span>
                        </div>
                        <div className="flex lg:justify-end gap-3">
                            {platforms.map((p) => (
                                <a
                                    key={p.id}
                                    href={p.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold hover:border-[#c5a059] hover:text-[#c5a059] transition-all interactive"
                                >
                                    {p.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GMB Map Section */}
                <div className="mb-12 rounded-2xl overflow-hidden border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.313589926456!2d88.343818!3d22.5855799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02773cbb752763%3A0xc3924f0c406de437!2sDreamline%20Production!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="250" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Dreamline Production Kolkata Office"
                    ></iframe>
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
                        <span className="text-[12px]">&copy;</span> {new Date().getFullYear()} DREAMLINE PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}
