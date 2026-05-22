export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";

export async function generateMetadata({ params }) {
    await dbConnect();
    const { id } = await params;

    try {
        let post;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Journal.findById(id).lean();
        } else {
            post = await Journal.findOne({ id: id }).lean();
        }
        if (!post) return {};

        // Extract a short description from the HTML content if no plain description exists
        const plainTextDesc = post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'Read our latest insights on film and photography.';

        return {
            title: `${post.title} | Dreamline Production Kolkata`,
            description: post.excerpt || plainTextDesc,
            openGraph: {
                title: post.title,
                description: plainTextDesc,
                images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
                type: "article",
                publishedTime: post.date,
            },
            twitter: {
                card: "summary_large_image",
                title: post.title,
                description: plainTextDesc,
                images: post.image ? [post.image] : [],
            }
        };
    } catch (e) {
        return {};
    }
}

export default async function JournalDetailPage({ params }) {
    const { id } = await params;
    await dbConnect();

    let post;
    try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Journal.findById(id).lean();
        } else {
            post = await Journal.findOne({ id: id }).lean();
        }
    } catch (err) {
        return notFound();
    }

    if (!post) return notFound();

    return (
        <main className="bg-black pt-32 min-h-screen">
            <section className="container mx-auto px-6 mb-16">
                <Link href="/journal" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#c5a059] transition-colors mb-10 group interactive">
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Journal
                </Link>

                <div className="max-w-4xl">
                    <div className="flex gap-4 mb-6 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                        <span className="text-[#c5a059]">{post.category || "Insight"}</span>
                    </div>
                    <h1 className="font-heading text-4xl md:text-6xl font-black mb-12 leading-tight text-white uppercase">
                        {post.title}
                    </h1>
                </div>
            </section>

            <section className="w-full h-[60vh] relative mb-16 overflow-hidden">
                <Image
                    src={post.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200"}
                    fill
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    alt={post.title}
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black"></div>
            </section>

            <section className="container mx-auto px-6 pb-32">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="prose prose-invert prose-gold max-w-none text-gray-300 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                    />

                    <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-6 items-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share this story</span>
                            <div className="flex gap-4">
                                <a 
                                    href={`https://www.facebook.com/sharer/sharer.php?u=https://dreamlineproduction.com/journal/${id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a 
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://dreamlineproduction.com/journal/${id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </a>
                                <a 
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=https://dreamlineproduction.com/journal/${id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </a>
                            </div>
                        </div>
                        <Link href="/contact" className="text-[#c5a059] font-black uppercase tracking-widest text-xs border-b-2 border-[#c5a059] pb-1 interactive">
                            Work with us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
