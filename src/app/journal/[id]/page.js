export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function JournalDetailPage({ params }) {
    const { id } = params;
    await dbConnect();

    let post;
    try {
        post = await Journal.findById(id).lean();
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
                <img
                    src={post.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200"}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    alt={post.title}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black"></div>
            </section>

            <section className="container mx-auto px-6 pb-32">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="prose prose-invert prose-gold max-w-none text-gray-300 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-6">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Share this story</span>
                            {/* Social Share Placeholders */}
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
