"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function ImageUploader({ onUploadSuccess, currentImage, recommendedSize }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            setError("Please upload a valid image or video file.");
            return;
        }

        const MAX_SIZE = 500 * 1024 * 1024; // Increased to 500MB for better support
        if (file.size > MAX_SIZE) {
            setError("File size exceeds 500MB limit.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // 1. Get Pre-signed URL
            console.log("Getting pre-signed URL for:", file.name);
            const presignedRes = await fetch("/api/upload/presigned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                }),
            });

            // Improved error handling for non-JSON responses (like 413, 500 HTML pages)
            let data;
            const responseText = await presignedRes.text();
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse JSON response:", responseText);
                throw new Error(`Server returned an invalid response (Status ${presignedRes.status}): ${responseText.substring(0, 100)}...`);
            }

            if (!presignedRes.ok) {
                throw new Error(data.error || `Upload preparation failed with status ${presignedRes.status}`);
            }

            const { uploadUrl, publicUrl } = data;

            // 2. Direct Upload to S3 using Axios for progress tracking
            console.log("Directly uploading to S3...");
            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            // 3. Success
            onUploadSuccess(publicUrl);
        } catch (err) {
            console.error("Upload error details:", err);
            setError(err.message || "An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
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

            <div className="flex items-center gap-4">
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
                                {isUploading ? "⏳" : currentImage ? "✅" : "📁"}
                            </span>
                            <div className="text-left overflow-hidden">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isUploading ? 'text-yellow-500' :
                                    currentImage ? 'text-green-500' :
                                        error ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {isUploading ? `Uploading ${uploadProgress}%` :
                                        error ? "Upload Failed" :
                                            currentImage ? "Asset Linked" : "Choose File"}
                                </p>
                                {currentImage && !isUploading && !error && (
                                    <p className="text-[9px] text-gray-500 font-bold truncate max-w-[120px]">
                                        {currentImage.split('/').pop()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar (Visible during upload) */}
                        {isUploading && (
                            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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
            </div>

            {error && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-1">
                    {error}
                </p>
            )}
        </div>
    );
}

