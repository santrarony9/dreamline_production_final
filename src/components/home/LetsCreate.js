import Link from 'next/link';
import Image from 'next/image';

export default function LetsCreate() {
    return (
        <section className="bg-[#050505] text-white border-t border-white/5 flex flex-col lg:flex-row">
            {/* Left Content */}
            <div className="flex-1 py-32 px-6 md:px-16 lg:px-24 flex flex-col justify-center">
                <p className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-[10px] mb-8">Ready For Action.</p>

                <h2 className="font-heading text-6xl md:text-8xl lg:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-20 drop-shadow-lg">
                    LET'S<br />CREATE.
                </h2>

                <div className="space-y-16">
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4">LOCATION</h4>
                        <address className="not-italic text-2xl md:text-3xl font-bold font-heading leading-snug">
                            85, Tilottama Plaza, First Floor<br />
                            Kolkata 700082, West Bengal
                        </address>
                    </div>

                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-4">INQUIRIES</h4>
                        <a href="tel:+918240054002" className="text-4xl md:text-5xl font-black font-heading hover:text-[#c5a059] transition-colors">
                            +91 82400 54002
                        </a>
                    </div>

                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] pt-8 border-t border-white/10">
                        <a href="#" className="hover:text-[#c5a059] transition-colors">INSTAGRAM</a>
                        <a href="#" className="hover:text-[#c5a059] transition-colors">YOUTUBE</a>
                        <a href="#" className="hover:text-[#c5a059] transition-colors">VIMEO</a>
                    </div>
                </div>
            </div>

            {/* Right Image Split */}
            <div className="flex-1 relative min-h-[500px] lg:min-h-screen">
                <div className="absolute inset-0 bg-black">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
                        alt="Studio Building"
                        className="w-full h-full object-cover grayscale opacity-60"
                    />
                </div>

                {/* Decorative Center Dot/Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center group">
                        <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm relative pointer-events-auto cursor-pointer hover:border-[#c5a059] hover:bg-[#c5a059]/10 transition-all">
                            <svg className="w-8 h-8 text-white group-hover:text-[#c5a059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <h3 className="font-heading font-black text-2xl uppercase tracking-tighter">VISIT THE SUITE</h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mt-2">APPOINTMENT ONLY</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
