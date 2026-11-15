"use client";

import { useState, useRef, useEffect } from "react";
import MediaLibrary from "./MediaLibrary";
import axios from "axios";

export default function ImageUploader({ 
    onUploadSuccess, 
    currentImage, 
    currentAlt = "", 
    onAltChange, 
    recommendedSize, 
    compact = false,
    showAltInput = true,
    contextTitle = "",
    category = "general"
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showLibrary, setShowLibrary] = useState(false);
    const [altText, setAltText] = useState(currentAlt || "");
    const [isSavingAlt, setIsSavingAlt] = useState(false);
    const [isSuggestingAlt, setIsSuggestingAlt] = useState(false);
    const [altSavedMessage, setAltSavedMessage] = useState("");
    const fileInputRef = useRef(null);

    const MAX_RETRIES = 3;

    useEffect(() => {
        if (currentAlt !== undefined) {
            setAltText(currentAlt || "");
        }
    }, [currentAlt]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            setError("Please upload a valid image or video file.");
            return;
        }

        const MAX_SIZE = 500 * 1024 * 1024; // 500MB
        if (file.size > MAX_SIZE) {
            setError("File size exceeds 500MB limit.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);
        setRetryCount(0);

        await attemptUpload(file, 0);
    };

    const attemptUpload = async (file, attempt) => {
        try {
            setRetryCount(attempt);
            if (attempt > 0) {
                setUploadProgress(0);
                setError(null);
            }

            console.log(`[Upload] Attempt ${attempt + 1}/${MAX_RETRIES}: Uploading directly via chunking:`, file.name);

            // Fetch the correct upload URL
            const presignRes = await fetch("/api/upload/presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: file.name, fileType: file.type })
            });
            if (presignRes.status === 401) throw new Error("Session expired. Please log in again.");
            const presignData = await presignRes.json();
            const uploadEndpoint = presignData.uploadUrl || "/api/upload";

            // Chunk settings: 2MB per chunk to bypass Vercel's 4.5MB Serverless limit
            const CHUNK_SIZE = 2 * 1024 * 1024;
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const fileId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            
            let publicUrl = null;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append("chunk", chunk);
                formData.append("fileId", fileId);
                formData.append("chunkIndex", chunkIndex.toString());
                formData.append("totalChunks", totalChunks.toString());
                formData.append("fileName", file.name);
                formData.append("fileType", file.type);

                const chunkPromise = new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener("progress", (e) => {
                        if (e.lengthComputable) {
                            const chunkPercent = (e.loaded / e.total);
                            const overallPercent = Math.round(((chunkIndex + chunkPercent) / totalChunks) * 100);
                            setUploadProgress(overallPercent);
                        }
                    });

                    xhr.addEventListener("load", () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                reject(new Error("Invalid server response"));
                            }
                        } else if (xhr.status === 401) {
                            reject(new Error("Session expired. Please refresh the page and log in again."));
                        } else {
                            console.error("[Upload] Server Error Response:", xhr.responseText);
                            reject(new Error(`Upload failed (Status ${xhr.status})`));
                        }
                    });

                    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
                    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

                    xhr.open("POST", uploadEndpoint);
                    if (presignData.token) {
                        xhr.setRequestHeader("Authorization", `Bearer ${presignData.token}`);
                    }
                    xhr.send(formData);
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Chunk upload timed out")), 5 * 60 * 1000)
                );

                const result = await Promise.race([chunkPromise, timeoutPromise]);
                
                if (chunkIndex === totalChunks - 1) {
                    publicUrl = result.url;
                }
            }

            // Success
            console.log("[Upload] Success! Public URL:", publicUrl);

            // Register asset with auto-generated alt text if not yet set
            if (publicUrl) {
                try {
                    const suggestRes = await axios.post("/api/admin/media/suggest-alt", {
                        url: publicUrl,
                        contextTitle: contextTitle || file.name,
                        category: category || "general"
                    });
                    const initialAlt = altText || suggestRes.data?.suggestedAlt || "";
                    setAltText(initialAlt);
                    if (onAltChange) onAltChange(initialAlt);

                    await axios.post("/api/admin/media", {
                        url: publicUrl,
                        alt: initialAlt,
                        title: contextTitle || file.name,
                        category: category || "general"
                    });
                } catch (e) {
                    console.warn("Asset registration warning:", e);
                }
            }

            onUploadSuccess(publicUrl);
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error(`[Upload] Attempt ${attempt + 1} failed:`, err);
            const isAuthError = err.message?.includes("Session expired") || err.message?.includes("401");

            if (attempt < MAX_RETRIES - 1 && !isAuthError) {
                console.log(`[Upload] Retrying in 2 seconds... (${attempt + 2}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                await attemptUpload(file, attempt + 1);
            } else {
                setError(err.message || "Upload failed. Please try again.");
                setIsUploading(false);
                setUploadProgress(0);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleSuggestAlt = async () => {
        if (!currentImage) return;
        setIsSuggestingAlt(true);
        try {
            const res = await axios.post("/api/admin/media/suggest-alt", {
                url: currentImage,
                contextTitle: contextTitle || "",
                category: category || "general"
            });
            if (res.data?.suggestedAlt) {
                setAltText(res.data.suggestedAlt);
                if (onAltChange) onAltChange(res.data.suggestedAlt);
                setAltSavedMessage("Suggested!");
                setTimeout(() => setAltSavedMessage(""), 2000);
            }
        } catch (e) {
            console.error("Suggest alt error:", e);
        } finally {
            setIsSuggestingAlt(false);
        }
    };

    const handleSaveAltDirect = async () => {
        if (!currentImage) return;
        setIsSavingAlt(true);
        try {
            await axios.put("/api/admin/media", {
                url: currentImage,
                alt: altText.trim(),
                category: category || "general",
                title: contextTitle || ""
            });
            if (onAltChange) onAltChange(altText.trim());
            setAltSavedMessage("Saved ✓");
            setTimeout(() => setAltSavedMessage(""), 2500);
        } catch (e) {
            console.error("Save alt error:", e);
        } finally {
            setIsSavingAlt(false);
        }
    };

    return (
        <div className="space-y-2 w-full">
            {recommendedSize && (
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                    {recommendedSize}
                </label>
            )}

            <div className={`flex ${compact ? "flex-col" : "items-center"} gap-2 w-full`}>
                <div className="flex-1 relative w-full">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    <div className={`
                        w-full border-2 border-dashed rounded-2xl flex items-center justify-between transition-all
                        ${compact ? "p-2" : "p-4"}
                        ${currentImage ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5 hover:border-[#c5a059]/50'}
                        ${isUploading ? 'opacity-50 border-yellow-500/50 bg-yellow-500/5 cursor-wait' : ''}
                        ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                    `}>
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <span className={`${compact ? "text-base" : "text-xl"} flex-shrink-0`}>
                                {isUploading ? "⏳" : currentImage ? "✅" : error ? "❌" : "📁"}
                            </span>
                            <div className="text-left overflow-hidden flex-1">
                                <p className={`font-black uppercase tracking-widest truncate ${compact ? "text-[8px]" : "text-[10px]"} ${isUploading ? 'text-yellow-500' :
                                    currentImage ? 'text-green-500' :
                                        error ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {isUploading
                                        ? `Upload ${uploadProgress}%`
                                        : error ? "Failed"
                                            : currentImage ? "Linked" : "Choose File"}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-300 rounded-b-2xl" style={{ width: `${uploadProgress}%` }} />
                        )}

                        {/* Preview Area */}
                        {currentImage && !isUploading && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`${compact ? "w-8 h-8 rounded-lg" : "w-12 h-12 rounded-xl"} border border-white/10 overflow-hidden bg-black relative group/preview`}>
                                    {currentImage.match(/\.(mp4|webm|ogg|mov)$|video/i) ? (
                                        <video src={currentImage} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={currentImage} className="w-full h-full object-cover" alt={altText || "Image Preview"} />
                                    )}
                                    <a href={currentImage} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-[6px] text-white font-black uppercase">View</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowLibrary(true)}
                    className={`bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-1 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/50 transition-all group shrink-0 ${compact ? "w-full py-2 flex-row" : "h-[60px] px-6 flex-col"}`}
                    title="Open Media Library"
                >
                    <span className={`${compact ? "text-sm" : "text-xl"} group-hover:scale-110 transition-transform`}>🏛️</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-[#c5a059]">Vault</span>
                </button>
            </div>

            {/* Integrated SEO Alt Text Field */}
            {showAltInput && currentImage && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[9px]">
                        <span className="font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <span>🏷️</span> Image Alt Text (SEO &amp; Accessibility)
                        </span>
                        <div className="flex items-center gap-2">
                            {altSavedMessage && (
                                <span className="text-[#c5a059] font-bold uppercase text-[9px] animate-pulse">
                                    {altSavedMessage}
                                </span>
                            )}
                            <span className="text-gray-500 font-mono">
                                {altText.length} chars
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={altText}
                            onChange={(e) => {
                                setAltText(e.target.value);
                                if (onAltChange) onAltChange(e.target.value);
                            }}
                            placeholder="Describe what is visible in the image for Google Image SEO..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#c5a059] outline-none"
                        />
                        <button
                            type="button"
                            disabled={isSuggestingAlt}
                            onClick={handleSuggestAlt}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-black uppercase rounded-lg border border-white/10 transition-all whitespace-nowrap"
                            title="Auto-suggest descriptive alt text"
                        >
                            {isSuggestingAlt ? "..." : "🤖 Suggest"}
                        </button>
                        <button
                            type="button"
                            disabled={isSavingAlt}
                            onClick={handleSaveAltDirect}
                            className="px-3 py-1.5 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white transition-all whitespace-nowrap"
                        >
                            {isSavingAlt ? "..." : "Save"}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-between w-full">
                    <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest pl-1 truncate">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => { setError(null); fileInputRef.current?.click(); }}
                        className="text-[8px] text-[#c5a059] font-black uppercase tracking-widest hover:text-white transition-colors ml-2 shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {showLibrary && (
                <MediaLibrary
                    onClose={() => setShowLibrary(false)}
                    onSelect={(url, alt) => {
                        onUploadSuccess(url);
                        if (alt) {
                            setAltText(alt);
                            if (onAltChange) onAltChange(alt);
                        }
                        setShowLibrary(false);
                    }}
                />
            )}
        </div>
    );
}
