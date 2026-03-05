export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import { notFound } from "next/navigation";
import Link from "next/link";
import VideoModal from "@/components/VideoModal";

export async function generateMetadata({ params }) {
    await dbConnect();
    const { id } = params;

    try {
        const wedding = await Wedding.findById(id).lean();
        if (!wedding) return {};

        return {
            title: `${wedding.title} | Luxury Wedding Film`,
            description: wedding.description || `Cinematic wedding film from ${wedding.location || 'Dreamline Production'}`,
            openGraph: {
                title: `${wedding.title} | Cinematic Wedding Film`,
                description: wedding.description || "A breathtaking luxury wedding documented by Dreamline Production.",
                images: wedding.img ? [{ url: wedding.img, width: 1200, height: 630 }] : [],
                type: "video.movie",
            },
            twitter: {
                card: "summary_large_image",
                title: `${wedding.title} | Cinematic Wedding Film`,
                description: wedding.description || "A breathtaking luxury wedding documented by Dreamline Production.",
                images: wedding.img ? [wedding.img] : [],
            }
        };
    } catch (e) {
        return {};
    }
}

export default async function WeddingDetailPage({ params }) {
    const { id } = params;
    await dbConnect();

    let wedding;
    try {
        wedding = await Wedding.findById(id).lean();
    } catch (err) {
        return notFound();
    }

    if (!wedding) return notFound();

    return (
        <main className="bg-black pt-32 min-h-screen">
            <section className="container mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end">
                <div className="max-w-4xl">
                    <Link href="/luxury" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#c5a059] transition-colors mb-10 group interactive">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Heritage Collection
                    </Link>
                    <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Cinematic Story</span>
                    <h1 className="font-heading text-4xl md:text-7xl font-black mb-4 leading-none text-white uppercase">
                        {wedding.title}
                    </h1>
                    <p className="text-gray-500 text-lg uppercase tracking-widest font-bold">
                        {wedding.location || "Kolkata, India"} • {new Date(wedding.date).getFullYear() || "2024"}
                    </p>
                </div>
                <div className="mt-8 md:mt-0">
                    {/* Global VideoModal is already in Layout, we just need to trigger it if we had client logic here */}
                    {/* For SSR, we just provide the visual trigger */}
                    <div className="p-8 bg-[#c5a059] text-black rounded-full font-black uppercase tracking-widest text-xs cursor-pointer hover:bg-white transition-colors interactive">
                        Play Film
                    </div>
                </div>
            </section>

            {/* Hero Video/Image */}
            <section className="w-full aspect-video md:aspect-[21/9] relative mb-24 overflow-hidden group interactive">
                <img
                    src={wedding.img || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600"}
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-2000"
                    alt={wedding.title}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>
            </section>

            {/* Narrative & Gallery */}
            <section className="container mx-auto px-6 pb-32">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <h2 className="font-heading text-2xl font-black mb-8 uppercase text-white">The Narrative</h2>
                        <p className="text-gray-400 leading-relaxed text-lg mb-8 italic">
                            {wedding.description || "Every frame of this film was crafted to reflect the timeless elegance and deep cultural roots of this heritage celebration."}
                        </p>
                        <div className="space-y-6 pt-8 border-t border-white/5 text-white">
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Director</h4>
                                <p className="font-bold">Rony Santra</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Cinematography</h4>
                                <p className="font-bold">Dreamline Collective</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Photography</h4>
                                <p className="font-bold">Team Dreamline</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-12">
                        {(wedding.gallery || [
                            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200",
                            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200",
                            "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200",
                            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200"
                        ]).map((img, index) => (
                            <div key={index} className="rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 aspect-[3/2] border border-white/5">
                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Review Section */}
            {wedding.review && (
                <section className="py-32 bg-[#080808] border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="flex justify-center mb-8 gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-[#c5a059]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            ))}
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed mb-10">
                            "{wedding.review}"
                        </p>
                        <p className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-sm">
                            — {wedding.clientNames || "The Happy Couple"}
                        </p>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-32 text-center bg-black border-t border-white/5">
                <h2 className="font-heading text-4xl md:text-5xl font-black mb-8 uppercase text-white">Ready for your <span className="text-[#c5a059]">Story?</span></h2>
                <Link href="/contact" className="inline-block bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 interactive">
                    Check Date
                </Link>
            </section>
        </main>
    );
}
