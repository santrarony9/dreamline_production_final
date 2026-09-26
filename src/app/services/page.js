import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import ServicePage from "@/models/ServicePage";
import Link from "next/link";
import StructuredData from "@/components/seo/StructuredData";

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const metadata = {
    title: "Our Services — Dreamline Production | Wedding Photography, Corporate Films & More",
    description: "Explore all services by Dreamline Production, Kolkata's premier cinematic production house. Wedding photography, corporate films, ad films, drone videography, podcast production, line production, and more.",
    alternates: {
        canonical: "https://dreamlineproduction.com/services",
    },
    openGraph: {
        title: "Our Services — Dreamline Production",
        description: "Wedding photography, corporate films, ad films, drone videography, podcast production, and more from Kolkata's top production house.",
        url: "https://dreamlineproduction.com/services",
        type: "website",
    },
};

// Main service categories with their hub pages
const SERVICE_HUBS = [
    {
        title: "Luxury Wedding Photography & Cinematography",
        description: "Premium cinematic wedding documentation — candid photography, storytelling films, drone coverage, and heirloom albums. Specializing in luxury Bengali weddings and destination weddings across India.",
        href: "/luxury",
        icon: "💍",
        highlights: ["Candid Photography", "Cinematic Films", "Drone Coverage", "Pre-Wedding Shoots", "Destination Weddings"],
    },
    {
        title: "Commercial Film Production",
        description: "End-to-end production for corporate films, ad films, brand campaigns, factory videography, and commercial content. Trusted by TATA Trust, L&T, Carlsberg, BookMyShow.",
        href: "/commercial",
        icon: "🎥",
        highlights: ["Corporate Films", "Ad Films", "Brand Campaigns", "Factory Videography", "Product Videos"],
    },
    {
        title: "Tech, Digital & Innovation",
        description: "Cutting-edge web development, 2D animation, motion graphics, drone videography, 3D area mapping, and digital solutions by Dreamline's tech division.",
        href: "/tech",
        icon: "💻",
        highlights: ["Web Development", "2D Animation", "Drone Videography", "3D Mapping", "Motion Graphics"],
    },
];

export default async function ServicesPage() {
    await dbConnect();

    // Fetch dynamic service sub-pages from DB
    const servicePages = await ServicePage.find({ active: true }, { slug: 1, title: 1, subtitle: 1, description: 1 })
        .sort({ title: 1 })
        .lean();

    // Fetch categories from Content model
    const rawContent = await Content.findOne().lean();
    const services = rawContent?.home?.services || [];

    const serializedServicePages = JSON.parse(JSON.stringify(servicePages));

    return (
        <main className="bg-black pt-24 md:pt-32">
            <StructuredData data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "Services — Dreamline Production",
                "description": "All professional photography, videography, and production services offered by Dreamline Production in Kolkata.",
                "url": "https://dreamlineproduction.com/services",
                "isPartOf": { "@id": "https://dreamlineproduction.com/#website" },
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com" },
                        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://dreamlineproduction.com/services" }
                    ]
                }
            }} />

            {/* Hero */}
            <section className="px-8 md:px-16 mb-20">
                <div className="max-w-4xl">
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase text-white">
                        Our <br />
                        <span className="text-[#c5a059]">Services.</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
                        From luxury wedding cinematography to corporate film production — we craft visual narratives that resonate. Explore our complete range of cinematic and digital services.
                    </p>
                </div>
            </section>

            {/* Main Service Hubs */}
            <section className="px-8 md:px-16 mb-20">
                <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-10">Service Divisions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SERVICE_HUBS.map((hub) => (
                        <Link
                            key={hub.href}
                            href={hub.href}
                            className="group bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-all duration-500 hover:bg-white/[0.04]"
                        >
                            <span className="text-4xl mb-6 block">{hub.icon}</span>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-[#c5a059] transition-colors">
                                {hub.title}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-6">
                                {hub.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {hub.highlights.map((h) => (
                                    <span key={h} className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        {h}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#c5a059] group-hover:translate-x-2 transition-transform">
                                Explore →
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Individual Service Pages (from DB) */}
            {serializedServicePages.length > 0 && (
                <section className="px-8 md:px-16 mb-20">
                    <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-10">Specialized Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {serializedServicePages.map((sp) => (
                            <Link
                                key={sp._id}
                                href={`/services/${sp.slug}`}
                                className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[#c5a059]/20 transition-all"
                            >
                                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-[#c5a059] transition-colors">
                                    {sp.title}
                                </h3>
                                <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                                    {sp.description || sp.subtitle || "Premium cinematic production service"}
                                </p>
                                <span className="mt-4 block text-[9px] font-black uppercase tracking-widest text-[#c5a059]/60 group-hover:text-[#c5a059] transition-colors">
                                    View Details →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="px-8 md:px-16 pb-32">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Ready to <span className="text-[#c5a059]">Create?</span>
                    </h2>
                    <p className="text-white/50 text-sm mb-8 max-w-xl mx-auto">
                        Whether it&apos;s your wedding day or your next brand campaign — let&apos;s craft something extraordinary together.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-[#c5a059] text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                    >
                        Get in Touch
                    </Link>
                </div>
            </section>

            <noscript>
                <style>{`.motion-hidden { opacity: 1 !important; transform: none !important; }`}</style>
            </noscript>
        </main>
    );
}
