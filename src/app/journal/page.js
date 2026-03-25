export const revalidate = 3600; // Revalidate every hour
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";
import Link from "next/link";

export default async function JournalPage() {
    await dbConnect();
    const journals = await Journal.find().sort({ date: -1 }).lean();

    return (
        <main className="bg-black pt-32 min-h-screen">
            <section className="container mx-auto px-6 mb-20 text-center">
                <h1 className="font-heading text-6xl md:text-8xl font-black mb-8 uppercase text-white">
                    The <span className="text-[#c5a059]">Journal.</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Stories, insights, and technical breakdowns from the heart of Dreamline Production. Explore our deep dives into cinematic excellence.
                </p>
            </section>

            <section className="container mx-auto px-6 pb-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {journals.length === 0 ? (
                        <p className="text-gray-500 text-center col-span-full py-20 uppercase tracking-widest text-[10px] font-bold">
                            No journal entries found.
                        </p>
                    ) : (
                        journals.map((post) => (
                            <article key={post._id.toString()} className="blog-card rounded-3xl group interactive">
                                <Link href={`/journal/${post._id.toString()}`} className="block h-full">
                                    <div className="h-64 overflow-hidden relative">
                                        <img
                                            src={post.image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800"}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={post.title}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                            <span>{new Date(post.date).toLocaleDateString()}</span>
                                            <span className="text-[#c5a059]">{post.category || "Insight"}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 group-hover:text-[#c5a059] transition-colors leading-tight text-white">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-6 font-light line-clamp-3">
                                            {post.excerpt || "Dive into the details of our latest cinematic endeavor..."}
                                        </p>
                                        <span className="text-xs font-black uppercase tracking-widest border-b-2 border-[#c5a059] pb-1 text-[#c5a059]">
                                            Read Insight
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
