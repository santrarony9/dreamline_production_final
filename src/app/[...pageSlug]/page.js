import dbConnect from "@/lib/mongodb";
import { notFound, permanentRedirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolvePageDestination } from "@/lib/page-redirects";
import SectionRenderer from "@/components/page-builder/SectionRenderer";
import StructuredData from "@/components/seo/StructuredData";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

function getISTDateString() {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

export async function generateMetadata({ params, searchParams }) {
    await dbConnect();
    const { pageSlug } = await params;
    const sp = searchParams ? await searchParams : {};
    const rawSlug = Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug;

    try {
        const destination = await resolvePageDestination(rawSlug);
        const page = destination?.page;

        if (!page) {
            return {
                title: 'Page Not Found | Dreamline Production',
                description: 'The requested page could not be found.',
                robots: { index: false, follow: false }
            };
        }

        const todayStr = getISTDateString();
        const isDraft = page.status === 'draft';
        const isScheduled = page.publishDate && page.publishDate > todayStr;

        if (isDraft || isScheduled) {
            const session = await getServerSession(authOptions);
            const isAuthorized = !!session || sp.preview === 'true';
            if (!isAuthorized) {
                return {
                    title: 'Page Not Found | Dreamline Production',
                    description: 'The requested page could not be found.',
                    robots: { index: false, follow: false }
                };
            }
        }

        const seoTitle = page.seo?.title || `${page.title} | Dreamline Production`;
        const seoDesc = page.seo?.description || page.description || "Luxury cinema and commercial production house based in Kolkata.";
        const canonical = page.seo?.canonicalUrl || `${SITE_URL}/${page.slug}/`;
        const ogImg = page.seo?.ogImage || page.featuredImage || page.bannerImage;

        return {
            title: seoTitle,
            description: seoDesc,
            keywords: page.seo?.keywords ? page.seo.keywords.split(',').map(k => k.trim()) : undefined,
            alternates: {
                canonical: canonical,
            },
            openGraph: {
                title: page.seo?.ogTitle || seoTitle,
                description: page.seo?.ogDescription || seoDesc,
                url: `${SITE_URL}/${page.slug}/`,
                siteName: 'Dreamline Production',
                locale: 'en_IN',
                type: 'website',
                images: ogImg ? [{
                    url: ogImg,
                    width: 1200,
                    height: 630,
                    alt: page.seo?.ogImageAlt || page.title,
                }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: page.seo?.ogTitle || seoTitle,
                description: page.seo?.ogDescription || seoDesc,
                images: ogImg ? [ogImg] : [],
            },
            robots: {
                index: !page.seo?.noIndex,
                follow: !page.seo?.noFollow,
                googleBot: {
                    index: !page.seo?.noIndex,
                    follow: !page.seo?.noFollow,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        };
    } catch (err) {
        console.error("Error generating page metadata:", err);
        return {
            title: 'Dreamline Production | Kolkata',
            description: 'Luxury cinematic storytelling and film production.',
        };
    }
}

export default async function CustomDynamicPage({ params, searchParams }) {
    await dbConnect();
    const { pageSlug } = await params;
    const sp = searchParams ? await searchParams : {};
    const rawSlug = Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug;

    const destination = await resolvePageDestination(rawSlug);

    if (!destination) {
        notFound();
    }

    // Handle 301 Permanent Redirect
    if (destination.type === 'redirect') {
        permanentRedirect(`/${destination.targetSlug}/`);
    }

    const page = destination.page;
    if (!page) {
        notFound();
    }

    const todayStr = getISTDateString();
    const isDraft = page.status === 'draft';
    const isScheduled = page.publishDate && page.publishDate > todayStr;
    const isPrivileged = isDraft || isScheduled;

    let isAuthorized = false;
    if (isPrivileged) {
        const session = await getServerSession(authOptions);
        isAuthorized = !!session || sp.preview === 'true';
        if (!isAuthorized) {
            notFound();
        }
    }

    const design = page.design || {};
    const sortedSections = [...(page.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Structured Data JSON-LD
    const structuredData = {
        "@context": "https://schema.org",
        "@type": page.seo?.structuredDataType || "WebPage",
        "name": page.seo?.title || page.title,
        "description": page.seo?.description || page.description || "Luxury cinema and commercial production house based in Kolkata.",
        "url": `${SITE_URL}/${page.slug}/`,
        "image": page.seo?.ogImage || page.featuredImage || page.bannerImage || undefined,
        "publisher": {
            "@type": "Organization",
            "name": "Dreamline Production",
            "url": SITE_URL,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/favicon.ico`
            }
        }
    };

    return (
        <main
            className="min-h-screen text-white relative"
            style={{
                backgroundColor: design.backgroundColor || "#050505",
                color: design.textColor || "#ffffff"
            }}
        >
            <StructuredData data={structuredData} />

            {/* Admin Preview Mode Banner */}
            {isPrivileged && isAuthorized && (
                <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-500/40 text-amber-200 px-6 py-3 sticky top-0 z-50 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-bold uppercase tracking-wider">
                            Admin Preview Mode:
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            {page.status === 'draft' ? 'Draft' : `Scheduled (${page.publishDate})`}
                        </span>
                        <span className="text-amber-300/80 hidden sm:inline">
                            — Hidden from search engines &amp; public visitors.
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/pages"
                            className="px-3 py-1 bg-black/60 hover:bg-black rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition-colors"
                        >
                            ← Back to Pages Builder
                        </Link>
                    </div>
                </div>
            )}

            {/* Page Sections Container */}
            <div className="w-full">
                {sortedSections.length > 0 ? (
                    sortedSections.map((section, idx) => (
                        <SectionRenderer
                            key={section.id || idx}
                            section={section}
                            design={design}
                            isPreview={false}
                        />
                    ))
                ) : (
                    /* Fallback default section if page has no sections configured */
                    <section className="py-36 text-center container mx-auto px-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#c5a059] mb-6 inline-block">
                            DREAMLINE PRODUCTION
                        </span>
                        <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
                            {page.title}
                        </h1>
                        {page.description && (
                            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed mb-8">
                                {page.description}
                            </p>
                        )}
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-4 bg-[#c5a059] text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-xl"
                        >
                            Inquire With Studio
                        </Link>
                    </section>
                )}
            </div>
        </main>
    );
}
