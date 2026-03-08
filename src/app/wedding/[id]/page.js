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
                images: wedding.coverImage || wedding.img ? [{ url: wedding.coverImage || wedding.img, width: 1200, height: 630 }] : [],
                type: "video.movie",
            },
            twitter: {
                card: "summary_large_image",
                title: `${wedding.title} | Cinematic Wedding Film`,
                description: wedding.description || "A breathtaking luxury wedding documented by Dreamline Production.",
                images: wedding.coverImage || wedding.img ? [wedding.coverImage || wedding.img] : [],
            }
        };
    } catch (e) {
        return {};
    }
}

// Helper function to extract Vimeo/YouTube ID
function getEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('vimeo')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0&title=0&byline=0&portrait=0` : null;
    }
    if (url.includes('youtube') || url.includes('youtu.be')) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
    }
    return url; // fallback
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

    // Collect all images from chapters or use fallbacks to ensure 12-25 images
    let allImages = [];
    if (wedding.storyChapters && wedding.storyChapters.length > 0) {
        wedding.storyChapters.forEach(chapter => {
            if (chapter.images) allImages = allImages.concat(chapter.images);
        });
    }

    // Fallback images if database is sparse
    if (allImages.length < 12) {
        const fallbacks = [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1456561177426-ab0e2fb1cc62?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1516196238356-d4191feeb59c?auto=format&fit=crop&w=1200",
            "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1200"
        ];
        allImages = [...allImages, ...fallbacks].slice(0, 15); // guarantee at least 15 images
    }

    const embedUrl = getEmbedUrl(wedding.videoUrl);

    return (
        <main className="bg-black pt-32 min-h-screen">
            {/* Header Section */}
            <section className="container mx-auto px-6 mb-16 text-center">
                <Link href="/luxury" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#c5a059] transition-colors mb-10 group interactive">
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Heritage Collection
                </Link>
                <div className="max-w-4xl mx-auto">
                    <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Cinematic Story</span>
                    <h1 className="font-heading text-4xl md:text-7xl font-black mb-6 leading-none text-white uppercase tracking-tighter">
                        {wedding.title}
                    </h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-10">
                        {wedding.location || "Kolkata, India"} • {wedding.date ? new Date(wedding.date).getFullYear() : "2024"}
                    </p>
                    <p className="text-gray-300 leading-relaxed text-lg italic max-w-2xl mx-auto">
                        "{wedding.description || "Every frame of this film was crafted to reflect the timeless elegance and deep cultural roots of this heritage celebration."}"
                    </p>
                </div>
            </section>

            {/* Contained Video Player */}
            <section className="container mx-auto px-6 mb-32">
                <div className="max-w-6xl mx-auto aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 interactive group relative">
                            <img src={wedding.coverImage || wedding.img || allImages[0]} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Video Placeholder" />
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 z-10">
                                <span className="text-white text-xs font-black tracking-widest uppercase">Play</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Massive Masonry Gallery */}
            <section className="container mx-auto px-6 pb-32">
                <div className="mb-16 flex flex-col items-center">
                    <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-4">The <span className="text-[#c5a059]">Gallery.</span></h2>
                    <div className="w-12 h-1 bg-[#c5a059] rounded-full"></div>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {allImages.map((img, index) => (
                        <div key={index} className="break-inside-avoid rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-white/5 bg-zinc-900 group">
                            <img src={img} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" alt={`Wedding Capture ${index + 1}`} loading="lazy" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Review Section */}
            {wedding.reviews && wedding.reviews.length > 0 && (
                <section className="py-32 bg-[#080808] border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="flex justify-center mb-8 gap-1">
                            {[...Array(wedding.reviews[0].rating || 5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-[#c5a059]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            ))}
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed mb-10">
                            "{wedding.reviews[0].text}"
                        </p>
                        <p className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-sm">
                            — {wedding.reviews[0].author || "The Happy Couple"}
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
