'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-6">
            <div className="text-center max-w-lg">
                <p className="text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                    Production Halted
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8">
                    Something went wrong.
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                    We've encountered an unexpected issue while setting up the scene. Let's get you back on track.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-8 py-4 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-300"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
