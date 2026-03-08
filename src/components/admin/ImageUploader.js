"use client";

import { useState, useRef } from "react";

export default function ImageUploader({ onUploadSuccess, currentImage, recommendedSize }) {
    const [isUploading, setIsUploading] = useState(false);
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

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setError("File size exceeds 50MB limit.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            // Success, send the secure S3 URL back to the parent component form
            onUploadSuccess(data.url);
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be uploaded again if needed
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
                        accept="image/*,video/mp4"
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
                                    {isUploading ? "Uploading..." :
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
