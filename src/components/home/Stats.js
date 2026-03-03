export default function Stats({ stats }) {
    const defaultStats = [
        { value: "15+", label: "YEARS OF EXCELLENCE" },
        { value: "500+", label: "WEDDINGS CAPTURED" },
        { value: "150+", label: "GOOGLE REVIEWS" },
        { value: "24/7", label: "CREATIVE DEDICATION" }
    ];

    const displayStats = stats && stats.length > 0 ? stats : defaultStats;

    return (
        <section className="py-24 bg-[#050505]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {displayStats.map((stat, index) => (
                        <div key={index} className="border-l border-white/10 pl-8 py-4 group">
                            <div className="text-[#c5a059] font-heading text-5xl font-black mb-2 group-hover:scale-110 transition-transform origin-left">
                                {stat.value}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
