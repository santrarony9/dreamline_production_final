'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error("[Admin Error Boundary Caught Exception]:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 text-white">
            <div className="max-w-lg w-full bg-[#0a0a0a] border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center space-y-6">
                <div className="w-14 h-14 bg-red-950/60 border border-red-500/40 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                    ⚠️
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] block mb-1">
                        Admin Portal Notice
                    </span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        Admin Scene Exception
                    </h2>
                    <p className="text-gray-400 text-xs mt-2 font-mono bg-black/60 p-3 rounded-xl border border-white/5 break-words">
                        {error?.message || "An unexpected error occurred while rendering this admin view."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/admin"
                        className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all border border-white/10"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                    >
                        View Live Site ↗
                    </Link>
                </div>
            </div>
        </div>
    );
}
