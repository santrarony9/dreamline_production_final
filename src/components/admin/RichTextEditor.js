"use client";

import { useState, useRef, useEffect } from "react";
import MediaLibrary from "./MediaLibrary";

const INTERNAL_LINKS = [
    { label: "Wedding Photography Kolkata", url: "/services/wedding-photography-kolkata/" },
    { label: "Luxury Wedding Cinema", url: "/luxury/" },
    { label: "Drone Videography Kolkata", url: "/services/drone-videography-kolkata/" },
    { label: "Corporate Photography Kolkata", url: "/services/corporate-photography-kolkata/" },
    { label: "Commercial Ad Films Kolkata", url: "/services/commercial-ad-films-kolkata/" },
    { label: "Pre-Wedding Shoot Kolkata", url: "/locations/pre-wedding-shoot-kolkata/" },
    { label: "Video Production Agency Kolkata", url: "/services/video-production-agency-kolkata/" },
    { label: "Contact Dreamline Studio", url: "/contact/" },
];

export default function RichTextEditor({ value = "", onChange }) {
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

    // Link modal state
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(false);

    // Image modal state
    const [imageUrl, setImageUrl] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    const editorRef = useRef(null);
    const savedSelectionRef = useRef(null);

    // Synchronize external value into editor when not focused or on initial load
    useEffect(() => {
        if (editorRef.current && !isHtmlMode) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || "";
            }
        }
    }, [value, isHtmlMode]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
        }
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (savedSelectionRef.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedSelectionRef.current);
        }
    };

    const exec = (command, val = null) => {
        if (isHtmlMode) return;
        editorRef.current?.focus();
        document.execCommand(command, false, val);
        handleInput();
    };

    const applyFormatBlock = (tag) => {
        exec("formatBlock", `<${tag}>`);
    };

    // Open Link Dialog
    const openLinkModal = () => {
        saveSelection();
        const sel = window.getSelection();
        const text = sel ? sel.toString() : "";
        setLinkText(text);
        setLinkUrl("https://");
        setLinkNewTab(false);
        setShowLinkModal(true);
    };

    const insertLink = (e) => {
        e.preventDefault();
        setShowLinkModal(false);
        restoreSelection();
        if (!linkUrl) return;

        const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        const display = linkText.trim() || linkUrl;

        // If selection exists, link it
        if (savedSelectionRef.current && !savedSelectionRef.current.collapsed && !linkText) {
            exec("createLink", linkUrl);
        } else {
            const linkHtml = `<a href="${linkUrl}"${targetAttr} class="text-[#c5a059] underline hover:text-white transition-colors">${display}</a> `;
            exec("insertHTML", linkHtml);
        }
    };

    // Insert Internal Link
    const insertInternalLink = (url, label) => {
        editorRef.current?.focus();
        const linkHtml = `<a href="${url}" class="text-[#c5a059] underline hover:text-white font-semibold transition-colors">${label}</a> `;
        exec("insertHTML", linkHtml);
    };

    // Open Image Dialog
    const openImageModal = () => {
        saveSelection();
        setImageUrl("");
        setImageCaption("");
        setImageAlt("");
        setShowImageModal(true);
    };

    const insertImageContent = (e) => {
        e.preventDefault();
        setShowImageModal(false);
        restoreSelection();
        if (!imageUrl) return;

        const altAttr = imageAlt.trim() || imageCaption.trim() || "Cinematic editorial photography by Dreamline Production Kolkata";
        let figureHtml = `
            <figure class="my-8 text-center">
                <img src="${imageUrl}" alt="${altAttr}" class="rounded-3xl border border-white/10 w-full max-h-[600px] object-cover mx-auto" />
                ${imageCaption.trim() ? `<figcaption class="text-xs text-gray-400 mt-3 italic font-sans uppercase tracking-widest font-bold">${imageCaption.trim()}</figcaption>` : ''}
            </figure>
            <p><br></p>
        `;
        exec("insertHTML", figureHtml);
    };

    // Insert Call to Action Block
    const insertCTABox = () => {
        editorRef.current?.focus();
        const ctaHtml = `
            <div class="my-10 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#c5a059]/30 text-center relative overflow-hidden">
                <h3 class="text-2xl font-black text-white uppercase tracking-tight mb-3">Planning a Wedding or Commercial Film?</h3>
                <p class="text-gray-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">Let Kolkata's premier production team bring your story to life with cinematic perfection.</p>
                <a href="/contact/" class="inline-block bg-[#c5a059] text-black px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#c5a059]/10">Book a Consultation →</a>
            </div>
            <p><br></p>
        `;
        exec("insertHTML", ctaHtml);
    };

    // Compute Word Count and Reading Time
    const plainText = (value || "").replace(/<[^>]+>/g, " ").trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="bg-[#050505] border border-white/10 rounded-3xl overflow-hidden focus-within:border-[#c5a059]/40 transition-all flex flex-col">
            {/* Toolbar */}
            <div className="bg-[#0c0c0c] border-b border-white/5 p-3 flex flex-wrap items-center gap-1.5 sticky top-0 z-10">
                {/* Heading Select */}
                <select
                    disabled={isHtmlMode}
                    onChange={(e) => {
                        applyFormatBlock(e.target.value);
                        e.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold uppercase tracking-wider outline-none hover:border-[#c5a059] transition-all disabled:opacity-30"
                    title="Formatting"
                >
                    <option value="" disabled>Format</option>
                    <option value="p" className="bg-[#111] text-white">Paragraph (Normal)</option>
                    <option value="h2" className="bg-[#111] text-[#c5a059] font-bold">Heading 2 (Main Section)</option>
                    <option value="h3" className="bg-[#111] text-white font-semibold">Heading 3 (Subsection)</option>
                    <option value="h4" className="bg-[#111] text-gray-300">Heading 4 (Subheading)</option>
                </select>

                <div className="h-5 w-[1px] bg-white/10 mx-1" />

                {/* Inline Formatting */}
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("bold")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 font-black text-xs transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Bold (Ctrl+B)"
                >
                    B
                </button>
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("italic")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 italic font-serif font-black text-xs transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Italic (Ctrl+I)"
                >
                    I
                </button>
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("underline")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 underline font-black text-xs transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Underline (Ctrl+U)"
                >
                    U
                </button>
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("strikeThrough")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 line-through font-black text-xs transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Strikethrough"
                >
                    S
                </button>

                <div className="h-5 w-[1px] bg-white/10 mx-1" />

                {/* Lists & Quotes */}
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("insertUnorderedList")}
                    className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1"
                    title="Bullet List"
                >
                    <span>•</span> List
                </button>
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("insertOrderedList")}
                    className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1"
                    title="Numbered List"
                >
                    <span>1.</span> List
                </button>
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => applyFormatBlock("blockquote")}
                    className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1"
                    title="Blockquote"
                >
                    “ Quote
                </button>

                <div className="h-5 w-[1px] bg-white/10 mx-1" />

                {/* Links */}
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={openLinkModal}
                    className="px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1.5"
                    title="Insert Link"
                >
                    🔗 Link
                </button>

                {/* Internal Links Quick Picker */}
                <select
                    disabled={isHtmlMode}
                    onChange={(e) => {
                        const target = INTERNAL_LINKS.find(l => l.url === e.target.value);
                        if (target) insertInternalLink(target.url, target.label);
                        e.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#c5a059] font-bold uppercase tracking-wider outline-none hover:border-[#c5a059] transition-all disabled:opacity-30"
                    title="Insert Internal Service Link"
                >
                    <option value="" disabled>+ Internal Link</option>
                    {INTERNAL_LINKS.map((link) => (
                        <option key={link.url} value={link.url} className="bg-[#111] text-white">
                            {link.label}
                        </option>
                    ))}
                </select>

                <div className="h-5 w-[1px] bg-white/10 mx-1" />

                {/* Media & Modules */}
                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={openImageModal}
                    className="px-3 h-8 rounded-lg bg-white/5 hover:bg-[#c5a059]/20 hover:text-[#c5a059] text-[#c5a059] border border-[#c5a059]/30 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1.5"
                    title="Insert Image with Caption"
                >
                    🖼️ Add Image
                </button>

                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={insertCTABox}
                    className="px-3 h-8 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#c5a059] text-gray-300 text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1.5"
                    title="Insert Call to Action Block"
                >
                    📢 Add CTA Card
                </button>

                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("insertHorizontalRule")}
                    className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-colors disabled:opacity-30"
                    title="Horizontal Divider"
                >
                    ― HR
                </button>

                <button
                    type="button"
                    disabled={isHtmlMode}
                    onClick={() => exec("removeFormat")}
                    className="px-2.5 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold transition-colors disabled:opacity-30"
                    title="Clear Formatting"
                >
                    🧹 Clean
                </button>

                {/* Source Mode Switcher */}
                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsHtmlMode(!isHtmlMode)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                            isHtmlMode
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                        title="Toggle Visual / HTML Source Mode"
                    >
                        {isHtmlMode ? "👁️ Visual" : "<> HTML"}
                    </button>
                </div>
            </div>

            {/* Editing Canvas */}
            <div className="p-6 md:p-8 min-h-[500px] flex-1 relative">
                {isHtmlMode ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="<p>Write your raw HTML narrative here...</p>"
                        className="w-full h-full min-h-[480px] bg-transparent text-gray-200 font-mono text-sm leading-relaxed outline-none resize-y"
                        spellCheck="false"
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        className="w-full h-full min-h-[480px] outline-none text-gray-200 font-sans text-base md:text-lg leading-relaxed
                            prose prose-invert max-w-none
                            prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:text-[#c5a059] prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-white prose-h3:mt-6 prose-h3:mb-3
                            prose-p:mb-5 prose-p:leading-relaxed
                            prose-a:text-[#c5a059] prose-a:underline hover:prose-a:text-white
                            prose-blockquote:border-l-4 prose-blockquote:border-[#c5a059] prose-blockquote:bg-white/[0.02] prose-blockquote:p-4 prose-blockquote:italic
                            prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
                        style={{ minHeight: "450px" }}
                    />
                )}
            </div>

            {/* Editor Footer / Meta Bar */}
            <div className="bg-[#0c0c0c] border-t border-white/5 px-6 py-2.5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#c5a059]">Rich Visual Engine Active</span>
                </div>
            </div>

            {/* Link Inserter Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">Insert Hyperlink</h3>
                            <button type="button" onClick={() => setShowLinkModal(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={insertLink} className="space-y-4">
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Target URL</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com or /services/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Display Text</label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Link text..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={linkNewTab}
                                    onChange={(e) => setLinkNewTab(e.target.checked)}
                                    className="rounded border-white/20 text-[#c5a059] focus:ring-0"
                                />
                                <span className="text-xs text-gray-400">Open link in new browser tab</span>
                            </label>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs uppercase font-bold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-black font-black uppercase text-xs tracking-wider hover:bg-white transition-colors"
                                >
                                    Apply Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* In-Content Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#c5a059]">Insert Content Image</h3>
                            <button type="button" onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={insertImageContent} className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Image Source URL</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaLibrary(true)}
                                        className="text-[9px] text-[#c5a059] hover:underline font-bold uppercase"
                                    >
                                        🏛️ Open Media Library
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/... or /uploads/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                    required
                                    autoFocus
                                />
                            </div>
                            {imageUrl && (
                                <div className="h-32 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                                    <img src={imageUrl} alt={imageAlt.trim() || imageCaption.trim() || "Content image preview"} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Image Caption (Optional)</label>
                                <input
                                    type="text"
                                    value={imageCaption}
                                    onChange={(e) => setImageCaption(e.target.value)}
                                    placeholder="e.g. Behind the scenes at Tilottama Plaza Studio"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest block mb-1">Alt Text (Crucial for SEO)</label>
                                <input
                                    type="text"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    placeholder="e.g. Drone photography camera setup in Kolkata"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#c5a059]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowImageModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs uppercase font-bold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-black font-black uppercase text-xs tracking-wider hover:bg-white transition-colors"
                                >
                                    Insert Into Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Library Picker */}
            {showMediaLibrary && (
                <MediaLibrary
                    onClose={() => setShowMediaLibrary(false)}
                    onSelect={(url) => {
                        setImageUrl(url);
                        setShowMediaLibrary(false);
                    }}
                />
            )}
        </div>
    );
}
