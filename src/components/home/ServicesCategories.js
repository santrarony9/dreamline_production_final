export default function ServicesCategories({ services }) {
    return (
        <section id="services" className="py-16 md:py-32 bg-black text-white border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-24 gap-6">
                    <h2 className="font-heading text-5xl md:text-7xl font-black">SERVICES<br /><span className="text-[#c5a059]">CATEGORIES</span></h2>
                    <p className="max-w-xs text-gray-500 text-sm uppercase tracking-widest leading-loose">Specialized divisions catering to elite clientele across Bengal and beyond.</p>
                </div>

                <div className="space-y-4">
                    {(services && services.length > 0 ? services : [
                        { number: "01", title: "WEDDING CINEMA", priceHint: "Premium Packages Start at ₹85,000" },
                        { number: "02", title: "COMMERCIAL ADS", priceHint: "Full Production & Scripting" },
                        { number: "03", title: "CORPORATE EVENTS", priceHint: "Summits • Expos • Launches" },
                        { number: "04", title: "MUSIC VIDEOS", priceHint: "4K Narrative Visualization" },
                        { number: "05", title: "SOCIAL MEDIA", priceHint: "Reels • Portfolios • Branding" }
                    ]).map((srv, i) => (
                        <div key={i} className="reveal border-t border-white/10 py-8 md:py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                            <div className="flex items-center gap-4 md:gap-10">
                                <span className="text-gray-600 font-heading text-xl">{srv.number}</span>
                                <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text uppercase">{srv.title}</h3>
                            </div>
                            <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-[#c5a059] uppercase font-bold">{srv.priceHint}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

