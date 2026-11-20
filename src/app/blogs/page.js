export const dynamic = 'force-dynamic';
export const revalidate = 0;
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import Link from "next/link";
import Image from "next/image";
import StructuredData from "@/components/seo/StructuredData";

export async function generateMetadata() {
    return {
        title: "Photography Journal & Stories | Dreamline Production",
        description: "Explore photography tips, behind-the-scenes stories, and cinematic insights from Dreamline Production — Kolkata's premier photography and film production studio.",
        alternates: {
            canonical: 'https://dreamlineproduction.com/blogs/',
        },
        openGraph: {
            title: "Photography Journal & Stories | Dreamline Production",
            description: "Explore photography tips, behind-the-scenes stories, and cinematic insights from Dreamline Production — Kolkata's premier photography and film production studio.",
            url: 'https://dreamlineproduction.com/blogs/',
            siteName: 'Dreamline Production',
            locale: 'en_IN',
            type: 'website',
            images: [{ url: '/logo-banner.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: "Photography Journal & Stories | Dreamline Production",
            description: "Explore photography tips, behind-the-scenes stories, and cinematic insights from Dreamline Production — Kolkata's premier photography and film production studio.",
            images: ['/logo-banner.png'],
        },
    };
}

export default async function JournalPage() {
    await dbConnect();
    
    // Get today's date in IST format (YYYY-MM-DD)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().split('T')[0];

    // Only show published posts (never drafts) that have a date <= today or no date set
    const journals = await Journal.find({
        $and: [
            {
                $or: [
                    { status: 'published' },
                    { status: { $exists: false } },
                    { status: null }
                ]
            },
            {
                $or: [
                    { date: { $lte: todayStr } },
                    { date: null },
                    { date: "" },
                    { date: { $exists: false } }
                ]
            }
        ]
    }).sort({ date: -1, createdAt: -1 }).lean();

    const blogsPageSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": "https://dreamlineproduction.com/blogs/",
                "url": "https://dreamlineproduction.com/blogs/",
                "name": "Photography Journal & Stories | Dreamline Production",
                "description": "Explore photography tips, behind-the-scenes stories, and cinematic insights from Dreamline Production — Kolkata's premier photography and film production studio.",
                "isPartOf": { "@id": "https://dreamlineproduction.com/#website" },
                "inLanguage": "en-IN",
                "breadcrumb": { "@id": "https://dreamlineproduction.com/blogs/#breadcrumb" }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://dreamlineproduction.com/blogs/#breadcrumb",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com/" },
                    { "@type": "ListItem", "position": 2, "name": "Blogs", "item": "https://dreamlineproduction.com/blogs/" }
                ]
            }
        ]
    };

    return (
        <>
        <StructuredData data={blogsPageSchema} />
        <main className="page-main">
            <section className="page-hero-section text-center">
                <nav aria-label="Breadcrumb" className="page-breadcrumb justify-center">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span className="current">Blogs</span>
                </nav>
                <div className="max-w-4xl mx-auto">
                    <span className="page-category-label">
                        Insights &amp; Stories
                    </span>
                    <h1 className="page-hero-title mx-auto">
                        The <span className="text-[#c5a059]">Journal.</span>
                    </h1>
                    <p className="page-hero-desc mx-auto">
                        Stories, insights, and technical breakdowns from the heart of Dreamline Production. Explore our deep dives into cinematic excellence.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-6 pb-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {journals.length === 0 ? (
                        <p className="text-gray-500 text-center col-span-full py-20 uppercase tracking-widest text-[10px] font-bold">
                            No journal entries found.
                        </p>
                    ) : (
                        journals.map((post) => {
                            const postSlug = post.slug || post.id || post._id.toString();
                            const postUrl = `/blogs/${postSlug}/`;
                            const displayDate = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                            return (
                                <article key={post._id.toString()} className="blog-card rounded-3xl group interactive bg-[#0a0a0a] border border-white/5 hover:border-[#c5a059]/40 transition-all overflow-hidden flex flex-col">
                                    <Link href={postUrl} className="block overflow-hidden">
                                        <div className="h-64 overflow-hidden relative">
                                            <Image
                                                src={post.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800"}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                alt={post.featuredImageAlt || post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                    </Link>
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                                {displayDate && <span>{displayDate}</span>}
                                                <span className="text-[#c5a059]">{post.category || "Insight"}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold mb-4 group-hover:text-[#c5a059] transition-colors leading-tight text-white">
                                                <Link href={postUrl}>
                                                    {post.title}
                                                </Link>
                                            </h2>
                                            {post.subtitle && (
                                                <p className="text-xs text-[#c5a059]/80 mb-3 font-semibold uppercase tracking-wider">
                                                    {post.subtitle}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-400 mb-6 font-light line-clamp-3 leading-relaxed">
                                                {post.excerpt || "Dive into the details of our latest cinematic endeavor..."}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <Link href={postUrl} className="text-xs font-black uppercase tracking-widest text-[#c5a059] group-hover:text-white transition-colors flex items-center gap-2">
                                                <span>Read Insight</span>
                                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                            </Link>
                                            {post.author?.name && (
                                                <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                                                    By {post.author.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </section>
        </main>
        </>
    );
}
