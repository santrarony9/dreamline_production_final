
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import Content from "@/models/Content";
import Image from "next/image";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function generateMetadata({ params }) {
    await dbConnect();
    const { slug } = await params;
    const page = await ServicePage.findOne({ $or: [{ slug }, { aliases: slug }] }).lean();
    
    if (!page) {
        const formattedSlug = slug.replace(/-/g, ' ');
        return {
            title: `${formattedSlug} - Coming Soon`,
            description: `The cinematic experience for ${formattedSlug} is currently being mastered.`,
            robots: { index: false, follow: false }
        };
    }

    const title = page.title;
    const description = page.description || "Professional cinematic production services in Kolkata.";
    const canonicalSlug = page.slug || slug;
    return {
        title: title,
        description: description,
        alternates: {
            canonical: `https://dreamlineproduction.com/services/${canonicalSlug}/`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://dreamlineproduction.com/services/${canonicalSlug}/`,
            siteName: 'Dreamline Production',
            locale: 'en_IN',
            type: 'website',
            images: [{ url: '/logo-banner.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: ['/logo-banner.png'],
        },
    };
}

export default async function DynamicServicePage({ params }) {
    await dbConnect();
    const { slug } = await params;
    const rawPage = await ServicePage.findOne({ $or: [{ slug }, { aliases: slug }] }).lean();
    const page = rawPage ? JSON.parse(JSON.stringify(rawPage)) : null;

    if (!page) {
        return notFound();
    }

    // Permanent 301 redirect if accessed via an alias or non-canonical slug
    if (page.slug && page.slug !== slug) {
        redirect(`/services/${page.slug}/`);
    }

    const rawSiteContent = await Content.findOne().lean();
    const siteContent = JSON.parse(JSON.stringify(rawSiteContent || {}));

    return (
        <main className="bg-black pt-24 md:pt-32">
            <StructuredData data={{
                "@context": "https://schema.org",
                "@type": "Service",
                "name": page.title,
                "description": page.description || "Professional cinematic production services in Kolkata.",
                "provider": {
                    "@type": "ProfessionalService",
                    "name": "Dreamline Production",
                    "url": "https://dreamlineproduction.com"
                },
                "url": `https://dreamlineproduction.com/services/${page.slug || slug}/`,
                "areaServed": ["Kolkata", "West Bengal", "India"]
            }} />
            {/* HERO SECTION */}
            <section className="px-8 md:px-16 mb-20">
                <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <Link href="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/services/" className="hover:text-[#c5a059] transition-colors">Services</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#c5a059]">{page.title}</span>
                </nav>
                <div className="max-w-4xl">
                    <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                        {page.subtitle || "Service Specialty"}
                    </span>
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase text-white leading-[0.9]">
                        {page.title}
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-2xl font-medium">
                        {page.description}
                    </p>
                </div>
            </section>

            {/* HERO IMAGE / VIDEO AREA */}
            {page.heroImage && (
                <section className="px-4 md:px-10 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[2rem] overflow-hidden border border-white/5">
                        <Image 
                            src={page.heroImage} 
                            alt={page.title} 
                            fill 
                            className="object-cover opacity-80"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                </section>
            )}

            {/* VIDEO SHOWCASE SECTION */}
            <ServiceVideoShowcase videos={page.videos} />

            {/* PHOTO GALLERY SECTION */}
            {page.gallery && page.gallery.length > 0 && (
                <section className="py-24 px-8 md:px-16">
                    <div className="mb-12">
                        <h2 className="font-heading text-3xl font-black text-white uppercase italic tracking-tighter">
                            Captured <span className="text-[#c5a059]">Frames.</span>
                        </h2>
                    </div>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {page.gallery.map((img, idx) => (
                            <div key={idx} className="relative rounded-3xl overflow-hidden border border-white/5 group">
                                <img 
                                    src={img.url} 
                                    alt={img.caption || `Gallery image ${idx}`} 
                                    loading="lazy"
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">{img.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CALL TO ACTION */}
            <section className="py-32 bg-black text-center border-t border-white/5">
                <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Ready to collaborate?</span>
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase italic mb-12 leading-tight pb-2 md:pb-4">
                    Let's create <br /> something <span className="text-[#c5a059]">iconic.</span>
                </h2>
                <Link href="/contact" className="inline-block px-12 py-5 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive shadow-2xl">
                    Get a Quote
                </Link>
            </section>
        </main>
    );
}
