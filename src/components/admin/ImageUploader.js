"use client";

import { useState, useRef } from "react";
import axios from "axios";
import MediaLibrary from "./MediaLibrary";

export default function ImageUploader({ onUploadSuccess, currentImage, recommendedSize }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showLibrary, setShowLibrary] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_RETRIES = 3;
    const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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

            // 1. Get Pre-signed URL
            console.log(`[Upload] Attempt ${attempt + 1}/${MAX_RETRIES}: Getting pre-signed URL for:`, file.name);
            const presignedRes = await fetch("/api/upload/presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                }),
            });

            // Handle non-JSON responses (413, 500 HTML pages, etc.)
            let data;
            const responseText = await presignedRes.text();
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse JSON response:", responseText.substring(0, 200));
                throw new Error(`Server error (Status ${presignedRes.status}). Please try again.`);
            }

            if (!presignedRes.ok) {
                if (presignedRes.status === 401) {
                    throw new Error("Session expired. Please refresh the page and log in again.");
                }
                throw new Error(data.error || `Upload preparation failed (Status ${presignedRes.status})`);
            }

            const { uploadUrl, publicUrl } = data;

            // 2. Direct Upload to S3 with progress
            console.log("[Upload] Uploading to S3...");
            
            // Using XMLHttpRequest for progress tracking since fetch doesn't support it easily yet
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
                        resolve();
                    } else {
                        // S3 returns XML error messages in the body
                        console.error("[Upload] S3 Error Response:", xhr.responseText);
                        reject(new Error(`S3 Upload failed (Status ${xhr.status})`));
                    }
                });

                xhr.addEventListener("error", () => reject(new Error("Network error during S3 upload")));
                xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

                xhr.open("PUT", uploadUrl);
                // CRITICAL: We must ONLY send the Content-Type header to match the pre-signed URL signature
                xhr.setRequestHeader("Content-Type", file.type);
                xhr.send(file);
            });

            // Set a generous timeout (30 minutes for large files)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Upload timed out after 30 minutes"));
                }, 30 * 60 * 1000)
            );

            await Promise.race([uploadPromise, timeoutPromise]);

            // 3. Success
            console.log("[Upload] Success! Public URL:", publicUrl);
            onUploadSuccess(publicUrl);
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error(`[Upload] Attempt ${attempt + 1} failed:`, err);

            // Don't retry on auth errors or specific 403s
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
