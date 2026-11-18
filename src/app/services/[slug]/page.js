
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import PodcastVideo from "@/models/PodcastVideo";
import { ensurePodcastVideosSeeded } from "@/lib/podcast-defaults";
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
        thumbnail: "https://i.ytimg.com/vi/yleEJrCNEf0/maxresdefault.jpg"
    },
    {
        title: "সঙ্গীতে সফলতার টিপস | Prompt With Paromita",
        url: "https://youtube.com/shorts/KSivcLWbdnA",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/KSivcLWbdnA/maxresdefault.jpg"
    },
    {
        title: "সুন্দর বাংলা গান | Prompt With Paromita",
        url: "https://youtube.com/shorts/gV2eKL_RTrc",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/gV2eKL_RTrc/maxresdefault.jpg"
    },
    {
        title: "শতরূপে মা দুর্গা | Prompt With Paromita",
        url: "https://youtube.com/shorts/9nrOL-qhBf0",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/9nrOL-qhBf0/maxresdefault.jpg"
    },
    {
        title: "Calcutta's Mini Lucknow | Prompt With Paromita",
        url: "https://youtube.com/shorts/n1-LSS_uzJQ",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/n1-LSS_uzJQ/maxresdefault.jpg"
    },
    {
        title: "Get Healed Through Recitation by Sangita Saha | Prompt With Paromita",
        url: "https://youtube.com/shorts/5bINCVdismM",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/5bINCVdismM/maxresdefault.jpg"
    },
    {
        title: "ডায়মন্ড কি শুধুই হাই-সোসাইটির জন্য? | Sbd Lifestyle",
        url: "https://youtube.com/shorts/JV_yYXVIgjo",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/JV_yYXVIgjo/maxresdefault.jpg"
    },
    {
        title: "ভবানীপুর কী deciding factor? West Bengal Elections Analysis | Kholapata ebong Arpita",
        url: "https://youtu.be/vTQLIoqQPGU",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/vTQLIoqQPGU/maxresdefault.jpg"
    },
    {
        title: "অল্প বয়সেও হতে পারে Prostate Problem! Dr. Avishek Mukherjee | Kholapata ebong Arpita",
        url: "https://youtu.be/TU6KUw_55ic",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/TU6KUw_55ic/maxresdefault.jpg"
    },
    {
        title: "\"ভারতীয় মেয়েদের বিশ্বজয়, লড়াই শুরু হয়েছিল বহুদিন আগে\" মিঠু মুখোপাধ্যায় | Kholapata ebong Arpita",
        url: "https://youtube.com/shorts/J_s5AIP-hFY",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/J_s5AIP-hFY/maxresdefault.jpg"
    },
    {
        title: "\"রাজনীতিতে কে থাকবে, আর কে যাবে, predict করা খুব মুশকিল\" জওহর সরকার | Kholapata ebong Arpita",
        url: "https://youtube.com/shorts/f2_paHV562A",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/f2_paHV562A/maxresdefault.jpg"
    },
    {
        title: "Banglar gan with versatile singer Pousali Banerjee | Prompt With Paromita",
        url: "https://youtu.be/rGCNP3nWC9Y",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/rGCNP3nWC9Y/maxresdefault.jpg"
    },
    {
        title: "দীপান্বিতা অমাবস্যার নিয়ম! #shorts | Prompt With Paromita",
        url: "https://youtube.com/shorts/hRnCf_evOZs",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/hRnCf_evOZs/maxresdefault.jpg"
    },
    {
        title: "দুর্গাপুজোর বোধন,বিসর্জন,সিঁদুর খেলা—কেন এই রীতি ? | Kholapata ebong Arpita",
        url: "https://youtu.be/t4YqQvedLkE",
        type: "standard",
        thumbnail: "https://i.ytimg.com/vi/t4YqQvedLkE/maxresdefault.jpg"
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
        thumbnail: "https://i.ytimg.com/vi/fLturgnZcMw/maxresdefault.jpg"
    },
    {
        title: "মারণ ক্রিয়া কি ? তন্ত্র দিয়ে কি সত্যিই ক্ষতি করা যায়? | ANI In Search For Truth",
        url: "https://youtube.com/shorts/p-AOOftRg_E",
        type: "shorts",
        thumbnail: "https://i.ytimg.com/vi/p-AOOftRg_E/maxresdefault.jpg"
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
            {page.heroImage && !isPodcastPage && (
                <section className="px-4 md:px-10 mb-24">
                    <div className="relative aspect-[21/9] w-full rounded-[2rem] overflow-hidden border border-white/5">
                        <Image 
                            src={page.heroImage} 
                            alt={page.heroImageAlt || `${page.title} - Professional cinematography service by Dreamline Production Kolkata`} 
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
            {(() => {
                const displayVideos = isPodcastPage
                    ? (podcastVideos.length > 0 ? podcastVideos : (page.videos && page.videos.length > 0 ? page.videos : DEFAULT_PODCAST_VIDEOS))
                    : (page.videos || []);

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
                                    alt={img.alt || img.caption || `${page.title} visual portfolio capture ${idx + 1} by Dreamline Production Kolkata`} 
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
                <Link href={page.ctaLink || "/contact"} className="inline-block px-12 py-5 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive shadow-2xl">
                    {page.ctaText || "Get a Quote"}
                </Link>
            </section>
        </main>
    );
}
