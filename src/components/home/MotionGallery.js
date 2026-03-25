import Image from "next/image";

export default function MotionGallery({ images }) {
    const defaultImages = [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800"
    ];

    const displayImages = images && images.length > 0 ? images : defaultImages;
    const scrollingImages = [...displayImages, ...displayImages];

    return (
        <section className="py-32 bg-[#050505] overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 mb-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-4">
                    THE MOTION
                </p>
                <h2 className="font-heading text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter">
                    Archive.
                </h2>
            </div>

            <div className="relative">
                <div className="flex gap-8 animate-brand-glide hover:[animation-play-state:paused] cursor-pointer">
                    {scrollingImages.map((src, index) => (
                        <div
                            key={index}
                            className="w-[85vw] md:w-[450px] flex-shrink-0 aspect-[16/10] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 border border-white/10 relative"
                        >
                            <Image
                                src={src}
                                alt={`Motion archive frame ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 85vw, 450px"
                                className="object-cover hover:scale-110 transition-transform duration-[2s]"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
