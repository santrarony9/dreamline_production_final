export default function QuoteSection() {
    return (
        <section
            className="relative py-40 md:py-60 flex items-center justify-center border-t border-white/5 bg-center bg-cover bg-no-repeat"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80")'
            }}
        >
            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <h2 className="font-heading text-4xl md:text-6xl lg:text-[80px] font-black text-white italic leading-[1.1] max-w-7xl mx-auto drop-shadow-2xl">
                    "We don't take pictures with a camera. We bring to the act of photography all the books we have read, the movies we have seen, the music we have heard."
                </h2>
            </div>
        </section>
    );
}
