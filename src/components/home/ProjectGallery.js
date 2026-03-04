"use client";

import { useState } from "react";
import { openVideo } from "@/components/VideoModal";

export default function ProjectGallery({ initialProjects }) {
    const [filter, setFilter] = useState("all");

    const projects = initialProjects || [
        { id: 1, title: "Rohan & Sneha", type: "wedding", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800", videoUrl: "#" },
        { id: 2, title: "Vogue India Edit", type: "commercial", img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800", videoUrl: "#" },
        { id: 3, title: "The Royal Bengal", type: "wedding", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800", videoUrl: "#" },
        { id: 4, title: "Adidas Originals", type: "commercial", img: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800", videoUrl: "#" }
    ];

    const filteredProjects = filter === "all" ? projects : projects.filter(p => p.type === filter);

    return (
        <section className="py-32 bg-[#050505]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase italic">
                        Portfolio.
                    </h2>
                    <div className="flex gap-4 p-1 bg-[#151515] rounded-full border border-white/5">
                        {["all", "wedding", "commercial"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                    ? "bg-[#c5a059] text-black"
                                    : "text-white/40 hover:text-white"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => openVideo(project.videoUrl, project.title)}
                            className="aspect-[4/5] bg-zinc-900 border border-white/5 overflow-hidden relative group interactive"
                        >
                            <img
                                src={project.img}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                            <div className="absolute inset-0 p-10 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                    {project.type}
                                </p>
                                <h3 className="text-white font-heading text-2xl font-black uppercase leading-tight mb-6">
                                    {project.title}
                                </h3>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center bg-[#c5a059]/10">
                                        <svg className="w-4 h-4 fill-[#c5a059]" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] text-white font-black uppercase tracking-widest">
                                        Watch Film
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
