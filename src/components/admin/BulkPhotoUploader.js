"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function BulkPhotoUploader({ onPhotosUploaded, albumTitle = "Wedding Project" }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
    const [statusMessage, setStatusMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleFiles = (filesList) => {
        const filesArray = Array.from(filesList).filter(f => f.type.startsWith("image/"));
        if (filesArray.length === 0) {
            alert("Please select valid image files (JPG, PNG, WebP).");
            return;
        }

        // Generate preview objects
        const previews = filesArray.map(file => ({
            file,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            previewUrl: URL.createObjectURL(file),
            status: "ready" // 'ready' | 'uploading' | 'done' | 'error'
        }));

        setSelectedFiles(prev => [...prev, ...previews]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeSelectedFile = (id) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setStatusMessage("");
        setUploadProgress({ current: 0, total: 0, percent: 0 });
    };

    // Upload single file directly via standard chunking/API
    const uploadSingleFile = async (fileObj) => {
        const file = fileObj.file;
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data?.url) {
                return res.data.url;
            }
            throw new Error(res.data?.error || "Upload failed");
        } catch (err) {
            // Fallback: chunked upload attempt if single-file failed or is large
            console.warn("Direct upload fallback to chunking:", err.message);
            const CHUNK_SIZE = 2 * 1024 * 1024;
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const fileId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            let finalUrl = null;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const cData = new FormData();
                cData.append("chunk", chunk);
                cData.append("fileId", fileId);
                cData.append("chunkIndex", chunkIndex.toString());
                cData.append("totalChunks", totalChunks.toString());
                cData.append("fileName", file.name);
                cData.append("fileType", file.type);

                const chunkRes = await axios.post("/api/upload", cData);
                if (chunkRes.data?.url) {
                    finalUrl = chunkRes.data.url;
                }
            }

            if (finalUrl) return finalUrl;
            throw err;
        }
    };

    const startBulkUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setStatusMessage(`Starting upload of ${selectedFiles.length} photographs...`);
        const uploadedUrls = [];
        const total = selectedFiles.length;

        for (let i = 0; i < total; i++) {
            const item = selectedFiles[i];
            setUploadProgress({
                current: i + 1,
                total,
                percent: Math.round(((i) / total) * 100)
            });
            setStatusMessage(`Uploading photo ${i + 1} of ${total}: ${item.name}...`);

            // Update item state
            setSelectedFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));

            try {
                const url = await uploadSingleFile(item);
                uploadedUrls.push({
                    url,
                    fileName: item.name
                });
                setSelectedFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
            } catch (error) {
                console.error(`Failed to upload ${item.name}:`, error);
                setSelectedFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
            }
        }

        setUploadProgress({ current: total, total, percent: 100 });
        setUploading(false);
        setStatusMessage(`✓ Successfully uploaded ${uploadedUrls.length} of ${total} photographs!`);

        if (uploadedUrls.length > 0 && onPhotosUploaded) {
            onPhotosUploaded(uploadedUrls);
        }

        // Clear finished list after brief delay
        setTimeout(() => {
            setSelectedFiles([]);
        }, 1500);
    };

    return (
        <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                <div>
                    <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.25em]">
                        Bulk Media Ingestion
                    </span>
                    <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight mt-0.5">
                        Upload Photographs to {albumTitle}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                        Browse Files
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) handleFiles(e.target.files);
                            e.target.value = "";
                        }}
                    />
                </div>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                    isDragging
                        ? "border-[#c5a059] bg-[#c5a059]/10 scale-[1.01]"
                        : "border-white/15 hover:border-[#c5a059]/50 bg-white/[0.01]"
                }`}
            >
                <div className="max-w-md mx-auto space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-[#c5a059]">
                        📸
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                            Drag &amp; Drop Unlimited Wedding Photos Here
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Or click anywhere to select multiple high-resolution JPEG, PNG, or WebP images from your computer.
                        </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        Bulk Processing • Auto-WebP Optimized • Max 50MB per frame
                    </span>
                </div>
            </div>

            {/* Staged Previews */}
            {selectedFiles.length > 0 && (
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black uppercase tracking-wider text-gray-300">
                            Staged for Upload ({selectedFiles.length} photos)
                        </span>
                        {!uploading && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-wider"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Thumbnail previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {selectedFiles.map((item) => (
                            <div
                                key={item.id}
                                className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-md"
                            >
                                <img
                                    src={item.previewUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-[9px]">
                                    <p className="text-white truncate font-mono">{item.name}</p>
                                    <span className="text-[#c5a059]">{item.size}</span>
                                </div>

                                {item.status === "uploading" && (
                                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {item.status === "done" && (
                                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                                {item.status === "error" && (
                                    <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                        ✕
                                    </div>
                                )}

                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSelectedFile(item.id);
                                        }}
                                        className="absolute top-1 left-1 w-5 h-5 bg-black/80 hover:bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar & Status */}
                    {uploading && (
                        <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                            <div className="flex justify-between text-[11px] font-black uppercase text-gray-300">
                                <span>{statusMessage}</span>
                                <span className="text-[#c5a059]">{uploadProgress.percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#c5a059] transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                                    style={{ width: `${uploadProgress.percent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {!uploading && (
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={startBulkUpload}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c5a059] text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_25px_rgba(197,160,89,0.3)] active:scale-95"
                            >
                                Upload {selectedFiles.length} Photographs Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
