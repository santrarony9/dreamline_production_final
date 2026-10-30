import Image from "next/image";

export default function MotionGallery({ 
    images = [], 
    title = "The Motion", 
    subtitle = "Archive.", 
    description = "15+ Years of Frames" 
}) {
    const defaultImages = [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=800"
    ];

    const baseImages = images && images.length > 0 ? images : defaultImages;

    // Ensure at least 6 images in the base sequence so wide screens remain seamlessly filled
    let trackList = [...baseImages];
    while (trackList.length < 6) {
        trackList = [...trackList, ...baseImages];
    }

    // Exact 2x duplicate for seamless infinite -50% translateX loop
    const scrollingImages = [...trackList, ...trackList];

    return (
        <section className="py-16 md:py-32 bg-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="max-w-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-6">
                        {title}
                    </p>
                    <h2 className="font-heading text-5xl md:text-8xl font-black text-white uppercase italic leading-[0.9]">
                        {subtitle}
                    </h2>
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-4">
                    {description}
                </p>
            </div>

            <div className="relative w-full overflow-hidden select-none">
                <div className="flex w-max animate-scroll-left hover:[animation-play-state:paused] active:[animation-play-state:paused]">
                    {scrollingImages.map((src, i) => (
                        <div 
                            key={i} 
                            className="flex-shrink-0 w-[280px] md:w-80 h-[350px] md:h-96 mx-3 md:mx-4 rounded-3xl overflow-hidden relative group border border-white/5 cursor-pointer bg-neutral-950"
                        >
                            <Image 
                                src={src} 
                                alt={`Cinematic wedding photography Kolkata ${(i % trackList.length) + 1}`}
                                fill
                                sizes="(max-width: 768px) 280px, 320px"
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 md:scale-105 md:group-hover:scale-100" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
