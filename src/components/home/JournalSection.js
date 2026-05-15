"use client";
import Image from "next/image";
import Link from "next/link";

export default function JournalSection({ journals = [] }) {
    return (
        <section className="py-20 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div className="max-w-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">
                            LATEST INSIGHTS
                        </p>
                        <h2 className="font-heading text-4xl md:text-6xl font-black text-white italic leading-tight">
                            The <span className="text-[#c5a059]">Journal.</span>
                        </h2>
                    </div>
                    <Link
                        href="/journal"
                        className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] border-b border-[#c5a059] pb-2 hover:text-white hover:border-white transition-all interactive"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {journals.map((post, index) => (
                        <article key={index} className="group interactive">
                            <Link href={`/journal/${post.id}`} className="block overflow-hidden rounded-2xl mb-5 aspect-video relative">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </Link>
                            <div className="flex gap-4 mb-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <span>{post.date && !isNaN(new Date(post.date).getTime()) ? new Date(post.date).toLocaleDateString() : "Latest Story"}</span>
                                <span className="text-[#c5a059]">•</span>
                                <span>{post.category}</span>
                            </div>
                            <h3 className="font-heading text-xl font-black text-white hover:text-[#c5a059] transition-colors mb-4 uppercase leading-tight">
                                <Link href={`/journal/${post.id}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-gray-500 text-[13px] leading-relaxed mb-6 line-clamp-2">
                                {post.excerpt}
                            </p>
                            <Link
                                href={`/journal/${post.id}`}
                                className="inline-flex items-center gap-3 group/btn"
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-white group-hover/btn:text-[#c5a059] transition-colors">
                                    Read Insight
                                </span>
                                <div className="w-6 h-[1px] bg-white/20 group-hover/btn:w-10 group-hover/btn:bg-[#c5a059] transition-all" />
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
