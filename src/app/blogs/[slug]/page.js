import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import StructuredData from "@/components/seo/StructuredData";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveBlogDestination } from "@/lib/blog-redirects";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

const SERVICE_LINKS = {
  'WEDDING': [
    { title: 'Luxury Wedding Photography', href: '/luxury/', desc: 'Cinematic wedding films & candid photography' },
    { title: 'Pre-Wedding Shoots', href: '/locations/pre-wedding-shoot-kolkata/', desc: 'Stunning pre-wedding locations across Kolkata' },
    { title: 'Wedding Videography', href: '/locations/wedding-photographer-salt-lake-kolkata/', desc: 'Cinematic wedding films & highlight reels' },
  ],
  'COMMERCIAL': [
    { title: 'Corporate Films', href: '/commercial/', desc: 'Brand films, ad films & corporate documentaries' },
    { title: 'Commercial Photography', href: '/commercial/', desc: 'Product, fashion & commercial shoots' },
  ],
  'TECH': [
    { title: 'Drone Videography', href: '/services/drone-videography-kolkata/', desc: 'Aerial photography & DGCA-certified drone shoots' },
    { title: 'Tech & Innovation Services', href: '/tech/', desc: '3D mapping, animation & tech productions' },
  ],
  'INSIGHT': [
    { title: 'Wedding Photography', href: '/services/wedding-photography-kolkata/', desc: 'Luxury cinematic wedding documentation' },
    { title: 'Commercial Production', href: '/services/video-production-agency-kolkata/', desc: 'Corporate films & brand stories' },
    { title: 'Our Services', href: '/services/', desc: 'Full range of photography & production services' },
  ],
  'DEFAULT': [
    { title: 'Wedding Photography', href: '/services/wedding-photography-kolkata/', desc: 'Luxury cinematic wedding documentation' },
    { title: 'Commercial Films', href: '/services/video-production-agency-kolkata/', desc: 'Corporate films & brand stories' },
    { title: 'Contact Us', href: '/contact/', desc: 'Discuss your project with our team' },
  ]
};

function getISTDateString() {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

function calculateReadingTime(text) {
    if (!text) return "3 min read";
    const words = text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

export async function generateMetadata({ params, searchParams }) {
    await dbConnect();
    const { slug } = await params;
    const sp = searchParams ? await searchParams : {};

    try {
        const destination = await resolveBlogDestination(slug);
        const post = destination?.post;

        if (!post) {
            return {
                title: 'Blog Post Not Found | Dreamline Production',
                description: 'The requested blog post could not be found.',
                robots: { index: false, follow: false }
            };
        }

        const todayStr = getISTDateString();
        const isDraft = post.status === 'draft';
        const isScheduled = post.date && post.date > todayStr;

        if (isDraft || isScheduled) {
            const session = await getServerSession(authOptions);
            const isAuthorized = !!session || sp.preview === 'true';
            if (!isAuthorized) {
                return {
                    title: 'Blog Post Not Found | Dreamline Production',
                    robots: { index: false, follow: false }
                };
            }
        }

        const canonicalSlug = post.slug || post.id || slug;
        const canonicalUrl = post.seo?.canonicalUrl || `${SITE_URL}/blogs/${canonicalSlug}/`;
        const plainTextDesc = post.content 
            ? post.content.replace(/<[^>]+>/g, ' ').substring(0, 160).trim() + '...' 
            : `Read our latest story about ${post.title}.`;

        const metaTitle = post.seo?.title || `${post.title} | Dreamline Production`;
        const metaDesc = post.seo?.description || post.excerpt || plainTextDesc;
        const ogTitle = post.seo?.ogTitle || metaTitle;
        const ogDesc = post.seo?.ogDescription || metaDesc;
        const ogImage = post.seo?.ogImage || post.image || `${SITE_URL}/logo-banner.png`;
        const imageAlt = post.seo?.ogImageAlt || post.featuredImageAlt || post.title;

        const allowIndex = post.status === 'published' && !isScheduled && !post.seo?.noIndex;
        const allowFollow = !post.seo?.noFollow;

        return {
            title: metaTitle,
            description: metaDesc,
            alternates: {
                canonical: canonicalUrl,
            },
            robots: {
                index: allowIndex,
                follow: allowFollow,
                nocache: !allowIndex,
                googleBot: {
                    index: allowIndex,
                    follow: allowFollow,
                }
            },
            openGraph: {
                title: ogTitle,
                description: ogDesc,
                url: `${SITE_URL}/blogs/${canonicalSlug}/`,
                siteName: 'Dreamline Production',
                locale: 'en_IN',
                type: 'article',
                publishedTime: post.date,
                modifiedTime: post.updatedAt || post.date,
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: imageAlt
                    }
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: ogTitle,
                description: ogDesc,
                images: [ogImage],
            },
        };
    } catch (e) {
        console.error("Error generating blog metadata:", e);
        return {};
    }
}

export default async function JournalDetailPage({ params, searchParams }) {
    const { slug } = await params;
    const sp = searchParams ? await searchParams : {};
    await dbConnect();

    // 1. Resolve redirect or canonical slug
    const destination = await resolveBlogDestination(slug);

    if (!destination) {
        // Fallback check: Did user pass MongoDB ObjectId directly?
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            const rawPost = await Journal.findById(slug).lean();
            if (rawPost) {
                const target = rawPost.slug || rawPost.id;
                if (target) permanentRedirect(`/blogs/${target}/`);
            }
        }
        return notFound();
    }

    // 2. If accessed via alias, old redirected slug, or legacy id: 301 Permanent Redirect!
    if (destination.isRedirect && destination.targetSlug && destination.targetSlug !== slug) {
        permanentRedirect(`/blogs/${destination.targetSlug}/`);
    }

    const post = destination.post;
    if (!post) return notFound();

    // 3. Draft & Future Schedule Privacy Protection
    const todayStr = getISTDateString();
    const isDraft = post.status === 'draft';
    const isScheduled = post.date && post.date > todayStr;
    const isPrivate = isDraft || isScheduled;

    let isAuthorizedAdmin = false;
    if (isPrivate) {
        const session = await getServerSession(authOptions);
        isAuthorizedAdmin = !!session || sp.preview === 'true';
        if (!isAuthorizedAdmin) {
            return notFound();
        }
    }

    const canonicalSlug = post.slug || post.id || slug;
    const currentUrl = `${SITE_URL}/blogs/${canonicalSlug}/`;
    const readingTime = calculateReadingTime(post.content);
    const displayDate = post.date ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Dreamline Production';

    // 4. Fetch related published posts (same category or latest, excluding current)
    const relatedPosts = await Journal.find({
        _id: { $ne: post._id },
        $or: [
            { status: 'published' },
            { status: { $exists: false } },
            { status: null }
        ],
        $and: [
            {
                $or: [
                    { date: { $lte: todayStr } },
                    { date: null },
                    { date: "" },
                    { date: { $exists: false } }
                ]
            }
        ],
        ...(post.category ? { category: post.category } : {})
    }).sort({ date: -1 }).limit(3).lean();

    // 5. JSON-LD BlogPosting Schema
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
        },
        "headline": post.title,
        ...(post.subtitle ? { "alternativeHeadline": post.subtitle } : {}),
        "description": post.seo?.description || post.excerpt || post.content?.replace(/<[^>]+>/g, ' ').substring(0, 160).trim(),
        "image": post.image ? [post.image] : [`${SITE_URL}/logo-banner.png`],
        "datePublished": post.date || todayStr,
        "dateModified": post.updatedAt || post.date || todayStr,
        "author": {
            "@type": "Person",
            "name": post.author?.name || "Dreamline Production",
            "jobTitle": post.author?.role || "Editorial Team",
            ...(post.author?.avatar ? { "image": post.author.avatar } : {})
        },
        "publisher": {
            "@type": "Organization",
            "name": "Dreamline Production",
            "url": `${SITE_URL}/`,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`
            }
        },
        ...(post.tags && post.tags.length > 0 ? { "keywords": post.tags.join(", ") } : {})
    };

    return (
        <main className="bg-black pt-32 min-h-screen text-white">
            <StructuredData data={blogPostingSchema} />

            {/* Admin Draft / Scheduled Banner */}
            {isPrivate && (
                <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 py-3 px-6 text-center text-xs font-bold uppercase tracking-widest fixed top-20 left-0 w-full z-50 backdrop-blur-md">
                    🔒 Admin Preview Mode: This post is a {isDraft ? 'DRAFT' : `SCHEDULED post (Publish Date: ${post.date})`} and is hidden from the public website.
                </div>
            )}

            {/* Header & Title Section */}
            <section className="container mx-auto px-6 mb-12">
                <Link 
                    href="/blogs/" 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#c5a059] transition-colors mb-10 group interactive"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Journal
                </Link>

                <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                        <span className="text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                            {post.category || "Insight"}
                        </span>
                        <span>•</span>
                        <span>{displayDate}</span>
                        <span>•</span>
                        <span>{readingTime}</span>
                    </div>

                    <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-white uppercase">
                        {post.title}
                    </h1>

                    {post.subtitle && (
                        <p className="text-xl md:text-2xl text-[#c5a059] font-light leading-relaxed mb-8">
                            {post.subtitle}
                        </p>
                    )}

                    {/* Author Details Card */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 relative border border-[#c5a059]/30">
                            <Image
                                src={post.author?.avatar || "/logo.png"}
                                alt={post.author?.name || "Dreamline Production"}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">
                                {post.author?.name || "Dreamline Production"}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                {post.author?.role || "Editorial Team"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image Keyframe */}
            {post.image && (
                <section className="w-full h-[55vh] md:h-[70vh] relative mb-16 overflow-hidden">
                    <Image
                        src={post.image}
                        fill
                        className="w-full h-full object-cover transition-all duration-1000"
                        alt={post.featuredImageAlt || post.title}
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black"></div>
                </section>
            )}

            {/* Main Article Content */}
            <section className="container mx-auto px-6 pb-24">
                <div className="max-w-4xl mx-auto">
                    {/* Excerpt Lead Paragraph if provided */}
                    {post.excerpt && (
                        <div className="mb-10 text-xl text-gray-300 font-normal leading-relaxed border-l-2 border-[#c5a059] pl-6 py-1 italic">
                            {post.excerpt}
                        </div>
                    )}

                    {/* Rich HTML Content */}
                    <div
                        className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg 
                        prose-headings:font-heading prose-headings:text-white prose-headings:uppercase
                        prose-h1:text-4xl prose-h1:font-black prose-h1:mb-8 prose-h1:mt-12
                        prose-h2:text-3xl prose-h2:font-bold prose-h2:text-[#c5a059] prose-h2:mb-6 prose-h2:mt-12
                        prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-white prose-h3:mb-4 prose-h3:mt-8
                        prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-300
                        prose-strong:text-white prose-strong:font-bold
                        prose-a:text-[#c5a059] prose-a:underline hover:prose-a:text-white prose-a:transition-colors
                        prose-blockquote:border-l-[#c5a059] prose-blockquote:bg-white/[0.02] prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:my-2 prose-li:text-gray-300
                        prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:my-8 prose-img:w-full
                        prose-figure:my-10 prose-figure:text-center
                        prose-figcaption:text-xs prose-figcaption:text-gray-500 prose-figcaption:mt-3 prose-figcaption:tracking-wider uppercase font-bold"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />

                    {/* Tag Pills */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2">Tags:</span>
                            {post.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-white/5 border border-white/10 hover:border-[#c5a059] text-gray-300 px-4 py-1.5 rounded-full uppercase tracking-wider font-semibold transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA Box (Customizable per blog) */}
                    {post.cta && post.cta.title ? (
                        <div className="my-16 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#c5a059]/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none"></div>
                            <h3 className="font-heading text-2xl md:text-3xl font-black uppercase text-white mb-4">
                                {post.cta.title}
                            </h3>
                            {post.cta.description && (
                                <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base mb-8 leading-relaxed">
                                    {post.cta.description}
                                </p>
                            )}
                            <Link
                                href={post.cta.buttonUrl || "/contact/"}
                                className="inline-block bg-[#c5a059] text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-xl shadow-[#c5a059]/10"
                            >
                                {post.cta.buttonText || "Work With Us"}
                            </Link>
                        </div>
                    ) : null}

                    {/* Social Share & Back */}
                    <div className="mt-16 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share this story:</span>
                            <div className="flex gap-3">
                                <a 
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-[#c5a059] transition-all"
                                    title="Share on Facebook"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a 
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-[#c5a059] transition-all"
                                    title="Share on X"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                <a 
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-[#c5a059] transition-all"
                                    title="Share on LinkedIn"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </a>
                                <a 
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " - " + currentUrl)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-green-600 transition-all"
                                    title="Share on WhatsApp"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                                </a>
                            </div>
                        </div>
                        <Link href="/contact/" className="text-[#c5a059] font-black uppercase tracking-widest text-xs border-b-2 border-[#c5a059] pb-1 hover:text-white hover:border-white transition-all interactive">
                            Work with our studio →
                        </Link>
                    </div>

                    {/* Related Blog Posts */}
                    {relatedPosts.length > 0 && (
                        <section className="mt-20 pt-16 border-t border-white/5">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c5a059] mb-2">Continue Reading</p>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Related Insights</h2>
                                </div>
                                <Link href="/blogs/" className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-white transition-colors">
                                    All Articles →
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {relatedPosts.map((related) => {
                                    const relSlug = related.slug || related.id || related._id.toString();
                                    return (
                                        <Link 
                                            key={related._id.toString()} 
                                            href={`/blogs/${relSlug}/`}
                                            className="group bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#c5a059]/40 transition-all flex flex-col"
                                        >
                                            <div className="h-36 relative overflow-hidden bg-black">
                                                <Image
                                                    src={related.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={related.featuredImageAlt || `${related.title} - Dreamline Production Blog`}
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[8px] font-bold text-[#c5a059] uppercase tracking-widest block mb-2">
                                                        {related.category || "Insight"}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug line-clamp-2">
                                                        {related.title}
                                                    </h3>
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-4 block">
                                                    Read Story →
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Related Services Internal Links */}
                    <section className="mt-16 pt-12 border-t border-white/5">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-8">Explore Our Services</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(SERVICE_LINKS[post.category?.toUpperCase()] || SERVICE_LINKS['DEFAULT']).map((service, i) => (
                                <Link
                                    key={i}
                                    href={service.href}
                                    className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-[#c5a059]/40 transition-all"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors mb-2">{service.title}</p>
                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{service.desc}</p>
                                    <span className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest mt-3 block">Learn More →</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
