export default function Hero({ content }) {
    const { titleLine1, titleLine2, subtitle, backgroundImage } = content || {};

    return (
        <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/50 z-10" />
                {backgroundImage && backgroundImage.endsWith('.mp4') ? (
                    <video
                        src={backgroundImage}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover scale-110"
                    />
                ) : backgroundImage ? (
                    <img
                        src={backgroundImage}
                        alt="Hero Background"
                        className="h-full w-full object-cover scale-110"
                    />
                ) : null}
            </div>

            <div className="container mx-auto px-6 relative z-20 text-center">
                <div className="overflow-hidden mb-4">
                    <p className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-[#c5a059] animate-fade-up">
                        {subtitle || "EST. 2010 • DREAMLINE PRODUCTION"}
                    </p>
                </div>

                <h1 className="font-heading text-4xl sm:text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter mb-12 uppercase">
                    <span className="block reveal-text">
                        <span className="reveal-inner inline-block">{titleLine1 || "VISIONARY"}</span>
                    </span>
                    <span className="block italic text-outline reveal-text">
                        <span className="reveal-inner inline-block">{titleLine2 || "CINEMA."}</span>
                    </span>
                </h1>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <button className="px-10 py-5 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive">
                        Explore Weddings
                    </button>
                    <button className="px-10 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all transform hover:-translate-y-1 interactive">
                        Commercial Works
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <div className="w-[1px] h-20 bg-gradient-to-t from-[#c5a059] to-transparent" />
            </div>
        </section>
    );
}
