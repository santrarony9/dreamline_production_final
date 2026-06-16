
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import Content from "@/models/Content";
import Image from "next/image";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function generateMetadata({ params }) {
    await dbConnect();
    const { slug } = await params;
    const page = await ServicePage.findOne({ slug }).lean();
    
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
    return {
        title: title,
        description: description,
        alternates: {
            canonical: `https://dreamlineproduction.com/services/${slug}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://dreamlineproduction.com/services/${slug}`,
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
    const page = await ServicePage.findOne({ slug }).lean();
    const siteContent = await Content.findOne().lean();

    if (!page) {
        // Fallback: Try to find which category this subcategory belongs to
        const categoryMatch = (siteContent?.home?.services || []).find(s => 
            (s.subcategories || []).some(sub => slugify(sub) === slug)
        );
        
        const parentCategory = categoryMatch?.category || "home";
        const parentLink = parentCategory === "wedding" ? "/luxury" : parentCategory === "commercial" ? "/commercial" : parentCategory === "tech" ? "/tech" : "/";
        const parentLabel = parentCategory === "wedding" ? "Luxury Weddings" : parentCategory === "commercial" ? "Commercial Showcase" : parentCategory === "tech" ? "Tech Divisions" : "Home";

        return (
            <main className="bg-black min-h-screen flex items-center justify-center pt-32 px-6">
                <div className="text-center max-w-2xl">
                    <div className="mb-8 relative inline-block">
                        <h1 className="text-[#c5a059] font-heading font-black text-6xl md:text-8xl uppercase tracking-tighter opacity-20">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="text-white font-black text-2xl md:text-3xl uppercase tracking-widest whitespace-nowrap">NOT READY</h2>
                        </div>
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-12 leading-relaxed">
                        The cinematic experience for <span className="text-[#c5a059]">{slug.replace(/-/g, ' ')}</span> is currently being mastered.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href={parentLink} className="w-full sm:w-auto bg-[#c5a059] text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1">
                            Back to {parentLabel}
                        </a>
                        <a href="/" className="w-full sm:w-auto border border-white/10 text-white/50 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">
                            Return Home
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-black pt-24 md:pt-32">
            {/* HERO SECTION */}
            <section className="px-8 md:px-16 mb-20">
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
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase italic mb-12 leading-tight">
                    Let's create <br /> something <span className="text-[#c5a059]">iconic.</span>
                </h2>
                <a href="/contact" className="inline-block px-12 py-5 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive shadow-2xl">
                    Get a Quote
                </a>
            </section>
        </main>
    );
}
