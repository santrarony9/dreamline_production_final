export const dynamic = 'force-dynamic';
export const revalidate = 0;
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import ProjectGallery from "@/components/home/ProjectGallery";
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export async function generateMetadata() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    const title = "Portfolio — Dreamline Production | Luxury Wedding Cinema & Commercial Films";
    const description = "Explore Dreamline Production's master portfolio. Over 500+ luxury weddings, high-fashion ad films, DGCA-certified drone cinematography, and corporate visual storytelling in Kolkata and across India.";

    return {
        title: title,
        description: description,
        keywords: "Wedding Photography Kolkata, Commercial Films Kolkata, Drone Videography, Production Portfolio, Dreamline Production Portfolio",
        alternates: {
            canonical: 'https://dreamlineproduction.com/portfolio/',
        },
        openGraph: {
            title: title,
            description: description,
            url: 'https://dreamlineproduction.com/portfolio/',
            siteName: 'Dreamline Production',
            locale: 'en_IN',
            type: 'website',
            images: [{ url: globalSeo.ogImage || '/logo-banner.png', width: 1200, height: 630, alt: 'Dreamline Production Master Portfolio' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [globalSeo.ogImage || '/logo-banner.png'],
        },
    };
}

export default async function PortfolioPage() {
    await dbConnect();

    const [weddings, rawSiteContent] = await Promise.all([
        Wedding.find().sort({ order: 1, createdAt: -1 }).lean(),
        Content.findOne().lean()
    ]);

    const siteContent = JSON.parse(JSON.stringify(rawSiteContent || {}));

    // Commercial projects stored in content model
    const commercialProjects = (siteContent?.projects || [])
        .filter(p => p.type === "commercial" || p.category === "commercial")
        .map(p => ({
            ...p,
            id: p._id?.toString() || Math.random().toString(),
            type: "commercial"
        }));

    // Wedding projects
    const weddingProjects = (weddings || []).map(w => ({
        id: w.id || w._id?.toString(),
        title: w.title || w.couple || "Wedding Story",
        type: "wedding",
        coverImage: w.coverImage || w.img,
        videoUrl: w.videoUrl,
        altText: w.altText || `Cinematic wedding story: ${w.title} by Dreamline Production Kolkata`
    }));

    // Combined projects for interactive ProjectGallery
    const allProjects = [...weddingProjects, ...commercialProjects];

    const breadcrumbs = [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com/" },
        { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://dreamlineproduction.com/portfolio/" }
    ];

    return (
        <main className="page-main text-white">
            <StructuredData data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "Master Portfolio — Dreamline Production",
                "description": "Master portfolio of luxury wedding films, commercial ad campaigns, and aerial cinematography by Dreamline Production.",
                "url": "https://dreamlineproduction.com/portfolio/",
                "isPartOf": { "@id": "https://dreamlineproduction.com/#website" },
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": breadcrumbs
                }
            }} />

            {/* Hero Header */}
            <section className="page-hero-section text-center max-w-4xl">
                <nav aria-label="Breadcrumb" className="page-breadcrumb justify-center">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span className="current">Portfolio</span>
                </nav>
                <span className="page-category-label">
                    The Archive of Excellence
                </span>
                <h1 className="page-hero-title mx-auto">
                    Master <span className="text-[#c5a059] italic">Portfolio.</span>
                </h1>
                <p className="page-hero-desc mx-auto">
                    Every frame is calibrated for emotional resonance and cinematic grandeur. Explore our documented luxury weddings, commercial ad films, and technical innovations.
                </p>

                {/* Quick Segment Jump Links */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <Link 
                        href="/luxury" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        Luxury Weddings
                    </Link>
                    <Link 
                        href="/commercial" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        Commercial Films
                    </Link>
                    <Link 
                        href="/services/drone-videography-kolkata/" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        Drone &amp; Aerial
                    </Link>
                    <Link 
                        href="/tech" 
                        className="px-5 py-2.5 rounded-full border border-white/10 hover:border-[#c5a059] bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white hover:text-[#c5a059] transition-all"
                    >
                        Tech &amp; 3D
                    </Link>
                </div>
            </section>

            {/* Interactive Master Project Gallery */}
            <ProjectGallery initialProjects={allProjects} category="all" />

            {/* Production Call to Action */}
            <section className="container mx-auto px-6 py-20 border-t border-white/5 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight">
                        Ready to Create Your <span className="text-[#c5a059] italic">Masterpiece?</span>
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Whether commissioning a luxury wedding documentary or a high-impact commercial film, collaborate directly with our directors.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            href="/contact" 
                            className="px-8 py-4 rounded-full bg-[#c5a059] text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_25px_rgba(197,160,89,0.5)] transition-all duration-300"
                        >
                            Get a Quote
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
