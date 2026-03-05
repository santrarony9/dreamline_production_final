"use client";
export default function MasterGallery({ images = [] }) {
    // Fallback images if none provided from global content
    const defaultImages = [
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1772417032378-b2770244f256ecaa93033b1d-Untitled_design__5_.webp",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1772417043885-3367fab3cee6eebf3ffbb0b6-Untitled_design__4_.webp",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668025915-KSR839_Cover.webp",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668027519-KSR1091_Cover.webp",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800",
        "https://dreamlinepro.s3.ap-south-2.amazonaws.com/uploads/1771668028776-KSR1440_Cover.webp",
    ];

    const displayImages = images && images.length >= 6 ? images : defaultImages;

    // Split images into 3 columns for the vertical slider effect
    const col1 = displayImages.filter((_, i) => i % 3 === 0);
    const col2 = displayImages.filter((_, i) => i % 3 === 1);
    const col3 = displayImages.filter((_, i) => i % 3 === 2);

    // Double up arrays to make the CSS scrolling seamless
    const getSeamlessArray = (arr) => [...arr, ...arr, ...arr];

    return (
        <section className="bg-[#050505] border-t border-white/5 py-32 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 mb-20 relative z-10">
                <h2 className="font-heading text-5xl md:text-7xl lg:text-[100px] font-black uppercase tracking-tighter leading-[0.85] mb-6">
                    MASTER<br /><span className="text-[#c5a059]">GALLERY.</span>
                </h2>
                <p className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.2em] max-w-xl">
                    A MULTI-DIMENSIONAL ARCHIVE OF EMOTION, LIGHT, AND MOTION.
                </p>
            </div>

            {/* Vertical Scroll Tracks */}
            <div className="h-[70vh] flex gap-4 md:gap-6 px-6 md:px-12 mt-16 group relative">
                {/* Gradient Fades for Top/Bottom */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none"></div>

                {/* Column 1 - Tracks Up */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col1).map((src, i) => (
                            <div key={`c1-${i}`} className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0">
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2 - Tracks Down */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden pt-20">
                    <div className="flex flex-col gap-4 v-track-down group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col2).map((src, i) => (
                            <div key={`c2-${i}`} className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0">
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3 - Tracks Up (Hidden on Mobile) */}
                <div className="hidden md:flex flex-1 flex-col gap-4 overflow-hidden pt-10">
                    <div className="flex flex-col gap-4 v-track-up group-hover:[animation-play-state:paused] whitespace-nowrap">
                        {getSeamlessArray(col3).map((src, i) => (
                            <div key={`c3-${i}`} className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative interactive premium-card flex-shrink-0">
                                <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" alt="Gallery Frame" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
