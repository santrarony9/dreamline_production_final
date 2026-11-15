"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitize";

export default function SectionRenderer({ section, design = {}, isPreview = false }) {
    if (!section || section.visible === false) return null;

    const { type, settings = {} } = section;
    const accentColor = design.accentColor || "#c5a059";
    const bgStyle = settings.backgroundColor ? { backgroundColor: settings.backgroundColor } : {};

    switch (type) {
        case "hero":
            return (
                <section
                    className={`relative overflow-hidden text-white ${settings.paddingTop || "py-32"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    {settings.images?.[0]?.url && (
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={settings.images[0].url}
                                alt={settings.images[0].alt || (settings.heading ? `${settings.heading} background cinematography` : "Cinematic hero background by Dreamline Production Kolkata")}
                                fill
                                priority
                                className="object-cover opacity-35"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
                        </div>
                    )}
                    <div className="container mx-auto px-6 relative z-10">
                        <div className={`max-w-4xl ${settings.alignment === "left" ? "text-left" : settings.alignment === "right" ? "text-right ml-auto" : "text-center mx-auto"}`}>
                            {settings.badge && (
                                <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#c5a059] mb-6">
                                    {settings.badge}
                                </span>
                            )}
                            {settings.subheading && (
                                <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-[#c5a059] mb-4">
                                    {settings.subheading}
                                </p>
                            )}
                            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tight mb-8">
                                {settings.heading || "Visionary Cinema."}
                            </h1>
                            {settings.description && (
                                <p className="text-gray-300 text-base md:text-xl font-light leading-relaxed max-w-2xl mb-10 mx-auto">
                                    {settings.description}
                                </p>
                            )}
                            {settings.buttons && settings.buttons.length > 0 && (
                                <div className={`flex flex-wrap gap-4 items-center ${settings.alignment === "left" ? "justify-start" : settings.alignment === "right" ? "justify-end" : "justify-center"}`}>
                                    {settings.buttons.map((btn, idx) => (
                                        <Link
                                            key={idx}
                                            href={btn.url || "#"}
                                            target={btn.target || "_self"}
                                            className={`px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all ${
                                                btn.style === "outline"
                                                    ? "border border-white/30 text-white hover:bg-white hover:text-black"
                                                    : "bg-[#c5a059] text-black hover:bg-white shadow-xl shadow-[#c5a059]/10"
                                            }`}
                                        >
                                            {btn.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            );

        case "image-banner":
            return (
                <section
                    className={`relative overflow-hidden text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="relative rounded-3xl overflow-hidden min-h-[420px] flex items-center justify-center p-8 md:p-16 border border-white/10">
                            {settings.images?.[0]?.url && (
                                <Image
                                    src={settings.images[0].url}
                                    alt={settings.images[0].alt || (settings.heading ? `${settings.heading} banner visual` : "Cinematic production banner by Dreamline Production")}
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>
                            <div className="relative z-10 max-w-3xl text-center">
                                {settings.subheading && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {settings.subheading}
                                    </p>
                                )}
                                <h2 className="font-heading text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
                                    {settings.heading}
                                </h2>
                                {settings.description && (
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
                                        {settings.description}
                                    </p>
                                )}
                                {settings.buttons?.[0]?.label && (
                                    <Link
                                        href={settings.buttons[0].url || "#"}
                                        className="inline-block px-8 py-3.5 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20"
                                    >
                                        {settings.buttons[0].label}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            );

        case "text":
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-20"} ${settings.paddingBottom || "py-20"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className={`max-w-4xl ${settings.alignment === "center" ? "mx-auto text-center" : "mx-auto"}`}>
                            {settings.subheading && (
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                    {settings.subheading}
                                </p>
                            )}
                            {settings.heading && (
                                <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-8">
                                    {settings.heading}
                                </h2>
                            )}
                            {settings.content ? (
                                <div
                                    className="prose prose-invert prose-gold max-w-none text-gray-300 text-base md:text-lg leading-relaxed
                                    prose-headings:font-heading prose-headings:text-white prose-headings:uppercase
                                    prose-h2:text-3xl prose-h2:text-[#c5a059] prose-h3:text-2xl
                                    prose-p:mb-6 prose-p:leading-relaxed
                                    prose-a:text-[#c5a059] hover:prose-a:text-white
                                    prose-blockquote:border-l-[#c5a059] prose-blockquote:bg-white/[0.02] prose-blockquote:p-4"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.content) }}
                                />
                            ) : settings.description ? (
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {settings.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>
            );

        case "image-text":
            const isReversed = settings.alignment === "right"; // Image on Right if reversed
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-20"} ${settings.paddingBottom || "py-20"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className={`grid md:grid-cols-2 gap-12 lg:gap-16 items-center ${isReversed ? "md:grid-flow-dense" : ""}`}>
                            <div className={`${isReversed ? "md:col-start-2" : ""}`}>
                                <div className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-white/10 group">
                                    {settings.images?.[0]?.url ? (
                                        <Image
                                            src={settings.images[0].url}
                                            alt={settings.images[0].alt || (settings.heading ? `${settings.heading} visual showcase` : "Cinematic visual keyframe by Dreamline Production")}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-xs text-gray-500 uppercase font-bold tracking-widest">
                                            No Image Selected
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`${isReversed ? "md:col-start-1" : ""}`}>
                                {settings.subheading && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {settings.subheading}
                                    </p>
                                )}
                                <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-6 leading-tight">
                                    {settings.heading}
                                </h2>
                                {settings.description && (
                                    <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 font-light">
                                        {settings.description}
                                    </p>
                                )}
                                {settings.buttons?.[0]?.label && (
                                    <Link
                                        href={settings.buttons[0].url || "#"}
                                        className="inline-block px-8 py-3.5 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20"
                                    >
                                        {settings.buttons[0].label}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            );

        case "full-width-image":
            return (
                <section
                    className={`relative overflow-hidden ${settings.paddingTop || "py-12"} ${settings.paddingBottom || "py-12"}`}
                    style={bgStyle}
                >
                    <div className="w-full h-[50vh] md:h-[75vh] relative overflow-hidden">
                        {settings.images?.[0]?.url && (
                            <Image
                                src={settings.images[0].url}
                                alt={settings.images[0].alt || (settings.heading ? `${settings.heading} panoramic view` : "Panoramic visual cinematography keyframe by Dreamline Production")}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black"></div>
                        {settings.heading && (
                            <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 max-w-xl z-10 text-white">
                                <h3 className="font-heading text-2xl md:text-4xl font-black uppercase mb-2">
                                    {settings.heading}
                                </h3>
                                {settings.description && (
                                    <p className="text-sm text-gray-300 font-light">{settings.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            );

        case "gallery":
            const galleryImages = settings.images || [];
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        {(settings.heading || settings.subheading) && (
                            <div className="max-w-2xl mb-12">
                                {settings.subheading && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {settings.subheading}
                                    </p>
                                )}
                                {settings.heading && (
                                    <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white">
                                        {settings.heading}
                                    </h2>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {galleryImages.map((img, i) => (
                                <div key={i} className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-white/10 group bg-[#111]">
                                    <Image
                                        src={img.url}
                                        alt={img.alt || (settings.heading ? `${settings.heading} gallery visual ${i + 1}` : `Cinematic visual capture ${i + 1} by Dreamline Production Kolkata`)}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    {img.caption && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-xs text-white font-bold">{img.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case "video":
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-20"} ${settings.paddingBottom || "py-20"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            {(settings.heading || settings.subheading) && (
                                <div className="text-center mb-10">
                                    {settings.subheading && (
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                            {settings.subheading}
                                        </p>
                                    )}
                                    <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-4">
                                        {settings.heading}
                                    </h2>
                                    {settings.description && (
                                        <p className="text-gray-400 text-sm max-w-xl mx-auto">{settings.description}</p>
                                    )}
                                </div>
                            )}
                            <div className="rounded-3xl overflow-hidden aspect-video relative border border-white/10 bg-black shadow-2xl">
                                {settings.videoUrl?.includes("youtube.com") || settings.videoUrl?.includes("youtu.be") ? (
                                    <iframe
                                        src={settings.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                                        title={settings.heading || "Dreamline Cinema"}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : settings.videoUrl?.includes("vimeo.com") ? (
                                    <iframe
                                        src={settings.videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                                        title={settings.heading || "Dreamline Cinema"}
                                        className="w-full h-full"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : settings.videoUrl ? (
                                    <video src={settings.videoUrl} controls className="w-full h-full object-cover" poster={settings.videoThumbnail} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 uppercase font-bold tracking-widest">
                                        No Video URL Provided
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            );

        case "services":
            const servicesList = settings.items || [];
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            {settings.subheading && (
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                    {settings.subheading}
                                </p>
                            )}
                            <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-4">
                                {settings.heading || "Our Signature Services"}
                            </h2>
                            {settings.description && (
                                <p className="text-gray-400 text-sm">{settings.description}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {servicesList.map((service, idx) => (
                                <div
                                    key={idx}
                                    className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/40 transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <span className="text-3xl block mb-6">{service.icon || "🎬"}</span>
                                        <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-[#c5a059] transition-colors mb-4">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                                            {service.description}
                                        </p>
                                    </div>
                                    {service.url && (
                                        <Link
                                            href={service.url}
                                            className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2 group-hover:text-white transition-colors pt-4 border-t border-white/5"
                                        >
                                            <span>Explore Service</span>
                                            <span>→</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case "portfolio":
            const portfolioItems = settings.items || [];
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div>
                                {settings.subheading && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {settings.subheading}
                                    </p>
                                )}
                                <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white">
                                    {settings.heading || "Featured Archive"}
                                </h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {portfolioItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-[#c5a059]/30 transition-all group flex flex-col"
                                >
                                    <div className="aspect-[16/10] relative overflow-hidden bg-black">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.alt || (item.title ? `${item.title} portfolio showcase by Dreamline Production` : "Featured production portfolio project by Dreamline Production")}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        )}
                                        {item.category && (
                                            <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-[#c5a059] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors mb-2">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs text-gray-400 font-light leading-relaxed">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case "testimonials":
            const reviews = settings.items || [];
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            {settings.subheading && (
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                    {settings.subheading}
                                </p>
                            )}
                            <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-4">
                                {settings.heading || "Client Stories"}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviews.map((r, i) => (
                                <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-all flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex gap-1 text-[#c5a059] text-sm">
                                            {"★".repeat(r.rating || 5)}
                                        </div>
                                        <p className="text-gray-300 text-sm italic leading-relaxed font-light">
                                            "{r.quote || r.comment}"
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 mt-6">
                                        <p className="text-xs font-bold text-white uppercase">{r.author || r.clientName}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{r.project || "Wedding / Commercial"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case "faq":
            return <FAQSection settings={settings} bgStyle={bgStyle} />;

        case "contact-form":
            return <ContactSection settings={settings} bgStyle={bgStyle} isPreview={isPreview} />;

        case "cta":
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div className="bg-gradient-to-br from-[#111] via-[#0c0c0c] to-[#050505] border border-[#c5a059]/40 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="max-w-2xl mx-auto relative z-10">
                                {settings.subheading && (
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                        {settings.subheading}
                                    </p>
                                )}
                                <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-6">
                                    {settings.heading || "Ready to Craft Your Masterpiece?"}
                                </h2>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-10 max-w-xl mx-auto font-light">
                                    {settings.description || "Schedule a consultation with our directorial and cinematography team today."}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link
                                        href={settings.buttons?.[0]?.url || "/contact/"}
                                        className="px-8 py-4 bg-[#c5a059] text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-white transition-all shadow-xl shadow-[#c5a059]/20"
                                    >
                                        {settings.buttons?.[0]?.label || "Book Consultation"}
                                    </Link>
                                    {settings.buttons?.[1]?.label && (
                                        <Link
                                            href={settings.buttons[1].url || "/services/"}
                                            className="px-8 py-4 border border-white/20 text-white font-black uppercase text-xs tracking-widest rounded-full hover:bg-white/10 transition-all"
                                        >
                                            {settings.buttons[1].label}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            );

        case "custom-html":
            return (
                <section
                    className={`text-white ${settings.paddingTop || "py-16"} ${settings.paddingBottom || "py-16"}`}
                    style={bgStyle}
                >
                    <div className="container mx-auto px-6">
                        <div
                            className="max-w-6xl mx-auto"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.content || "") }}
                        />
                    </div>
                </section>
            );

        default:
            return null;
    }
}

// Collapsible FAQ Accordion Component
function FAQSection({ settings, bgStyle }) {
    const [openIndex, setOpenIndex] = useState(0);
    const faqs = settings.items || [];

    return (
        <section
            className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
            style={bgStyle}
        >
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    {(settings.heading || settings.subheading) && (
                        <div className="text-center mb-16">
                            {settings.subheading && (
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                    {settings.subheading}
                                </p>
                            )}
                            <h2 className="font-heading text-3xl md:text-5xl font-black uppercase text-white mb-4">
                                {settings.heading || "Frequently Asked Questions"}
                            </h2>
                            {settings.description && (
                                <p className="text-gray-400 text-sm">{settings.description}</p>
                            )}
                        </div>
                    )}
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                        className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <span className="font-bold text-base text-white">{faq.question}</span>
                                        <span className="text-[#c5a059] text-xl font-mono">{isOpen ? "−" : "+"}</span>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed font-light border-t border-white/5 pt-4">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Contact Form Component
function ContactSection({ settings, bgStyle, isPreview }) {
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isPreview) {
            setStatus("Form preview: submission simulated successfully!");
            return;
        }
        setSubmitting(true);
        setStatus("");
        try {
            const formData = new FormData(e.target);
            const body = Object.fromEntries(formData.entries());
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setStatus("Thank you! Your message has been received by our studio team.");
                e.target.reset();
            } else {
                setStatus("Error sending inquiry. Please call us directly.");
            }
        } catch (err) {
            setStatus("Error connecting to server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            className={`text-white ${settings.paddingTop || "py-24"} ${settings.paddingBottom || "py-24"}`}
            style={bgStyle}
        >
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="text-center mb-8">
                        {settings.subheading && (
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059] mb-3">
                                {settings.subheading}
                            </p>
                        )}
                        <h2 className="font-heading text-3xl font-black uppercase text-white mb-3">
                            {settings.heading || "Connect With Our Directors"}
                        </h2>
                        {settings.description && (
                            <p className="text-xs text-gray-400 leading-relaxed">{settings.description}</p>
                        )}
                    </div>
                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-xs text-[#c5a059] text-center font-bold">
                            {status}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Your Name *</label>
                                <input type="text" name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]" />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Phone Number *</label>
                                <input type="tel" name="phone" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Email Address</label>
                            <input type="email" name="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]" />
                        </div>
                        <div>
                            <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Project Details / Vision</label>
                            <textarea name="message" rows="4" placeholder="Tell us about your wedding date, commercial brief, or production vision..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059] resize-none" required></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#c5a059] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/20"
                        >
                            {submitting ? "Sending..." : "Submit Inquiry →"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
