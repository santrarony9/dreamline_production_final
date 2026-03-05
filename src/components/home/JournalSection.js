"use client";

import Link from "next/link";

export default function JournalSection({ journals = [] }) {
    return (
        <section className="py-32 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-20">
                    <div className="max-w-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">
                            LATEST INSIGHTS
                        </p>
                        <h2 className="font-heading text-5xl md:text-7xl font-black text-white italic leading-tight">
                            The <span className="text-[#c5a059]">Journal.</span>
                        </h2>
                    </div>
                    <Link
                        href="/journal"
                        className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] border-b border-[#c5a059] pb-2 hover:text-white hover:border-white transition-all interactive"
                    >
                        View All Stories
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {journals.map((post, index) => (
                        <article key={index} className="group interactive">
                            <Link href={`/journal/${post.id}`} className="block overflow-hidden rounded-3xl mb-8 aspect-[4/3]">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                />
                            </Link>
                            <div className="flex gap-4 mb-4 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <span>{post.date}</span>
                                <span className="text-[#c5a059]">•</span>
                                <span>{post.category}</span>
                            </div>
                            <h3 className="font-heading text-2xl font-black text-white hover:text-[#c5a059] transition-colors mb-6 uppercase leading-tight">
                                <Link href={`/journal/${post.id}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                                {post.excerpt}
                            </p>
                            <Link
                                href={`/journal/${post.id}`}
                                className="inline-flex items-center gap-3 group/btn"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover/btn:text-[#c5a059] transition-colors">
                                    Read Insight
                                </span>
                                <div className="w-8 h-[1px] bg-white/20 group-hover/btn:w-12 group-hover/btn:bg-[#c5a059] transition-all" />
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
