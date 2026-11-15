import Link from "next/link";

export default function Footer({ siteContent }) {
    const socialLinks = siteContent?.global?.social || {};
    const contact = siteContent?.global?.contact || {};
    const google = siteContent?.global?.google || {};

    const businessName = google.businessName || siteContent?.global?.company?.name || "Dreamline Production";
    const businessAddress = contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082";
    const gmbUrl = google.profileUrl || google.mapsUrl || "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9";
    const mapsUrl = google.mapsUrl || "https://www.google.com/maps/place/Dreamline+Production/@22.4850486,88.3313873,17z/data=!4m6!3m5!1s0x3a027090db628e8f:0x3b8514dce7da523b!8m2!3d22.4850486!4d88.3339622!16s%2Fg%2F11hb2thsvp";
    const directionsUrl = google.directionsUrl || "https://www.google.com/maps/dir/?api=1&destination=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&destination_place_id=ChIJj45i25BwAjoRO1La59wUhTs";
    const reviewsUrl = google.reviewsUrl || "https://search.google.com/local/writereview?placeid=ChIJj45i25BwAjoRO1La59wUhTs";

    const getEmbedSrc = (raw) => {
        if (!raw) return "https://maps.google.com/maps?q=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&t=&z=16&ie=UTF8&iwloc=&output=embed";
        if (typeof raw === 'string' && raw.includes('<iframe')) {
            const match = raw.match(/src=["']([^"']+)["']/i);
            if (match && match[1]) return match[1];
        }
        return raw;
    };
    const embedSrc = getEmbedSrc(google.embedCode);
    
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
                            Kolkata&apos;s premier cinematic house &amp; Pan-India luxury storyteller. Premium weddings, commercial films, and aerial productions since 2010.
                        </p>
                        <div className="pt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-2 py-1 rounded">GST: 19EILPS2898F1ZE</span>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/" className="hover:text-white transition-colors interactive">Home</Link>
                        <Link href="/about" className="hover:text-white transition-colors interactive">About Us</Link>
                        <Link href="/services/" className="hover:text-white transition-colors interactive">Services</Link>
                        <Link href="/portfolio/" className="hover:text-white transition-colors interactive">Portfolio</Link>
                        <Link href="/luxury" className="hover:text-white transition-colors interactive">Luxury Weddings</Link>
                        <Link href="/commercial" className="hover:text-white transition-colors interactive">Commercial</Link>
                        <Link href="/blogs" className="hover:text-white transition-colors interactive">Blogs</Link>
                        <Link href="/tech" className="hover:text-white transition-colors interactive">Tech</Link>
                        <Link href="/faq" className="hover:text-white transition-colors interactive">FAQ</Link>
                        {Array.isArray(siteContent?.global?.navigation?.footerItems) && siteContent.global.navigation.footerItems.map((fItem, idx) => (
                            <Link key={idx} href={fItem.href} className="hover:text-white transition-colors interactive text-white/90">
                                {fItem.label}
                            </Link>
                        ))}
                        <Link href="/contact" className="hover:text-white transition-colors interactive text-[#c5a059]">Get a Quote</Link>
                    </div>

                    {/* Contact & Social Section */}
                    <div className="lg:text-right space-y-6">
                        <div className="text-[10px] font-black text-white/50 flex flex-col sm:flex-row lg:justify-end gap-2 sm:gap-6 uppercase tracking-widest">
                            <a href={`tel:${contact.phone || "+918240054002"}`} className="hover:text-[#c5a059] transition-colors">{contact.phone || "+91 82400 54002"}</a>
                            <span className="hidden sm:inline">|</span>
                            <a 
                                href={gmbUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-[#c5a059] transition-colors inline-flex items-center gap-1.5"
                                title="View Studio on Google Business Profile"
                            >
                                <svg className="w-3 h-3 text-[#c5a059] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span>Kolkata Studio HQ</span>
                            </a>
                        </div>
                        <div className="flex lg:justify-end gap-3">
                            {platforms.map((p) => (
                                <a
                                    key={p.id}
                                    href={p.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-full border border-white/20 flex items-center justify-center text-[11px] tracking-widest font-black hover:border-[#c5a059] hover:text-[#c5a059] hover:bg-white/5 transition-all interactive"
                                >
                                    {p.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Studio Headquarters & Interactive Google Maps Section */}
                {google.mapEnabled !== false && (
                    <div className="pt-8 pb-10 border-t border-white/5">
                        <div className="bg-gradient-to-b from-[#0c0c0c] to-[#070707] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                {/* Business Details & Directions */}
                                <div className="lg:col-span-5 space-y-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] text-[9px] font-black uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                        Google Verified Business
                                    </div>

                                    <div>
                                        <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                                            {businessName}
                                        </h3>
                                        <p className="text-[#c5a059] text-[11px] font-bold uppercase tracking-widest mt-1">
                                            Studio Headquarters • Kolkata, WB
                                        </p>
                                    </div>

                                    {/* Clickable Verified Address Card */}
                                    <a
                                        href={gmbUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#c5a059]/40 hover:bg-white/[0.06] transition-all"
                                        title="Open in Google Maps / Google Business Profile"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center flex-shrink-0 text-[#c5a059] group-hover:scale-110 transition-transform">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Verified Address</span>
                                            <span className="text-xs text-gray-200 font-medium leading-relaxed group-hover:text-[#c5a059] transition-colors block">
                                                {businessAddress}
                                            </span>
                                        </div>
                                    </a>

                                    {/* Reviews Rating Link */}
                                    <a
                                        href={reviewsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-[#c5a059] transition-colors"
                                        title="View verified customer reviews on Google"
                                    >
                                        <span className="text-yellow-400">★★★★★</span>
                                        <span className="text-[11px] font-black text-white">4.9 on Google</span>
                                        <span className="text-[10px] text-gray-500 font-bold">(150+ Verified Reviews)</span>
                                        <span className="text-[10px] text-[#c5a059]">↗</span>
                                    </a>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <a
                                            href={directionsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                            <span>Get Directions</span>
                                        </a>

                                        <a
                                            href={gmbUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/15 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-[#c5a059] hover:text-[#c5a059] transition-all"
                                        >
                                            <span>Google Profile</span>
                                            <span className="text-xs">↗</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Interactive Google Maps Responsive Embed */}
                                <div className="lg:col-span-7">
                                    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl group">
                                        <iframe
                                            src={embedSrc}
                                            title={`${businessName} Studio Location Map`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="w-full h-full filter contrast-105 opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                        {/* Quick Overlay Action Pill */}
                                        <div className="absolute bottom-3 right-3 z-10">
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-[#c5a059]/40 text-[#c5a059] text-[9px] font-black uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-all shadow-lg"
                                                title="Open in Google Maps application"
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                </svg>
                                                <span>Open in Maps ↗</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Local SEO & Kolkata Service Areas */}
                <div className="pt-8 border-t border-white/5 mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c5a059] mb-4">
                        Kolkata Locations &amp; Studios
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-gray-500">
                        <Link href="/locations/wedding-photographer-salt-lake-kolkata" className="hover:text-white transition-colors">Wedding Photographer Salt Lake</Link>
                        <Link href="/locations/wedding-photographer-new-town-kolkata" className="hover:text-white transition-colors">Wedding Photographer New Town</Link>
                        <Link href="/locations/wedding-photographer-howrah" className="hover:text-white transition-colors">Wedding Photographer Howrah</Link>
                        <Link href="/locations/wedding-photographer-park-street-kolkata" className="hover:text-white transition-colors">Park Street Kolkata</Link>
                        <Link href="/locations/wedding-photographer-ballygunge-kolkata" className="hover:text-white transition-colors">Ballygunge South Kolkata</Link>
                        <Link href="/locations/pre-wedding-shoot-kolkata" className="hover:text-white transition-colors">Pre-Wedding Shoot Kolkata</Link>
                        <Link href="/locations/drone-photography-kolkata" className="hover:text-white transition-colors">Drone Photography Kolkata</Link>
                        <Link href="/services/wedding-photography-kolkata/" className="hover:text-white transition-colors">Wedding Photography Kolkata</Link>
                        <Link href="/services/corporate-photography-kolkata/" className="hover:text-white transition-colors">Corporate Photography Kolkata</Link>
                        <Link href="/services/drone-videography-kolkata/" className="hover:text-white transition-colors">Drone Videography Kolkata</Link>
                        <Link href="/services/drone-photography-kolkata/" className="hover:text-white transition-colors">Drone Photography Kolkata</Link>
                        <Link href="/services/pre-wedding-shoot-kolkata/" className="hover:text-white transition-colors">Pre-Wedding Shoot Kolkata</Link>
                        <Link href="/services/rice-ceremony-photography-kolkata/" className="hover:text-white transition-colors">Annaprashan / Rice Ceremony</Link>
                        <Link href="/services/video-production-agency-kolkata/" className="hover:text-white transition-colors">Video Production Agency</Link>
                        <Link href="/services/" className="text-[#c5a059] hover:underline">All Services &rarr;</Link>
                    </div>
                </div>

                {/* Legal & Bottom Row */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                        <Link href="/privacy-policy" className="hover:text-[#c5a059] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[#c5a059] transition-colors">Terms of Service</Link>
                        <Link href="/refund-policy" className="hover:text-[#c5a059] transition-colors">Refund &amp; Cancellation</Link>
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
