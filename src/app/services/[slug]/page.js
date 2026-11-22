
export const revalidate = 300;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import PodcastVideo from "@/models/PodcastVideo";
import { ensurePodcastVideosSeeded } from "@/lib/podcast-defaults";
import ProductImage from "@/models/ProductImage";
import ProductCategory from "@/models/ProductCategory";
import { ensureProductGallerySeeded, INITIAL_PRODUCT_CATEGORIES, INITIAL_PRODUCT_IMAGES } from "@/lib/product-gallery-defaults";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import JewelleryItem from "@/models/JewelleryItem";
import JewelleryPureGallery from "@/components/jewellery/JewelleryPureGallery";
import Content from "@/models/Content";
import Image from "next/image";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DEFAULT_PODCAST_VIDEOS = [
    {
        title: "কেন টেলিভিশন ইন্ডাস্ট্রিকে 'Soulless Job' বললেন অভিনেতা বরুণ চন্দ? | Prompt With Paromita",
        url: "https://youtube.com/shorts/yleEJrCNEf0",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/yleEJrCNEf0/hqdefault.jpg"
    },
    {
        title: "সঙ্গীতে সফলতার টিপস | Prompt With Paromita",
        url: "https://youtube.com/shorts/KSivcLWbdnA",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/KSivcLWbdnA/hqdefault.jpg"
    },
    {
        title: "সুন্দর বাংলা গান | Prompt With Paromita",
        url: "https://youtube.com/shorts/gV2eKL_RTrc",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/gV2eKL_RTrc/hqdefault.jpg"
    },
    {
        title: "শতরূপে মা দুর্গা | Prompt With Paromita",
        url: "https://youtube.com/shorts/9nrOL-qhBf0",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/9nrOL-qhBf0/hqdefault.jpg"
    },
    {
        title: "Calcutta's Mini Lucknow | Prompt With Paromita",
        url: "https://youtube.com/shorts/n1-LSS_uzJQ",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/n1-LSS_uzJQ/hqdefault.jpg"
    },
    {
        title: "Get Healed Through Recitation by Sangita Saha | Prompt With Paromita",
        url: "https://youtube.com/shorts/5bINCVdismM",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/5bINCVdismM/hqdefault.jpg"
    },
    {
        title: "ডায়মন্ড কি শুধুই হাই-সোসাইটির জন্য? | Sbd Lifestyle",
        url: "https://youtube.com/shorts/JV_yYXVIgjo",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/JV_yYXVIgjo/hqdefault.jpg"
    },
    {
        title: "ভবানীপুর কী deciding factor? West Bengal Elections Analysis | Kholapata ebong Arpita",
        url: "https://youtu.be/vTQLIoqQPGU",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/vTQLIoqQPGU/hqdefault.jpg"
    },
    {
        title: "অল্প বয়সেও হতে পারে Prostate Problem! Dr. Avishek Mukherjee | Kholapata ebong Arpita",
        url: "https://youtu.be/TU6KUw_55ic",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/TU6KUw_55ic/hqdefault.jpg"
    },
    {
        title: "\"ভারতীয় মেয়েদের বিশ্বজয়, লড়াই শুরু হয়েছিল বহুদিন আগে\" মিঠু মুখোপাধ্যায় | Kholapata ebong Arpita",
        url: "https://youtube.com/shorts/J_s5AIP-hFY",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/J_s5AIP-hFY/hqdefault.jpg"
    },
    {
        title: "\"রাজনীতিতে কে থাকবে, আর কে যাবে, predict করা খুব মুশকিল\" জওহর সরকার | Kholapata ebong Arpita",
        url: "https://youtube.com/shorts/f2_paHV562A",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/f2_paHV562A/hqdefault.jpg"
    },
    {
        title: "Banglar gan with versatile singer Pousali Banerjee | Prompt With Paromita",
        url: "https://youtu.be/rGCNP3nWC9Y",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/rGCNP3nWC9Y/hqdefault.jpg"
    },
    {
        title: "দীপান্বিতা অমাবস্যার নিয়ম! #shorts | Prompt With Paromita",
        url: "https://youtube.com/shorts/hRnCf_evOZs",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/hRnCf_evOZs/hqdefault.jpg"
    },
    {
        title: "দুর্গাপুজোর বোধন,বিসর্জন,সিঁদুর খেলা—কেন এই রীতি ? | Kholapata ebong Arpita",
        url: "https://youtu.be/t4YqQvedLkE",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/t4YqQvedLkE/hqdefault.jpg"
    },
    {
        title: "মাত্র ৪৮ মিনিট! কেন এই সময়টাই এত গুরুত্বপূর্ণ? | Kholapata ebong Arpita",
        url: "https://youtube.com/shorts/qtp9vJ0xzFY",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/qtp9vJ0xzFY/hqdefault.jpg"
    },
    {
        title: "শান্তিপুরের ঐতিহ্য: বড় গোস্বামী বাড়ি ও আগমেশ্বরী মাতার অজানা ইতিহাস | ANI In Search For Truth",
        url: "https://youtu.be/fLturgnZcMw",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/fLturgnZcMw/hqdefault.jpg"
    },
    {
        title: "মারণ ক্রিয়া কি ? তন্ত্র দিয়ে কি সত্যিই ক্ষতি করা যায়? | ANI In Search For Truth",
        url: "https://youtube.com/shorts/p-AOOftRg_E",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/p-AOOftRg_E/hqdefault.jpg"
    }
];

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

    const title = page.seoTitle || page.title;
    const description = page.metaDescription || page.description || "Professional cinematic production services in Kolkata.";
    const canonicalSlug = page.slug || slug;
    return {
        title: title,
        description: description,
        keywords: page.metaKeywords || undefined,
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

    const isPodcastPage = (page.slug || slug) === 'podcast-production-kolkata' || slug === 'podcast';
    let podcastVideos = [];
    if (isPodcastPage) {
        try {
            await ensurePodcastVideosSeeded();
            const docs = await PodcastVideo.find({ status: 'published' })
                .sort({ displayOrder: 1, createdAt: -1 })
                .lean();
            if (docs && docs.length > 0) {
                podcastVideos = docs.map(d => ({
                    title: d.title,
                    url: d.youtubeUrl,
                    thumbnail: d.thumbnail,
                    type: d.videoType,
                    category: d.category,
                    description: d.description,
                    _id: d._id.toString()
                }));
            }
        } catch (e) {
            console.error("Failed to query podcast videos from DB:", e);
        }
    }

    const isJewelleryProductPage = (page.slug || slug) === 'product-photography-kolkata';
    let jewelleryItems = [];
    if (isJewelleryProductPage) {
        try {
            const rawJewels = await JewelleryItem.find({ isPublished: true, isUnclassified: { $ne: true } })
                .sort({ order: 1, createdAt: -1 })
                .lean();
            if (rawJewels && rawJewels.length > 0) {
                jewelleryItems = rawJewels.map(item => ({
                    id: item.slug || item._id.toString(),
                    coverImage: item.coverImage,
                    images: (item.images && item.images.length > 0)
                        ? item.images.map(img => typeof img === 'string' ? img : img.url)
                        : [item.coverImage]
                }));
            }
        } catch (e) {
            console.error("Failed to query jewellery gallery items:", e);
        }
    }

    const isProductPage = (page.slug || slug) === 'product';
    let productImages = [];
    let productCategories = [];
    if (isProductPage) {
        try {
            await ensureProductGallerySeeded();
            const [imgs, cats] = await Promise.all([
                ProductImage.find({ isPublished: true }).sort({ order: 1, isFeatured: -1, createdAt: -1 }).lean(),
                ProductCategory.find({ isActive: true }).sort({ order: 1 }).lean()
            ]);
            productImages = JSON.parse(JSON.stringify(imgs && imgs.length > 0 ? imgs : INITIAL_PRODUCT_IMAGES));
            productCategories = JSON.parse(JSON.stringify(cats && cats.length > 0 ? cats : INITIAL_PRODUCT_CATEGORIES));
        } catch (e) {
            console.error("Failed to query product gallery:", e);
            productImages = INITIAL_PRODUCT_IMAGES;
            productCategories = INITIAL_PRODUCT_CATEGORIES;
        }
    }

    const displayVideos = isPodcastPage
        ? (podcastVideos.length > 0 ? podcastVideos : (page.videos && page.videos.length > 0 ? page.videos : DEFAULT_PODCAST_VIDEOS))
        : (page.videos || []);

    const hasMedia = isJewelleryProductPage || isProductPage || displayVideos.length > 0 || (page.gallery && page.gallery.length > 0);

    return (
        <main className="page-main">
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
            <section className="page-hero-section">
                <nav aria-label="Breadcrumb" className="page-breadcrumb">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/services/">Services</Link>
                    <span>/</span>
                    <span className="current">{page.title}</span>
                </nav>
                <div className="max-w-4xl">
                    <span className="page-category-label">
                        {page.subtitle || "Service Specialty"}
                    </span>
                    <h1 className="page-hero-title">
                        {page.title}
                    </h1>
                    <p className="page-hero-desc">
                        {page.description}
                    </p>
                </div>
            </section>

            {/* PURE IMAGE-ONLY JEWELLERY GALLERY */}
            {isJewelleryProductPage ? (
                <JewelleryPureGallery initialItems={jewelleryItems} />
            ) : isProductPage ? (
                <ProductImageGallery 
                    initialImages={productImages}
                    initialCategories={productCategories}
                    heroTitle={page.title}
                    heroSubtitle={page.subtitle}
                />
            ) : (
                <>
                    {/* HERO IMAGE / VIDEO AREA */}
                    {page.heroImage && !isPodcastPage && (
                <section className="content-container mb-16 md:mb-20">
                    <div className="relative aspect-[21/9] w-full rounded-[1.75rem] md:rounded-[2rem] overflow-hidden border border-white/5">
                        <Image 
                            src={page.heroImage} 
                            alt={page.heroImageAlt || `${page.title} - Professional cinematography service by Dreamline Production Kolkata`} 
                            fill 
                            className="object-cover opacity-80"
                            priority
                            sizes="(max-width: 1400px) 100vw, 1400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                </section>
            )}

            {/* VIDEO SHOWCASE SECTION */}
            {(() => {
                if (!displayVideos || displayVideos.length === 0) return null;

                const isBirthday = (page.slug === 'birthday-photography-kolkata' || slug === 'birthday-photography-kolkata');
                const isOtherSocial = (page.slug === 'other-social-events-kolkata' || slug === 'other-social-events-kolkata');

                const defaultTitle = isBirthday
                    ? "Birthday Photography Videos"
                    : isOtherSocial
                    ? "Other Social Events Videos"
                    : (page.title ? `${page.title} Videos` : "Cinematic Showcase");

                const defaultSubtitle = isBirthday
                    ? "Explore our milestone birthday cinematography, vibrant celebrations & candid moments."
                    : isOtherSocial
                    ? "Explore our cultural celebrations, sacred ceremonies, milestone anniversaries & festive gatherings."
                    : (isPodcastPage ? "Explore our podcast productions, conversations and creative video projects." : "Cinematic video captures & visual storytelling.");

                const sectionTitle = isPodcastPage
                    ? "Our Podcast Productions"
                    : (page.videoSectionTitle || defaultTitle);

                const sectionSubtitle = isPodcastPage
                    ? "Explore our podcast productions, conversations and creative video projects."
                    : (page.videoSectionSubtitle || defaultSubtitle);

                return (
                    <ServiceVideoShowcase 
                        videos={displayVideos}
                        title={sectionTitle}
                        subtitle={sectionSubtitle}
                        pageSlug={page.slug || slug}
                    />
                );
            })()}

            {/* CUSTOM CONTENT SECTIONS (IF MANAGED VIA BACKEND) */}
            {page.sections && page.sections.length > 0 && (
                <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto space-y-16">
                    {page.sections.map((sec, sIdx) => (
                        <div key={sIdx} className={`grid grid-cols-1 ${sec.image ? 'lg:grid-cols-2 gap-12 items-center' : 'max-w-4xl mx-auto'}`}>
                            <div className="space-y-4">
                                {sec.subtitle && (
                                    <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em]">
                                        {sec.subtitle}
                                    </span>
                                )}
                                {sec.title && (
                                    <h3 className="font-heading text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
                                        {sec.title}
                                    </h3>
                                )}
                                {sec.content && (
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                        {sec.content}
                                    </p>
                                )}
                            </div>
                            {sec.image && (
                                <div className="rounded-3xl overflow-hidden border border-[#c5a059]/20 relative shadow-2xl">
                                    <img 
                                        src={sec.image} 
                                        alt={sec.title || `${page.title} feature`} 
                                        className="w-full h-auto object-cover max-h-[450px]" 
                                        loading="lazy" 
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* TESTIMONIALS SECTION */}
            {page.testimonials && page.testimonials.length > 0 && (
                <section className="py-20 px-8 md:px-16 bg-[#0c0c0c] border-y border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 text-center">
                            <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.3em]">Client Experiences</span>
                            <h2 className="font-heading text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight mt-2">
                                Praise &amp; <span className="text-[#c5a059]">Stories.</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {page.testimonials.map((test, tIdx) => (
                                <div key={tIdx} className="bg-black/60 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/40 transition-colors">
                                    <div className="flex items-center gap-1 text-[#c5a059] text-xs">
                                        {Array.from({ length: test.rating || 5 }).map((_, rIdx) => (
                                            <span key={rIdx}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-white/80 text-xs md:text-sm italic leading-relaxed">
                                        "{test.comment}"
                                    </p>
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-xs font-bold uppercase tracking-wide">{test.clientName}</p>
                                            {test.company && <p className="text-white/50 text-[10px] uppercase">{test.company}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PHOTO GALLERY SECTION */}
            {page.gallery && page.gallery.length > 0 && (
                <section className="content-container py-16 md:py-20 w-full">
                    <div className="mb-10 text-center md:text-left">
                        <span className="page-category-label">Cinematic Stills</span>
                        <h2 className="section-title italic tracking-tight">
                            Captured <span className="text-[#c5a059]">Frames.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        {page.gallery.map((img, idx) => {
                            const isOddLast = page.gallery.length % 2 === 1 && idx === page.gallery.length - 1;
                            return (
                                <div key={idx} className={isOddLast ? "md:col-span-2 flex justify-center w-full" : "w-full"}>
                                    <div className={`relative aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 group shadow-2xl bg-neutral-950 ${isOddLast ? "w-full md:w-[calc(50%-1.25rem)]" : "w-full"}`}>
                                        <img 
                                            src={img.url} 
                                            alt={img.alt || img.caption || `${page.title} visual portfolio capture ${idx + 1} by Dreamline Production Kolkata`} 
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <p className="text-white text-xs md:text-sm font-black uppercase tracking-wider text-[#c5a059]">{img.caption}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* LUXURY EMPTY STATE: PORTFOLIO IN PRODUCTION */}
            {!hasMedia && (
                <section className="py-20 px-6 sm:px-10 md:px-16 max-w-5xl mx-auto">
                    <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 bg-gradient-to-b from-[#14120c] via-[#0d0d0d] to-[#080808] border border-[#c5a059]/30 text-center shadow-2xl overflow-hidden">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a059]">
                                    Master Showcase In Production
                                </span>
                            </div>

                            <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">
                                Curated {page.title} <span className="text-[#c5a059]">Portfolio.</span>
                            </h3>

                            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
                                Our dedicated cinema reels and client case studies for {page.title.toLowerCase()} are currently being mastered in our Kolkata color-grading suite. Private showreels, rate cards, and customized production decks are available upon request.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto text-left">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c5a059] block">Broadcast Cinema</span>
                                    <p className="text-xs text-white/50">RED, Sony FX &amp; ARRI cinema packages available</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c5a059] block">Color &amp; Sound</span>
                                    <p className="text-xs text-white/50">DaVinci Resolve HDR grading &amp; 5.1 mixing</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c5a059] block">NDA &amp; Commercial</span>
                                    <p className="text-xs text-white/50">Full copyright ownership &amp; confidentiality</p>
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href={page.ctaLink || "/contact"}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#c5a059] text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-xl"
                                >
                                    Request Private Reel &amp; Quote
                                </Link>
                                <a
                                    href="https://wa.me/918240054002"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-white/10 transition-all"
                                >
                                    Chat on WhatsApp ↗
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CALL TO ACTION */}
            <section className="py-32 bg-black text-center border-t border-white/5">
                <span className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Ready to collaborate?</span>
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase italic mb-12 leading-tight pb-2 md:pb-4">
                    Let's create <br /> something <span className="text-[#c5a059]">iconic.</span>
                </h2>
                <Link href={page.ctaLink || "/contact"} className="inline-block px-12 py-5 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive shadow-2xl">
                    {page.ctaText || "Get a Quote"}
                </Link>
            </section>
                </>
            )}
        </main>
    );
}
