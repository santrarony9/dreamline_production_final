"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default function SectionEditor({ section, onUpdate, onClose }) {
    const [activeTab, setActiveTab] = useState("content"); // content | style | items
    const [showMediaVault, setShowMediaVault] = useState(false);
    const [mediaVaultTarget, setMediaVaultTarget] = useState(null); // 'bgImage' | 'singleImage' | 'itemImage'

    const settings = section.settings || {};

    const updateSetting = (key, val) => {
        onUpdate({
            ...section,
            settings: {
                ...settings,
                [key]: val
            }
        });
    };

    // Item management (for FAQ, Services, Portfolio, Testimonials, Gallery)
    const items = settings.items || [];

    const addItem = () => {
        let newItem = {};
        if (section.type === "faq") {
            newItem = { question: "New Question?", answer: "Answer details..." };
        } else if (section.type === "services") {
            newItem = { icon: "🎬", title: "New Service", description: "Service details...", url: "/services/" };
        } else if (section.type === "portfolio") {
            newItem = { title: "New Project", category: "WEDDING", image: "", description: "Project summary" };
        } else if (section.type === "testimonials") {
            newItem = { clientName: "Client Name", quote: "Dreamline delivered beyond expectations.", rating: 5, project: "Wedding Film" };
        } else if (section.type === "gallery") {
            newItem = { url: "", alt: "Gallery photo", caption: "" };
        }

        updateSetting("items", [...items, newItem]);
    };

    const updateItem = (index, field, val) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: val };
        updateSetting("items", updated);
    };

    const removeItem = (index) => {
        updateSetting("items", items.filter((_, i) => i !== index));
    };

    // Button management
    const buttons = settings.buttons || [];

    const addButton = () => {
        updateSetting("buttons", [...buttons, { label: "Learn More", url: "/services/", style: "gold", target: "_self" }]);
    };

    const updateButton = (index, field, val) => {
        const updated = [...buttons];
        updated[index] = { ...updated[index], [field]: val };
        updateSetting("buttons", updated);
    };

    const removeButton = (index) => {
        updateSetting("buttons", buttons.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex justify-end">
            <div className="bg-[#0e0e0e] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                    <div>
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-[0.3em]">
                            Configuring Section
                        </span>
                        <h3 className="text-lg font-black uppercase text-white">
                            {section.type.replace("-", " ")}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs uppercase font-bold"
                    >
                        Done ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-[#080808] px-6 gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("content")}
                        className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === "content" ? "border-[#c5a059] text-[#c5a059]" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                    >
                        Content & Text
                    </button>
                    {["services", "portfolio", "testimonials", "faq", "gallery"].includes(section.type) && (
                        <button
                            type="button"
                            onClick={() => setActiveTab("items")}
                            className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === "items" ? "border-[#c5a059] text-[#c5a059]" : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            Items & Cards ({items.length})
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setActiveTab("style")}
                        className={`py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === "style" ? "border-[#c5a059] text-[#c5a059]" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                    >
                        Design & Spacing
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                    {activeTab === "content" && (
                        <div className="space-y-5">
                            {/* Badge */}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                    Badge Pill (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={settings.badge || ""}
                                    onChange={(e) => updateSetting("badge", e.target.value)}
                                    placeholder="e.g. EXCELLENCE IN CINEMA"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Subheading */}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                    Subheading / Tagline
                                </label>
                                <input
                                    type="text"
                                    value={settings.subheading || ""}
                                    onChange={(e) => updateSetting("subheading", e.target.value)}
                                    placeholder="e.g. Kolkata's Premier Production House"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Main Heading */}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                    Main Heading
                                </label>
                                <input
                                    type="text"
                                    value={settings.heading || ""}
                                    onChange={(e) => updateSetting("heading", e.target.value)}
                                    placeholder="Section headline..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white text-sm font-bold outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Description / Content */}
                            {section.type === "custom-html" ? (
                                <div>
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                        HTML Code (Sanitized)
                                    </label>
                                    <textarea
                                        value={settings.content || ""}
                                        onChange={(e) => updateSetting("content", e.target.value)}
                                        rows={10}
                                        placeholder="<div>Custom HTML or embeds...</div>"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-gray-300 font-mono text-xs outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                        Description Copy
                                    </label>
                                    <textarea
                                        value={settings.description || settings.content || ""}
                                        onChange={(e) => {
                                            updateSetting("description", e.target.value);
                                            updateSetting("content", e.target.value);
                                        }}
                                        rows={4}
                                        placeholder="Section narrative or body text..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059] leading-relaxed"
                                    />
                                </div>
                            )}

                            {/* Images for Hero / Banner / Image-Text */}
                            {["hero", "image-banner", "image-text", "full-width-image"].includes(section.type) && (
                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">
                                        Keyframe Image
                                    </label>
                                    <ImageUploader
                                        currentImage={settings.images?.[0]?.url || ""}
                                        recommendedSize="1600x900 recommended"
                                        onUploadSuccess={(url) => {
                                            updateSetting("images", [{ url, alt: settings.heading || "Visual" }]);
                                        }}
                                    />
                                    {settings.images?.[0]?.url && (
                                        <input
                                            type="text"
                                            value={settings.images[0].alt || ""}
                                            onChange={(e) => {
                                                const imgs = [...(settings.images || [])];
                                                imgs[0] = { ...imgs[0], alt: e.target.value };
                                                updateSetting("images", imgs);
                                            }}
                                            placeholder="Image alt text for SEO..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Video URL */}
                            {section.type === "video" && (
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">
                                        Video Embed URL
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.videoUrl || ""}
                                        onChange={(e) => updateSetting("videoUrl", e.target.value)}
                                        placeholder="YouTube, Vimeo, or direct MP4 link..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            {["hero", "image-banner", "image-text", "cta"].includes(section.type) && (
                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest">
                                            Call-to-Action Buttons
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addButton}
                                            className="text-[9px] text-[#c5a059] uppercase font-bold hover:underline"
                                        >
                                            + Add Button
                                        </button>
                                    </div>
                                    {buttons.map((btn, bIdx) => (
                                        <div key={bIdx} className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-mono text-gray-500 uppercase">Button #{bIdx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeButton(bIdx)}
                                                    className="text-red-400 hover:text-red-300 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={btn.label || ""}
                                                    onChange={(e) => updateButton(bIdx, "label", e.target.value)}
                                                    placeholder="Button Label"
                                                    className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={btn.url || ""}
                                                    onChange={(e) => updateButton(bIdx, "url", e.target.value)}
                                                    placeholder="/contact/ or https://..."
                                                    className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 text-xs pt-1">
                                                <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`btn-style-${bIdx}`}
                                                        checked={btn.style !== "outline"}
                                                        onChange={() => updateButton(bIdx, "style", "gold")}
                                                    />
                                                    <span>Gold Fill</span>
                                                </label>
                                                <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`btn-style-${bIdx}`}
                                                        checked={btn.style === "outline"}
                                                        onChange={() => updateButton(bIdx, "style", "outline")}
                                                    />
                                                    <span>Outline</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items Tab (FAQ, Services, Portfolio, Testimonials, Gallery) */}
                    {activeTab === "items" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest">
                                    Card Items List
                                </label>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="px-3 py-1.5 bg-[#c5a059] text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-white transition-colors"
                                >
                                    + Add Item
                                </button>
                            </div>

                            {items.map((item, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-[10px] font-mono text-[#c5a059] uppercase font-bold">
                                            #{idx + 1} {section.type}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx)}
                                            className="text-red-400 hover:text-red-300 text-xs font-bold"
                                        >
                                            Delete ✕
                                        </button>
                                    </div>

                                    {section.type === "faq" && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={item.question || ""}
                                                onChange={(e) => updateItem(idx, "question", e.target.value)}
                                                placeholder="Question..."
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none"
                                            />
                                            <textarea
                                                value={item.answer || ""}
                                                onChange={(e) => updateItem(idx, "answer", e.target.value)}
                                                placeholder="Answer..."
                                                rows={3}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none"
                                            />
                                        </div>
                                    )}

                                    {section.type === "services" && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-4 gap-2">
                                                <input
                                                    type="text"
                                                    value={item.icon || "🎬"}
                                                    onChange={(e) => updateItem(idx, "icon", e.target.value)}
                                                    placeholder="Icon/Emoji"
                                                    className="col-span-1 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.title || ""}
                                                    onChange={(e) => updateItem(idx, "title", e.target.value)}
                                                    placeholder="Service Title"
                                                    className="col-span-3 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                            </div>
                                            <textarea
                                                value={item.description || ""}
                                                onChange={(e) => updateItem(idx, "description", e.target.value)}
                                                placeholder="Service description..."
                                                rows={2}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                            />
                                            <input
                                                type="text"
                                                value={item.url || ""}
                                                onChange={(e) => updateItem(idx, "url", e.target.value)}
                                                placeholder="Link URL (/services/...)"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                    )}

                                    {section.type === "portfolio" && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={item.title || ""}
                                                    onChange={(e) => updateItem(idx, "title", e.target.value)}
                                                    placeholder="Project Name"
                                                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.category || ""}
                                                    onChange={(e) => updateItem(idx, "category", e.target.value)}
                                                    placeholder="Category (e.g. WEDDING)"
                                                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={item.image || ""}
                                                    onChange={(e) => updateItem(idx, "image", e.target.value)}
                                                    placeholder="Image URL..."
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMediaVaultTarget(idx);
                                                        setShowMediaVault(true);
                                                    }}
                                                    className="px-3 py-2 bg-white/10 hover:bg-[#c5a059] text-xs font-bold rounded-lg text-white hover:text-black"
                                                >
                                                    Vault
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {section.type === "testimonials" && (
                                        <div className="space-y-2">
                                            <textarea
                                                value={item.quote || ""}
                                                onChange={(e) => updateItem(idx, "quote", e.target.value)}
                                                placeholder="Client quote..."
                                                rows={2}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={item.author || ""}
                                                    onChange={(e) => updateItem(idx, "author", e.target.value)}
                                                    placeholder="Client Name"
                                                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.project || ""}
                                                    onChange={(e) => updateItem(idx, "project", e.target.value)}
                                                    placeholder="Project (e.g. Wedding Film)"
                                                    className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.type === "gallery" && (
                                        <div className="space-y-2">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={item.url || ""}
                                                    onChange={(e) => updateItem(idx, "url", e.target.value)}
                                                    placeholder="Image URL..."
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMediaVaultTarget(idx);
                                                        setShowMediaVault(true);
                                                    }}
                                                    className="px-3 py-2 bg-white/10 hover:bg-[#c5a059] text-xs font-bold rounded-lg text-white hover:text-black"
                                                >
                                                    Vault
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={item.caption || ""}
                                                onChange={(e) => updateItem(idx, "caption", e.target.value)}
                                                placeholder="Caption / Alt text (optional)..."
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Design & Style Tab */}
                    {activeTab === "style" && (
                        <div className="space-y-5">
                            {/* Alignment */}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-2">
                                    Text Alignment
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["left", "center", "right"].map(align => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => updateSetting("alignment", align)}
                                            className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                                (settings.alignment || "center") === align
                                                    ? "bg-[#c5a059] text-black"
                                                    : "bg-white/5 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Spacing */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                        Padding Top
                                    </label>
                                    <select
                                        value={settings.paddingTop || "py-24"}
                                        onChange={(e) => updateSetting("paddingTop", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                                    >
                                        <option value="py-12" className="bg-[#111]">Compact (py-12)</option>
                                        <option value="py-20" className="bg-[#111]">Standard (py-20)</option>
                                        <option value="py-24" className="bg-[#111]">Spacious (py-24)</option>
                                        <option value="py-32" className="bg-[#111]">Heroic (py-32)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                        Padding Bottom
                                    </label>
                                    <select
                                        value={settings.paddingBottom || "py-24"}
                                        onChange={(e) => updateSetting("paddingBottom", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                                    >
                                        <option value="py-12" className="bg-[#111]">Compact (py-12)</option>
                                        <option value="py-20" className="bg-[#111]">Standard (py-20)</option>
                                        <option value="py-24" className="bg-[#111]">Spacious (py-24)</option>
                                        <option value="py-32" className="bg-[#111]">Heroic (py-32)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">
                                    Background Preset
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: "Black", color: "#050505" },
                                        { label: "Dark Gray", color: "#0c0c0c" },
                                        { label: "Card Dark", color: "#111111" },
                                        { label: "Deep Slate", color: "#161616" }
                                    ].map(b => (
                                        <button
                                            key={b.color}
                                            type="button"
                                            onClick={() => updateSetting("backgroundColor", b.color)}
                                            className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1.5 ${
                                                settings.backgroundColor === b.color
                                                    ? "border-[#c5a059] text-[#c5a059]"
                                                    : "border-white/10 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: b.color }} />
                                            <span>{b.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Vault Picker for Item Images */}
            {showMediaVault && (
                <MediaLibrary
                    onClose={() => setShowMediaVault(false)}
                    onSelect={(url) => {
                        if (mediaVaultTarget !== null && items[mediaVaultTarget]) {
                            if (section.type === "portfolio") {
                                updateItem(mediaVaultTarget, "image", url);
                            } else if (section.type === "gallery") {
                                updateItem(mediaVaultTarget, "url", url);
                            }
                        }
                        setShowMediaVault(false);
                    }}
                />
            )}
        </div>
    );
}
