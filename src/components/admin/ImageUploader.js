"use client";

import { useState, useRef } from "react";
import MediaLibrary from "./MediaLibrary";

export default function ImageUploader({ onUploadSuccess, currentImage, recommendedSize }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showLibrary, setShowLibrary] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_RETRIES = 3;

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

            // Direct FormData upload to VPS backend (AWS S3 bypassed)
            console.log(`[Upload] Attempt ${attempt + 1}/${MAX_RETRIES}: Uploading directly:`, file.name);

            const formData = new FormData();
            formData.append("file", file);

            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded * 100) / e.total);
                        setUploadProgress(percent);
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

                xhr.open("POST", "/api/upload");
                xhr.send(formData);
            });

            // Timeout: 30 minutes for large files
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Upload timed out after 30 minutes"));
                }, 30 * 60 * 1000)
            );

            const result = await Promise.race([uploadPromise, timeoutPromise]);

            // Success
            const publicUrl = result.url;
            console.log("[Upload] Success! Public URL:", publicUrl);
            onUploadSuccess(publicUrl);
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error(`[Upload] Attempt ${attempt + 1} failed:`, err);

            // Don't retry on auth errors
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

    return (
        <div className="space-y-2">
            {recommendedSize && (
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">
                    {recommendedSize}
                </label>
            )}

            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    />
                    <div className={`
                        w-full border-2 border-dashed rounded-2xl flex items-center justify-between p-4 transition-all
                        ${currentImage ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5 hover:border-[#c5a059]/50'}
                        ${isUploading ? 'opacity-50 border-yellow-500/50 bg-yellow-500/5 cursor-wait' : ''}
                        ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                    `}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xl flex-shrink-0">
                                {isUploading ? "⏳" : currentImage ? "✅" : error ? "❌" : "📁"}
                            </span>
                            <div className="text-left overflow-hidden">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isUploading ? 'text-yellow-500' :
                                    currentImage ? 'text-green-500' :
                                        error ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {isUploading
                                        ? `Uploading ${uploadProgress}%`
                                        : error ? "Upload Failed"
                                            : currentImage ? "Asset Linked" : "Choose File"}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-300 rounded-b-2xl" style={{ width: `${uploadProgress}%` }} />
                        )}

                        {/* Preview Area */}
                        {currentImage && !isUploading && (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black flex-shrink-0 relative group/preview">
                                    {currentImage.match(/\.(mp4|webm|ogg|mov)$|video/i) ? (
                                        <video src={currentImage} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={currentImage} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                    <a href={currentImage} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-[8px] text-white font-black uppercase">View</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowLibrary(true)}
                    className="h-[60px] px-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/50 transition-all group"
                    title="Open Media Library"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-[#c5a059]">Vault</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-1">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => { setError(null); fileInputRef.current?.click(); }}
                        className="text-[10px] text-[#c5a059] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {showLibrary && (
                <MediaLibrary
                    onClose={() => setShowLibrary(false)}
                    onSelect={(url) => {
                        onUploadSuccess(url);
                        setShowLibrary(false);
                    }}
                />
            )}
        </div>
    );
}
