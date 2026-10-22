import Link from 'next/link';
import StructuredData from '@/components/seo/StructuredData';

export const metadata = {
    title: "Photography & Production Locations in Kolkata | Dreamline Production",
    description: "Explore Dreamline Production's photography and cinematic production service areas across Kolkata — Salt Lake, New Town, Howrah, Park Street, Ballygunge, and top pre-wedding shoot spots.",
    alternates: {
        canonical: "https://dreamlineproduction.com/locations",
    },
    openGraph: {
        title: "Photography & Production Locations in Kolkata | Dreamline Production",
        description: "Explore our photography and film production service areas across Kolkata and West Bengal.",
        url: "https://dreamlineproduction.com/locations",
        siteName: "Dreamline Production",
        locale: "en_IN",
        type: "website",
        images: [{ url: "/logo-banner.png", width: 1200, height: 630 }],
    },
};

const LOCATIONS = [
    {
        slug: "wedding-photographer-salt-lake-kolkata",
        service: "Wedding Photography",
        location: "Salt Lake (Sector V & Bidhannagar)",
        headline: "Wedding Photographer in Salt Lake, Kolkata",
        desc: "Cinematic wedding documentation, candid photography, and drone coverage for banquets and hotels across Salt Lake.",
        badge: "Salt Lake Hub",
    },
    {
        slug: "wedding-photographer-new-town-kolkata",
        service: "Wedding Photography",
        location: "New Town & Rajarhat",
        headline: "Wedding Photographer in New Town, Kolkata",
        desc: "Luxury wedding cinematography in New Town Action Area, Eco Park resort weddings, and 5-star hotel celebrations.",
        badge: "New Town & Rajarhat",
    },
    {
        slug: "wedding-photographer-howrah",
        service: "Wedding Photography",
        location: "Howrah & Greater Kolkata",
        headline: "Best Wedding Photographer in Howrah",
        desc: "15+ years capturing heritage weddings, traditional Bengali rituals, and grand banquets across Howrah district.",
        badge: "Howrah District",
    },
    {
        slug: "pre-wedding-shoot-kolkata",
        service: "Pre-Wedding Cinema",
        location: "Iconic Kolkata Backdrops",
        headline: "Best Pre-Wedding Shoot Locations in Kolkata",
        desc: "Cinematic couple shoots at Princep Ghat, Victoria Memorial, Eco Park, North Kolkata heritage mansions, and hidden gems.",
        badge: "Pre-Wedding Guide",
    },
    {
        slug: "corporate-film-production-salt-lake",
        service: "Corporate & Commercial",
        location: "Sector V IT Hub, Salt Lake",
        headline: "Corporate Film Production in Salt Lake & Sector V",
        desc: "Brand campaigns, corporate documentaries, and industrial video production for enterprises and tech leaders.",
        badge: "IT & Corporate Hub",
    },
    {
        slug: "drone-photography-kolkata",
        service: "Aerial Videography",
        location: "Pan-Kolkata & West Bengal",
        headline: "Professional Drone Photography in Kolkata",
        desc: "DGCA-certified drone operations for luxury weddings, real estate visualization, commercial projects, and large events.",
        badge: "DGCA Certified",
    },
    {
        slug: "wedding-photographer-park-street-kolkata",
        service: "Luxury Weddings",
        location: "Park Street & Central Kolkata",
        headline: "Wedding Photographer near Park Street",
        desc: "Documenting five-star hotel weddings at ITC Royal Bengal, Taj Bengal, The Oberoi Grand, and heritage venues.",
        badge: "5-Star Venues",
    },
    {
        slug: "wedding-photographer-ballygunge-kolkata",
        service: "Luxury Weddings",
        location: "Ballygunge & South Kolkata",
        headline: "Wedding Photographer in Ballygunge & South Kolkata",
        desc: "Premier wedding studio serving Ballygunge, Alipore, Bhowanipore, and South Kolkata's elite residential circles.",
        badge: "South Kolkata Hub",
    },
];

export default function LocationsHubPage() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Service Locations in Kolkata — Dreamline Production",
        "description": "Comprehensive photography and video production service locations in Kolkata and West Bengal.",
        "url": "https://dreamlineproduction.com/locations",
        "isPartOf": { "@id": "https://dreamlineproduction.com/#website" },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com" },
                { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://dreamlineproduction.com/locations" },
            ],
        },
    };

    return (
        <>
            <StructuredData data={schema} />
            <main className="bg-black pt-32 min-h-screen text-white">
                {/* Hero */}
                <section className="container mx-auto px-6 max-w-6xl mb-16 text-center">
                    <span className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                        KOLKATA SERVICE REGIONS &amp; HUBS
                    </span>
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-white">
                        Our <span className="text-[#c5a059]">Locations.</span>
                    </h1>
                    <p className="text-gray-400 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
                        From heritage South Kolkata residences to New Town banquets and Salt Lake corporate towers — Dreamline Production captures Kolkata&apos;s finest moments with cinema-grade storytelling.
                    </p>
                </section>

                {/* Locations Grid */}
                <section className="container mx-auto px-6 max-w-6xl pb-24">
                    <div className="grid md:grid-cols-2 gap-8">
                        {LOCATIONS.map((loc) => (
                            <Link
                                key={loc.slug}
                                href={`/locations/${loc.slug}`}
                                className="group bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/40 transition-all duration-500 hover:bg-white/[0.03] flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 px-3 py-1.5 rounded-full">
                                            {loc.badge}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                            {loc.service}
                                        </span>
                                    </div>
                                    <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-white mb-3 group-hover:text-[#c5a059] transition-colors">
                                        {loc.headline}
                                    </h2>
                                    <p className="text-gray-400 text-xs leading-relaxed mb-6">
                                        {loc.desc}
                                    </p>
                                </div>
                                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#c5a059] group-hover:translate-x-2 transition-transform">
                                    View Area Details &rarr;
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* NAP & Studio Contact */}
                <section className="container mx-auto px-6 max-w-6xl pb-32">
                    <div className="bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-10 md:p-16 text-center">
                        <span className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">
                            PRIMARY STUDIO HEADQUARTERS
                        </span>
                        <h3 className="font-heading text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
                            Dreamline Production Studio
                        </h3>
                        <p className="text-gray-300 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
                            85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-10 py-4 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all"
                            >
                                Inquire Availability
                            </Link>
                            <a
                                href="tel:+918240054002"
                                className="inline-flex items-center justify-center px-10 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all"
                            >
                                Call +91 82400 54002
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
