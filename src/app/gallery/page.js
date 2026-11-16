import dbConnect from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";
import WeddingAlbum from "@/models/WeddingAlbum";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import StructuredData from "@/components/seo/StructuredData";
import InteractiveGalleryView from "@/components/gallery/InteractiveGalleryView";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    const title = "Master Gallery — Dreamline Production | Luxury Wedding & Commercial Visual Archive";
    const description = "Explore Dreamline Production's curated photography and cinema gallery. Over 500+ luxury weddings, candid Bengali rituals, cinematic pre-wedding narratives, and drone aerials in Kolkata.";

    return {
        title: title,
        description: description,
        keywords: "Wedding Photography Kolkata, Bengali Wedding Rituals, Pre-Wedding Shoots Kolkata, Master Gallery, Drone Photography Kolkata, Commercial Photography Dreamline",
        alternates: {
            canonical: 'https://dreamlineproduction.com/gallery/',
        },
        openGraph: {
            title: title,
            description: description,
            url: 'https://dreamlineproduction.com/gallery/',
            siteName: 'Dreamline Production',
            locale: 'en_IN',
            type: 'website',
            images: [{
                url: globalSeo.ogImage || 'https://dreamlineproduction.com/logo-banner.png',
                width: 1200,
                height: 630,
                alt: 'Dreamline Production Master Gallery Archive',
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [globalSeo.ogImage || 'https://dreamlineproduction.com/logo-banner.png'],
        },
    };
}

export default async function GalleryPage() {
    await dbConnect();

    // Query published gallery items
    let rawItems = await GalleryItem.find({ published: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

    // If empty, trigger auto-seed from API or fallback
    if (rawItems.length === 0) {
        // Attempt to fetch from internal API seed
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gallery/`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                rawItems = data.items || [];
            }
        } catch(e) {
            console.error("Gallery fetch seed error:", e);
        }
    }

    const items = JSON.parse(JSON.stringify(rawItems || []));

    // Query published wedding albums for dedicated Wedding Album section
    let rawAlbums = [];
    try {
        rawAlbums = await WeddingAlbum.find({ published: true })
            .sort({ order: 1, createdAt: -1 })
            .lean();
    } catch (e) {
        console.error("Gallery wedding album query error:", e);
    }

    if (!rawAlbums || rawAlbums.length === 0) {
        try {
            const rawWeddings = await Wedding.find({ published: { $ne: false } })
                .sort({ order: 1 })
                .lean();
            rawAlbums = rawWeddings.map(w => ({
                albumId: `album-${w.id}`,
                weddingId: w.id,
                title: w.title,
                subtitle: w.subtitle || "Luxury Bengali Wedding",
                clientNames: w.clientNames || w.title,
                location: w.location || "Kolkata",
                coverImage: w.coverImage || w.img || (w.images && w.images[0]) || "",
                photosCount: (w.photos && w.photos.length) || (w.images && w.images.length) || 0,
                published: true
            }));
        } catch (e) {}
    }

    const weddingAlbums = JSON.parse(JSON.stringify(rawAlbums || []));

    // Compute category counts
    const counts = {
        all: items.length,
        weddings: items.filter(i => i.category === 'weddings').length,
        'pre-wedding': items.filter(i => i.category === 'pre-wedding').length,
        rituals: items.filter(i => i.category === 'rituals').length,
        commercial: items.filter(i => i.category === 'commercial').length,
        drone: items.filter(i => i.category === 'drone').length
    };

    const breadcrumbs = [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com/" },
        { "@type": "ListItem", "position": 2, "name": "Gallery", "item": "https://dreamlineproduction.com/gallery/" }
    ];

    return (
        <main className="bg-[#050505] text-white min-h-screen pt-28 md:pt-36">
            <StructuredData data={{
                "@context": "https://schema.org",
                "@type": "ImageGallery",
                "name": "Dreamline Production Master Gallery",
                "description": "Visual archive of luxury wedding photography, cinematic rituals, commercial campaigns, and aerial cinematography by Dreamline Production Kolkata.",
                "url": "https://dreamlineproduction.com/gallery/",
                "isPartOf": { "@id": "https://dreamlineproduction.com/#website" },
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs
                }
            }} />

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-12 md:py-16 text-center max-w-4xl">
                <span className="text-[#c5a059] text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mb-4 inline-block">
                    The Archive of Emotion &amp; Light
                </span>
                <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white mb-6">
                    Master <span className="text-[#c5a059] italic">Gallery.</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
                    Every frame tells an authentic story calibrated for timeless elegance. Browse our verified luxury wedding portraits, sacred ritual ceremonies, pre-wedding narratives, and commercial cinematography.
                </p>

                {/* Quick Segment Jump Links */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <Link 
                        href="/luxury" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        💍 Wedding Stories
                    </Link>
                    <Link 
                        href="/portfolio/" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        🎬 Master Portfolio
                    </Link>
                    <Link 
                        href="/services/drone-videography-kolkata/" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        🛸 Aerial Cinematography
                    </Link>
                </div>
            </section>

            {/* Interactive Master Gallery View */}
            <section className="container mx-auto px-6 pb-24 md:pb-32">
                <InteractiveGalleryView initialItems={items} counts={counts} weddingAlbums={weddingAlbums} />
            </section>

            {/* Studio Consultation CTA */}
            <section className="container mx-auto px-6 py-20 border-t border-white/5 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                    <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em]">
                        Document Your Story
                    </span>
                    <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight">
                        Commission Your Visual <span className="text-[#c5a059] italic">Legacy.</span>
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Reserve your wedding dates or schedule a commercial film briefing directly with founder and lead cinematographer Rony Santra.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            href="/contact" 
                            className="px-8 py-4 rounded-full bg-[#c5a059] text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_25px_rgba(197,160,89,0.5)] transition-all duration-300"
                        >
                            Inquire With Studio
                        </Link>
                        <a 
                            href="tel:+918240054002" 
                            className="px-8 py-4 rounded-full border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] hover:border-[#c5a059] hover:text-[#c5a059] transition-all"
                        >
                            Call Studio HQ
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
