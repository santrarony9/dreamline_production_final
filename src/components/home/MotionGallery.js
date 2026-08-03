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

    const displayImages = images && images.length > 0 ? images : defaultImages;
    // The original code used scrollingImages, but the edit implies using displayImages directly and duplicating it in JSX.
    // Let's keep the original scrollingImages logic for consistency with the infinite scroll effect.
    const scrollingImages = [...displayImages, ...displayImages];

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

            <div className="relative w-full">
                <div className="flex md:animate-scroll-left hover:pause overflow-x-auto md:overflow-hidden snap-x snap-mandatory hide-scrollbar pb-8 md:pb-0 px-6 md:px-0">
                    {displayImages.map((src, i) => (
                        <div key={i} className="flex-shrink-0 w-[280px] md:w-80 h-[350px] md:h-96 mr-4 md:mx-4 rounded-3xl overflow-hidden relative group snap-center">
                            <Image 
                                src={src} 
                                alt={`Cinematic wedding photography Kolkata ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 280px, 320px"
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 md:scale-110 md:group-hover:scale-100" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                    {/* Duplicate for infinite effect on desktop */}
                    <div className="hidden md:flex">
                        {displayImages.map((src, i) => (
                            <div key={`dup-${i}`} className="flex-shrink-0 w-80 h-96 mx-4 rounded-3xl overflow-hidden relative group border border-white/5">
                                <Image 
                                    src={src} 
                                    alt={`Wedding cinematography portfolio Kolkata ${i + 1}`}
                                    fill
                                    sizes="320px"
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile swipe hint */}
                <div className="flex md:hidden items-center justify-center gap-2 mt-4 opacity-40">
                    <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Swipe to explore</span>
                    <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
