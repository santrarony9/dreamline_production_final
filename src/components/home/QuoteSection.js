export default function QuoteSection() {
    return (
        <section className="relative py-40 flex items-center justify-center overflow-hidden border-t border-white/5">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80"
                    alt="Wedding Scene"
                    className="w-full h-full object-cover filter brightness-[0.3]"
                />
                <div className="absolute inset-0 bg-black/50 mix-blend-multiply"></div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black text-white italic leading-tight max-w-5xl mx-auto shadow-sm">
                    "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard."
                </h2>
                <div className="w-24 h-1 bg-[#c5a059] mx-auto mt-12 rounded-full"></div>
            </div>
        </section>
    );
}
