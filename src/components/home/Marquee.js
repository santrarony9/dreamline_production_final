export default function Marquee({ items }) {
    const defaultItems = [
        'LUXURY WEDDINGS', 'ADVERTISING', 'MUSIC CINEMA', 'CORPORATE NARRATIVES',
        'LUXURY WEDDINGS', 'ADVERTISING', 'MUSIC CINEMA', 'CORPORATE NARRATIVES'
    ];

    const displayItems = items && items.length > 0 ? items : defaultItems;

    return (
        <section className="bg-[#151515] border-y border-white/5 py-6 overflow-hidden">
            <div className="marquee">
                <div className="marquee-inner">
                    {displayItems.map((item, index) => (
                        <span
                            key={index}
                            className={`font-heading font-bold text-3xl md:text-4xl whitespace-nowrap ${index % 2 === 0 ? 'text-white opacity-30 hover:opacity-100 transition-opacity' : 'text-[#c5a059]'
                                }`}
                        >
                            {item}
                        </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {displayItems.map((item, index) => (
                        <span
                            key={`dup-${index}`}
                            className={`font-heading font-bold text-3xl md:text-4xl whitespace-nowrap ${index % 2 === 0 ? 'text-white opacity-30 hover:opacity-100 transition-opacity' : 'text-[#c5a059]'
                                }`}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
