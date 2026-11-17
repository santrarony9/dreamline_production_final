import Image from "next/image";

function resolvePartnerImage(rawUrl) {
    if (!rawUrl) return null;
    // Normalize broken dreamlineproduction.com/uploads/ to local or backend path
    if (rawUrl.includes('/uploads/')) {
        const filename = rawUrl.split('/uploads/').pop();
        return `/uploads/${filename}`;
    }
    return rawUrl;
}

export default function Partners({ partners = [] }) {
    if (!partners || partners.length === 0) return null;

    // Duplicate partners for infinite scroll effect
    const displayPartners = [...partners, ...partners, ...partners];

    return (
        <section className="py-12 bg-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 mb-12">
                <h2 className="text-[10px] uppercase font-black text-[#c5a059] tracking-[0.5em] mb-4 text-center">
                    Trusted By Industry Leaders
                </h2>
            </div>

            <div className="relative flex overflow-hidden">
                {/* Pure CSS animation instead of framer-motion to reduce JS bundle */}
                <div className="brand-track flex whitespace-nowrap gap-12 items-center" style={{ animationDuration: '60s' }}>
                    {displayPartners.map((partner, i) => {
                        const imageSrc = resolvePartnerImage(partner.image);
                        return (
                            <div
                                key={i}
                                className="flex-shrink-0 flex flex-col items-center group"
                            >
                                <div className="h-12 sm:h-16 w-32 sm:w-48 relative flex items-center justify-center transition-all duration-500 opacity-60 group-hover:opacity-100 transform group-hover:scale-110">
                                    {imageSrc ? (
                                        <Image
                                            src={imageSrc}
                                            alt={`${partner.name} brand client logo - Dreamline Production partner`}
                                            fill
                                            sizes="(max-width: 640px) 128px, 192px"
                                            className="object-contain"
                                        />
                                    ) : (
                                        <span className="text-white/40 font-black uppercase text-[10px] tracking-widest text-center">
                                            {partner.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Gradient Overlays for smooth fade */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            </div>
        </section>
    );
}
