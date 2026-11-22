import Link from 'next/link';

export const metadata = {
    title: '404 — Page Not Found',
    description: 'The page you are looking for does not exist. Return to Dreamline Production homepage.',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    const popularLinks = [
        { href: '/luxury', label: 'Luxury Weddings' },
        { href: '/commercial', label: 'Commercial Films' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/blogs', label: 'Blog' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6 py-24">
            <div className="text-center max-w-2xl mx-auto">

                {/* 404 number — cinematic style */}
                <div className="relative mb-8 select-none">
                    <span
                        className="font-heading text-[20vw] sm:text-[12rem] font-black text-white/[0.03] leading-none block"
                        aria-hidden="true"
                    >
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase">
                            404
                        </span>
                    </div>
                </div>

                {/* Gold label */}
                <p className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.5em] mb-6">
                    Scene Not Found
                </p>

                {/* Headline */}
                <h1 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                    This Frame<br />
                    <span className="text-white/20">Doesn&apos;t Exist.</span>
                </h1>

                {/* Description */}
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-12 max-w-md mx-auto">
                    The page you&apos;re looking for has been moved, deleted, or never existed.
                    Let&apos;s get you back to something beautiful.
                </p>

                {/* Primary CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <Link
                        href="/"
                        className="min-w-[200px] px-10 py-4 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/contact"
                        className="min-w-[200px] px-10 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-500"
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Popular links */}
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">
                        Popular Pages
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {popularLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/10 px-5 py-2.5 rounded-full hover:border-[#c5a059]/50 hover:text-[#c5a059] transition-all duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Thin gold divider line */}
                <div className="w-24 h-[1px] bg-[#c5a059]/30 mx-auto mt-16" />
                <p className="text-white/20 text-[9px] uppercase tracking-widest mt-4 font-black">
                    Dreamline Production © {new Date().getFullYear()}
                </p>

            </div>
        </main>
    );
}
