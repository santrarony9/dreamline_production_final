"use client";

import { useState } from "react";
import SectionRenderer from "@/components/page-builder/SectionRenderer";

export default function LivePreviewModal({ page, onClose }) {
    const [viewport, setViewport] = useState("desktop"); // desktop | tablet | mobile

    const sections = page.sections || [];
    const design = page.design || {};

    const viewportWidthClass = {
        desktop: "w-full max-w-full",
        tablet: "w-[768px] max-w-full shadow-2xl border-x border-white/20",
        mobile: "w-[390px] max-w-full shadow-2xl border-x border-white/20"
    }[viewport];

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex flex-col">
            {/* Top Toolbar */}
            <div className="p-4 bg-[#0a0a0a] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full border border-[#c5a059]/20">
                        Live Preview Engine
                    </span>
                    <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                        https://dreamlineproduction.com/{page.slug || "slug"}/
                    </span>
                </div>

                {/* Viewport Switcher */}
                <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-2xl p-1">
                    <button
                        type="button"
                        onClick={() => setViewport("desktop")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                            viewport === "desktop"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <span>🖥️</span> Desktop
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewport("tablet")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                            viewport === "tablet"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <span>📱</span> Tablet (768px)
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewport("mobile")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                            viewport === "mobile"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <span>📱</span> Mobile (390px)
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                        Exit Preview ✕
                    </button>
                </div>
            </div>

            {/* Preview Viewport Frame */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-[#050505] custom-scrollbar">
                <div className={`transition-all duration-300 min-h-screen bg-[#050505] ${viewportWidthClass}`}>
                    {/* Mock Navigation Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between text-white bg-black/60">
                        <div className="flex items-end gap-1">
                            <span className="font-heading font-black text-xl text-white">D<span className="text-[#c5a059]">/</span>P</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mb-1"></span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                            {page.title || "Custom Page"}
                        </span>
                    </div>

                    {/* Rendered Sections */}
                    {sections.length === 0 ? (
                        <div className="py-32 text-center text-gray-500 uppercase tracking-widest text-xs font-bold">
                            No sections added yet.
                        </div>
                    ) : (
                        sections.map((section, idx) => (
                            <SectionRenderer
                                key={section.id || idx}
                                section={section}
                                design={design}
                                isPreview={true}
                            />
                        ))
                    )}

                    {/* Mock Footer */}
                    <footer className="p-8 border-t border-white/10 text-center text-xs text-gray-600 uppercase tracking-widest font-bold bg-black">
                        © Dreamline Production • Kolkata Studio HQ
                    </footer>
                </div>
            </div>
        </div>
    );
}
