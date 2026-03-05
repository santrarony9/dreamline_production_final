export default function ServicesCategories() {
    return (
        <section id="services" className="py-32 bg-black text-white border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6">
                    <h2 className="font-heading text-5xl md:text-7xl font-black">SERVICES<br /><span className="text-[#c5a059]">CATEGORIES</span></h2>
                    <p className="max-w-xs text-gray-500 text-sm uppercase tracking-widest leading-loose">Specialized divisions catering to elite clientele across Bengal and beyond.</p>
                </div>

                <div className="space-y-4">
                    {/* 01 Wedding */}
                    <div className="reveal border-t border-white/10 py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-10">
                            <span className="text-gray-600 font-heading text-xl">01</span>
                            <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text">WEDDING CINEMA</h3>
                        </div>
                        <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-[#c5a059] uppercase font-bold">Premium Packages Start at ₹85,000</p>
                        </div>
                    </div>
                    {/* 02 Commercial */}
                    <div className="reveal border-t border-white/10 py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-10">
                            <span className="text-gray-600 font-heading text-xl">02</span>
                            <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text">COMMERCIAL ADS</h3>
                        </div>
                        <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity text-right">
                            <p className="text-xs text-[#c5a059] uppercase font-bold">Full Production & Scripting</p>
                        </div>
                    </div>
                    {/* 03 Events */}
                    <div className="reveal border-t border-white/10 py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-10">
                            <span className="text-gray-600 font-heading text-xl">03</span>
                            <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text">CORPORATE EVENTS</h3>
                        </div>
                        <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-[#c5a059] uppercase font-bold">Summits • Expos • Launches</p>
                        </div>
                    </div>
                    {/* 04 Music Album */}
                    <div className="reveal border-t border-white/10 py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-10">
                            <span className="text-gray-600 font-heading text-xl">04</span>
                            <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text">MUSIC VIDEOS</h3>
                        </div>
                        <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-[#c5a059] uppercase font-bold">4K Narrative Visualization</p>
                        </div>
                    </div>
                    {/* 05 Social */}
                    <div className="reveal border-t border-white/10 py-16 flex flex-col md:flex-row justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-10">
                            <span className="text-gray-600 font-heading text-xl">05</span>
                            <h3 className="font-heading text-3xl md:text-5xl group-hover:translate-x-4 transition-transform mask-text">SOCIAL MEDIA</h3>
                        </div>
                        <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-[#c5a059] uppercase font-bold">Reels • Portfolios • Branding</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
