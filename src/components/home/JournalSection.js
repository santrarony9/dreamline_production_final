"use client";
import Image from "next/image";
import Link from "next/link";

export default function JournalSection({ journals = [] }) {
    return (
        <section className="py-20 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div className="max-w-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">
                            LATEST INSIGHTS
                        </p>
                        <h2 className="font-heading text-4xl md:text-6xl font-black text-white italic leading-tight">
                            The <span className="text-[#c5a059]">Journal.</span>
                        </h2>
                    </div>
                    <Link
                        href="/blogs"
                        className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] border-b border-[#c5a059] pb-2 hover:text-white hover:border-white transition-all interactive flex-shrink-0"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {journals.map((post, index) => (
                        <article key={index} className="group interactive">
                            <Link href={`/blogs/${post.id || post.slug || post._id}`} className="block overflow-hidden rounded-2xl mb-5 aspect-video relative">
                                <Image
                                    src={post.image || "/logo-banner.jpg"}
                                    alt={post.title}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </Link>
                            <div className="flex gap-4 mb-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                                <span className="text-[#c5a059]">•</span>
                                <span>{post.category || "Journal"}</span>
                            </div>
                            <h3 className="font-heading text-2xl font-black text-white italic uppercase leading-tight mb-3 group-hover:text-[#c5a059] transition-colors">
                                <Link href={`/blogs/${post.id || post.slug || post._id}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {post.excerpt}
                            </p>
                            <Link
                                href={`/blogs/${post.id || post.slug || post._id}`}
                                className="inline-block mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors"
                            >
                                Read More &rarr;
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
