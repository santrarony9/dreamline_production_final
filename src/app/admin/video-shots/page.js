"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

export default function VideoShotsAdmin() {
    const [activeTab, setActiveTab] = useState("DASHBOARD"); // "DASHBOARD" | "SERVICES" | "VIDEOS" | "SHOTS" | "MEDIA"
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: "", type: "success" });

    // Stats
    const [stats, setStats] = useState(null);

    // Data lists
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [videos, setVideos] = useState([]);
    const [shots, setShots] = useState([]);
    const [mediaAssets, setMediaAssets] = useState([]);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedService, setSelectedService] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedShotType, setSelectedShotType] = useState("ALL");
    const [selectedVideoFilter, setSelectedVideoFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [serviceModal, setServiceModal] = useState({ open: false, isEdit: false, data: null });
    const [videoModal, setVideoModal] = useState({ open: false, isEdit: false, data: null });
    const [shotModal, setShotModal] = useState({ open: false, isEdit: false, data: null });
    const [bulkShotModal, setBulkShotModal] = useState({ open: false, serviceSlug: "", category: "", videoId: "", files: [], uploading: false });
    const [previewVideoModal, setPreviewVideoModal] = useState({ open: false, url: "", title: "", ytId: "" });
    const [previewImageModal, setPreviewImageModal] = useState({ open: false, url: "", title: "" });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", warning: false, onConfirm: null });

    // Form states
    const [serviceForm, setServiceForm] = useState({
        title: "",
        category: "WEDDING",
        slug: "",
        oldSlug: "",
        shortDescription: "",
        description: "",
        heroImage: "",
        order: 1,
        seoTitle: "",
        metaDescription: "",
        isPublished: true
    });

    const [videoForm, setVideoForm] = useState({
        title: "",
        youtubeUrl: "",
        customThumbnail: "",
        category: "WEDDING",
        serviceSlug: "",
        oldServiceSlug: "",
        description: "",
        videoType: "standard",
        tag: "4K Cinematic",
        isFeatured: false,
        order: 1,
        isPublished: true,
        status: "published"
    });

    const [shotForm, setShotForm] = useState({
        title: "",
        imageUrl: "",
        category: "WEDDING",
        serviceSlug: "",
        oldServiceSlug: "",
        videoId: "",
        description: "",
        shotType: "candid",
        aspectRatio: "16:9",
        isFeatured: false,
        order: 1,
        isPublished: true,
        status: "published"
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    // Toast helper
    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4500);
    }, []);

    // Extract YouTube ID helper
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.trim().match(regExp);
        if (match && match[2].length === 11) return match[2];
        if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
        return null;
    };

    // Load Initial Data
    const loadAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, svcRes, catRes, vidRes, shotRes] = await Promise.all([
                axios.get("/api/admin/video-shots-stats"),
                axios.get("/api/admin/services"),
                axios.get("/api/admin/services/categories"),
                axios.get("/api/admin/videos"),
                axios.get("/api/admin/shots")
            ]);

            setStats(statsRes.data);
            setServices(svcRes.data.services || []);
            setCategories(catRes.data.categories || []);
            setVideos(vidRes.data.videos || []);
            setShots(shotRes.data.shots || []);
        } catch (err) {
            console.error("Failed to load management data:", err);
            showToast("Failed to load data. Please verify your connection.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // Load media library assets on demand
    const loadMediaLibrary = async () => {
        try {
            const res = await axios.get("/api/admin/media-library");
            setMediaAssets(res.data.assets || []);
        } catch (err) {
            console.error("Failed to load media assets:", err);
            showToast("Failed to load media assets", "error");
        }
    };

    useEffect(() => {
        if (activeTab === "MEDIA") {
            loadMediaLibrary();
        }
    }, [activeTab]);

    // ─── FILTERED LISTS ───
    const filteredServices = useMemo(() => {
        return services.filter(svc => {
            const matchesCat = selectedCategory === "ALL" || svc.category?.toUpperCase() === selectedCategory.toUpperCase();
            const matchesSearch = !searchQuery || svc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || svc.slug?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [services, selectedCategory, searchQuery]);

    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchesCat = selectedCategory === "ALL" || v.category?.toUpperCase() === selectedCategory.toUpperCase();
            const matchesSvc = selectedService === "ALL" || v.serviceSlug === selectedService;
            const matchesStatus = selectedStatus === "ALL" || (selectedStatus === "published" ? v.isPublished : !v.isPublished);
            const matchesSearch = !searchQuery || v.title?.toLowerCase().includes(searchQuery.toLowerCase()) || v.youtubeId?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSvc && matchesStatus && matchesSearch;
        });
    }, [videos, selectedCategory, selectedService, selectedStatus, searchQuery]);

    const filteredShots = useMemo(() => {
        return shots.filter(s => {
            const matchesCat = selectedCategory === "ALL" || s.category?.toUpperCase() === selectedCategory.toUpperCase();
            const matchesSvc = selectedService === "ALL" || s.serviceSlug === selectedService;
            const matchesType = selectedShotType === "ALL" || s.shotType === selectedShotType;
            const matchesVideo = selectedVideoFilter === "ALL" || s.videoId === selectedVideoFilter;
            const matchesStatus = selectedStatus === "ALL" || (selectedStatus === "published" ? s.isPublished : !s.isPublished);
            const matchesSearch = !searchQuery || s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSvc && matchesType && matchesVideo && matchesStatus && matchesSearch;
        });
    }, [shots, selectedCategory, selectedService, selectedShotType, selectedVideoFilter, selectedStatus, searchQuery]);

    // ─── SINGLE / BULK IMAGE UPLOADER HANDLER ───
    const handleFileUpload = async (files, onComplete) => {
        if (!files || files.length === 0) return;
        setUploadingImage(true);
        try {
            const formData = new FormData();
            if (files.length === 1) {
                formData.append("file", files[0]);
            } else {
                for (let i = 0; i < files.length; i++) {
                    formData.append("files", files[i]);
                }
            }

            const res = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                showToast(`Uploaded ${res.data.count || 1} file(s) successfully!`);
                if (onComplete) onComplete(res.data);
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Upload failed: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setUploadingImage(false);
        }
    };

    // ─── SERVICE ACTIONS ───
    const handleOpenServiceModal = (svc = null) => {
        if (svc) {
            setServiceForm({
                _id: svc._id,
                title: svc.title || "",
                category: svc.category || "WEDDING",
                slug: svc.slug || "",
                oldSlug: svc.slug || "",
                shortDescription: svc.shortDescription || svc.subtitle || "",
                description: svc.description || "",
                heroImage: svc.heroImage || "",
                order: svc.order || 1,
                seoTitle: svc.seoTitle || "",
                metaDescription: svc.metaDescription || "",
                isPublished: svc.isPublished !== false
            });
            setServiceModal({ open: true, isEdit: true, data: svc });
        } else {
            setServiceForm({
                title: "",
                category: selectedCategory !== "ALL" ? selectedCategory : "WEDDING",
                slug: "",
                oldSlug: "",
                shortDescription: "",
                description: "",
                heroImage: "",
                order: services.length + 1,
                seoTitle: "",
                metaDescription: "",
                isPublished: true
            });
            setServiceModal({ open: true, isEdit: false, data: null });
        }
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/admin/services", serviceForm);
            if (res.data.success) {
                showToast(`Service "${serviceForm.title}" saved successfully!`);
                setServiceModal({ open: false, isEdit: false, data: null });
                loadAllData();
            }
        } catch (err) {
            console.error("Save service error:", err);
            showToast("Failed to save service: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleDeleteService = (svc) => {
        setConfirmModal({
            open: true,
            title: `Delete Service "${svc.title}"?`,
            message: `Are you sure you want to delete this service? This will inspect attached videos and shots.`,
            warning: svc.videoCount > 0 || svc.shotCount > 0,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`/api/admin/services?slug=${svc.slug}&force=false`);
                    showToast(res.data.message);
                    setConfirmModal({ open: false, title: "", message: "", warning: false, onConfirm: null });
                    loadAllData();
                } catch (err) {
                    if (err.response?.status === 409 && err.response?.data?.warning) {
                        // Needs force confirmation
                        if (window.confirm(`${err.response.data.message}\n\nClick OK to FORCE DELETE this service and all its associated content.`)) {
                            try {
                                const forceRes = await axios.delete(`/api/admin/services?slug=${svc.slug}&force=true`);
                                showToast(forceRes.data.message);
                                setConfirmModal({ open: false, title: "", message: "", warning: false, onConfirm: null });
                                loadAllData();
                            } catch (fErr) {
                                showToast("Force delete failed: " + (fErr.response?.data?.error || fErr.message), "error");
                            }
                        }
                    } else {
                        showToast("Delete failed: " + (err.response?.data?.error || err.message), "error");
                    }
                }
            }
        });
    };

    // ─── VIDEO ACTIONS ───
    const handleOpenVideoModal = (video = null) => {
        if (video) {
            setVideoForm({
                _id: video._id,
                title: video.title || "",
                youtubeUrl: video.youtubeUrl || "",
                customThumbnail: video.customThumbnail || "",
                category: video.category || "WEDDING",
                serviceSlug: video.serviceSlug || "",
                oldServiceSlug: video.serviceSlug || "",
                description: video.description || "",
                videoType: video.videoType || "standard",
                tag: video.tag || "4K Cinematic",
                isFeatured: Boolean(video.isFeatured),
                order: video.order !== undefined ? video.order : 1,
                isPublished: video.isPublished !== false,
                status: video.status || "published"
            });
            setVideoModal({ open: true, isEdit: true, data: video });
        } else {
            const defaultSvc = selectedService !== "ALL" ? selectedService : (services[0]?.slug || "wedding-photography-kolkata");
            const svcObj = services.find(s => s.slug === defaultSvc);
            const currentVidsForSvc = videos.filter(v => v.serviceSlug === defaultSvc);

            setVideoForm({
                title: "",
                youtubeUrl: "",
                customThumbnail: "",
                category: svcObj?.category || "WEDDING",
                serviceSlug: defaultSvc,
                oldServiceSlug: defaultSvc,
                description: "",
                videoType: "standard",
                tag: "4K Cinematic",
                isFeatured: false,
                order: currentVidsForSvc.length + 1,
                isPublished: true,
                status: "published"
            });
            setVideoModal({ open: true, isEdit: false, data: null });
        }
    };

    const handleSaveVideo = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/admin/videos", videoForm);
            if (res.data.success) {
                showToast(`Video "${videoForm.title}" saved & synchronized with frontend!`);
                setVideoModal({ open: false, isEdit: false, data: null });
                loadAllData();
            }
        } catch (err) {
            console.error("Save video error:", err);
            showToast("Failed to save video: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleDeleteVideo = (video) => {
        setConfirmModal({
            open: true,
            title: `Delete Video?`,
            message: `Are you sure you want to delete "${video.title}" from "${video.serviceSlug}"? It will be immediately removed from the frontend.`,
            warning: false,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`/api/admin/videos?id=${video._id}`);
                    showToast(res.data.message);
                    setConfirmModal({ open: false, title: "", message: "", warning: false, onConfirm: null });
                    loadAllData();
                } catch (err) {
                    showToast("Delete failed: " + (err.response?.data?.error || err.message), "error");
                }
            }
        });
    };

    const handleDuplicateVideo = async (video) => {
        try {
            const duplicated = {
                title: `${video.title} (Copy)`,
                youtubeUrl: video.youtubeUrl,
                customThumbnail: video.customThumbnail,
                category: video.category,
                serviceSlug: video.serviceSlug,
                description: video.description,
                videoType: video.videoType,
                tag: video.tag,
                isFeatured: false,
                order: (video.order || 0) + 1,
                isPublished: true,
                status: "published"
            };
            const res = await axios.post("/api/admin/videos", duplicated);
            if (res.data.success) {
                showToast(`Duplicated video "${video.title}" successfully!`);
                loadAllData();
            }
        } catch (err) {
            showToast("Failed to duplicate video: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleMoveVideoOrder = async (video, direction) => {
        const currentServiceVideos = videos
            .filter(v => v.serviceSlug === video.serviceSlug)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const index = currentServiceVideos.findIndex(v => v._id === video._id);
        if (index === -1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentServiceVideos.length) return;

        const updated = [...currentServiceVideos];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        const items = updated.map((v, idx) => ({ _id: v._id, order: idx + 1 }));

        try {
            await axios.put("/api/admin/videos", { items, serviceSlug: video.serviceSlug });
            showToast("Video order updated!");
            loadAllData();
        } catch (err) {
            showToast("Failed to update video order", "error");
        }
    };

    const handleToggleVideoPublish = async (video) => {
        try {
            const updated = {
                ...video,
                isPublished: !video.isPublished,
                status: !video.isPublished ? "published" : "draft"
            };
            await axios.post("/api/admin/videos", updated);
            showToast(`Video "${video.title}" is now ${updated.isPublished ? 'Published' : 'Draft'}!`);
            loadAllData();
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    // ─── SHOT ACTIONS ───
    const handleOpenShotModal = (shot = null) => {
        if (shot) {
            setShotForm({
                _id: shot._id,
                title: shot.title || "",
                imageUrl: shot.imageUrl || "",
                category: shot.category || "WEDDING",
                serviceSlug: shot.serviceSlug || "",
                oldServiceSlug: shot.serviceSlug || "",
                videoId: shot.videoId || "",
                description: shot.description || "",
                shotType: shot.shotType || "candid",
                aspectRatio: shot.aspectRatio || "16:9",
                isFeatured: Boolean(shot.isFeatured),
                order: shot.order !== undefined ? shot.order : 1,
                isPublished: shot.isPublished !== false,
                status: shot.status || "published"
            });
            setShotModal({ open: true, isEdit: true, data: shot });
        } else {
            const defaultSvc = selectedService !== "ALL" ? selectedService : (services[0]?.slug || "wedding-photography-kolkata");
            const svcObj = services.find(s => s.slug === defaultSvc);
            const currentShotsForSvc = shots.filter(s => s.serviceSlug === defaultSvc);

            setShotForm({
                title: "",
                imageUrl: "",
                category: svcObj?.category || "WEDDING",
                serviceSlug: defaultSvc,
                oldServiceSlug: defaultSvc,
                videoId: "",
                description: "",
                shotType: "candid",
                aspectRatio: "16:9",
                isFeatured: false,
                order: currentShotsForSvc.length + 1,
                isPublished: true,
                status: "published"
            });
            setShotModal({ open: true, isEdit: false, data: null });
        }
    };

    const handleSaveShot = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/admin/shots", shotForm);
            if (res.data.success) {
                showToast(`Shot "${shotForm.title}" saved & gallery synchronized!`);
                setShotModal({ open: false, isEdit: false, data: null });
                loadAllData();
            }
        } catch (err) {
            console.error("Save shot error:", err);
            showToast("Failed to save shot: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleDeleteShot = (shot) => {
        setConfirmModal({
            open: true,
            title: `Delete Shot?`,
            message: `Are you sure you want to delete shot "${shot.title}" from "${shot.serviceSlug}"?`,
            warning: false,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`/api/admin/shots?id=${shot._id}`);
                    showToast(res.data.message);
                    setConfirmModal({ open: false, title: "", message: "", warning: false, onConfirm: null });
                    loadAllData();
                } catch (err) {
                    showToast("Delete failed: " + (err.response?.data?.error || err.message), "error");
                }
            }
        });
    };

    const handleMoveShotOrder = async (shot, direction) => {
        const currentServiceShots = shots
            .filter(s => s.serviceSlug === shot.serviceSlug)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const index = currentServiceShots.findIndex(s => s._id === shot._id);
        if (index === -1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentServiceShots.length) return;

        const updated = [...currentServiceShots];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        const items = updated.map((s, idx) => ({ _id: s._id, order: idx + 1 }));

        try {
            await axios.put("/api/admin/shots", { items, serviceSlug: shot.serviceSlug });
            showToast("Shot order updated!");
            loadAllData();
        } catch (err) {
            showToast("Failed to update shot order", "error");
        }
    };

    const handleToggleShotPublish = async (shot) => {
        try {
            const updated = {
                ...shot,
                isPublished: !shot.isPublished,
                status: !shot.isPublished ? "published" : "draft"
            };
            await axios.post("/api/admin/shots", updated);
            showToast(`Shot "${shot.title}" is now ${updated.isPublished ? 'Published' : 'Draft'}!`);
            loadAllData();
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    // ─── BULK SHOT SUBMIT ───
    const handleBulkShotSubmit = async (e) => {
        e.preventDefault();
        if (!bulkShotModal.serviceSlug) {
            showToast("Please select a target service", "error");
            return;
        }
        if (!bulkShotModal.files || bulkShotModal.files.length === 0) {
            showToast("Please choose at least one image file", "error");
            return;
        }

        setBulkShotModal(prev => ({ ...prev, uploading: true }));
        try {
            // 1. Upload all files
            const formData = new FormData();
            for (let i = 0; i < bulkShotModal.files.length; i++) {
                formData.append("files", bulkShotModal.files[i]);
            }

            const uploadRes = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (!uploadRes.data.success || !uploadRes.data.urls) {
                throw new Error(uploadRes.data.error || "Upload failed");
            }

            // 2. Create batch shots
            const createdShotsData = uploadRes.data.files.map((fileInfo, idx) => ({
                title: fileInfo.originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
                imageUrl: fileInfo.url,
                thumbnailUrl: fileInfo.url,
                shotType: "candid",
                description: `High resolution capture from ${bulkShotModal.serviceSlug}`,
                videoId: bulkShotModal.videoId || null,
                order: idx + 1
            }));

            const bulkRes = await axios.post("/api/admin/shots", {
                bulk: true,
                serviceSlug: bulkShotModal.serviceSlug,
                category: bulkShotModal.category || "WEDDING",
                videoId: bulkShotModal.videoId || null,
                shots: createdShotsData
            });

            if (bulkRes.data.success) {
                showToast(bulkRes.data.message);
                setBulkShotModal({ open: false, serviceSlug: "", category: "", videoId: "", files: [], uploading: false });
                loadAllData();
            }
        } catch (err) {
            console.error("Bulk upload error:", err);
            showToast("Bulk upload failed: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setBulkShotModal(prev => ({ ...prev, uploading: false }));
        }
    };

    // ─── MEDIA ASSET DELETE ───
    const handleDeleteMediaAsset = async (asset) => {
        try {
            const res = await axios.delete(`/api/admin/media-library?url=${encodeURIComponent(asset.url)}&force=false`);
            showToast(res.data.message);
            loadMediaLibrary();
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.warning) {
                if (window.confirm(`${err.response.data.message}`)) {
                    try {
                        const forceRes = await axios.delete(`/api/admin/media-library?url=${encodeURIComponent(asset.url)}&force=true`);
                        showToast(forceRes.data.message);
                        loadMediaLibrary();
                    } catch (fErr) {
                        showToast("Force delete failed: " + (fErr.response?.data?.error || fErr.message), "error");
                    }
                }
            } else {
                showToast("Delete failed: " + (err.response?.data?.error || err.message), "error");
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-[#050505] min-h-screen text-white flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-xs uppercase font-black tracking-widest text-[#c5a059]">
                        Loading Video &amp; Shot CMS...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#050505] min-h-screen text-white p-4 sm:p-6 md:p-10">
            {/* Top Notification Toast */}
            {toast.message && (
                <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    toast.type === "error" ? "bg-red-950/95 border-red-500/40 text-red-200" : "bg-[#0e0e0e]/95 border-[#c5a059]/50 text-[#c5a059]"
                }`}>
                    <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* ─── MODULE HEADER ─── */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
                                Live Database CMS
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                Dreamline Production Studio
                            </span>
                        </div>
                        <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                            Video &amp; <span className="text-[#c5a059]">Shot Management.</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                            Control every service, 4K cinema film, YouTube reel, and photograph gallery across the website.
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleOpenServiceModal()}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider border border-white/10 transition-all flex items-center gap-1.5"
                        >
                            <span>+</span>
                            <span>New Service</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenVideoModal()}
                            className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
                        >
                            <span>+</span>
                            <span>Add Video</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBulkShotModal({ open: true, serviceSlug: services[0]?.slug || "", category: "WEDDING", videoId: "", files: [], uploading: false })}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#c5a059] text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all border border-white/20 flex items-center gap-1.5"
                        >
                            <span>📷</span>
                            <span>Upload Shots</span>
                        </button>
                    </div>
                </header>

                {/* ─── ANALYTICS STATS OVERVIEW CARDS ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Services</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-white font-heading">{stats?.totalServices || services.length}</span>
                            <span className="text-[10px] text-[#c5a059] font-bold">{stats?.publishedServices || services.length} Pub</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Total Videos</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-[#c5a059] font-heading">{stats?.totalVideos || videos.length}</span>
                            <span className="text-[10px] text-green-400 font-bold">{stats?.publishedVideos || videos.length} Pub</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Total Shots</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-purple-300 font-heading">{stats?.totalShots || shots.length}</span>
                            <span className="text-[10px] text-green-400 font-bold">{stats?.publishedShots || shots.length} Pub</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Draft Content</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-gray-300 font-heading">
                                {(stats?.draftVideos || 0) + (stats?.draftShots || 0)}
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">Drafts</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Categories</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-white font-heading">{categories.length || 6}</span>
                            <span className="text-[10px] text-gray-400 font-bold">Groups</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Status</span>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-black uppercase text-green-400">Connected</span>
                        </div>
                    </div>
                </div>

                {/* ─── NAVIGATION TABS ─── */}
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("DASHBOARD")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === "DASHBOARD"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <span>📊</span>
                        <span>Overview</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("SERVICES")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === "SERVICES"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <span>🗂️</span>
                        <span>1. Service Management ({services.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("VIDEOS")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === "VIDEOS"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <span>🎬</span>
                        <span>2. Video Management ({videos.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("SHOTS")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === "SHOTS"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <span>📷</span>
                        <span>3. Shot Management ({shots.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("MEDIA")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === "MEDIA"
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <span>🖼️</span>
                        <span>Central Media Library</span>
                    </button>
                </div>

                {/* ─── UNIVERSAL FILTER BAR (FOR SERVICES, VIDEOS & SHOTS) ─── */}
                {activeTab !== "DASHBOARD" && activeTab !== "MEDIA" && (
                    <div className="bg-[#0b0b0b] border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, URL or ID..."
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#c5a059]"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedService("ALL");
                                }}
                                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#c5a059]"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="WEDDING">WEDDING</option>
                                <option value="CORPORATE">CORPORATE</option>
                                <option value="DRONE & AERIAL">DRONE &amp; AERIAL</option>
                                <option value="SOCIAL">SOCIAL</option>
                                <option value="TECH">TECH</option>
                                <option value="EVENT MANAGEMENT">EVENT MANAGEMENT</option>
                            </select>

                            {/* Service Filter (for Videos and Shots) */}
                            {(activeTab === "VIDEOS" || activeTab === "SHOTS") && (
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#c5a059] max-w-[220px]"
                                >
                                    <option value="ALL">All Services</option>
                                    {services
                                        .filter(s => selectedCategory === "ALL" || s.category?.toUpperCase() === selectedCategory.toUpperCase())
                                        .map((s, idx) => (
                                            <option key={idx} value={s.slug}>
                                                {s.title}
                                            </option>
                                        ))}
                                </select>
                            )}

                            {/* Shot Type Filter */}
                            {activeTab === "SHOTS" && (
                                <select
                                    value={selectedShotType}
                                    onChange={(e) => setSelectedShotType(e.target.value)}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#c5a059]"
                                >
                                    <option value="ALL">All Shot Types</option>
                                    <option value="candid">Candid</option>
                                    <option value="ritual">Ritual</option>
                                    <option value="portrait">Portrait</option>
                                    <option value="cinematic-frame">Cinematic Frame</option>
                                    <option value="aerial">Aerial</option>
                                    <option value="detail">Detail</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            )}

                            {/* Status Filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#c5a059]"
                            >
                                <option value="ALL">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Drafts</option>
                            </select>
                        </div>

                        {/* Reset Filters */}
                        {(selectedCategory !== "ALL" || selectedService !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory("ALL");
                                    setSelectedService("ALL");
                                    setSelectedStatus("ALL");
                                    setSelectedShotType("ALL");
                                    setSearchQuery("");
                                }}
                                className="text-[10px] uppercase font-black tracking-wider text-gray-400 hover:text-white"
                            >
                                Reset Filters ↺
                            </button>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 0: DASHBOARD OVERVIEW & RECENT CONTENT
                   ══════════════════════════════════════════════════════════════ */}
                {activeTab === "DASHBOARD" && (
                    <div className="space-y-10">
                        {/* Structure Quick Jump */}
                        <div className="bg-[#0b0b0b] border border-white/10 p-6 rounded-3xl space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <div>
                                    <h3 className="font-heading text-lg font-black uppercase text-white tracking-tight">
                                        Core Service Categories &amp; Structure
                                    </h3>
                                    <p className="text-gray-400 text-xs">Direct links to manage content across each sector</p>
                                </div>
                                <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                                    6 Sectors
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((cat, cIdx) => {
                                    const catServices = services.filter(s => s.category?.toUpperCase() === cat.name?.toUpperCase());
                                    const catVideoCount = catServices.reduce((sum, s) => sum + (s.videoCount || 0), 0);
                                    const catShotCount = catServices.reduce((sum, s) => sum + (s.shotCount || 0), 0);

                                    return (
                                        <div key={cIdx} className="bg-black/60 border border-white/10 p-5 rounded-2xl space-y-3 hover:border-[#c5a059]/40 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black uppercase text-[#c5a059] tracking-wider">
                                                    {cat.name}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold">
                                                    {catServices.length} Services
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                {cat.description || "Production & photography specialty"}
                                            </p>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 pt-2 border-t border-white/5">
                                                <span>🎬 {catVideoCount} Videos</span>
                                                <span>•</span>
                                                <span>📷 {catShotCount} Shots</span>
                                            </div>
                                            <div className="pt-2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(cat.name);
                                                        setActiveTab("SERVICES");
                                                    }}
                                                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[10px] font-black uppercase tracking-wider transition-all text-center"
                                                >
                                                    Manage Services →
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(cat.name);
                                                        setActiveTab("VIDEOS");
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    Videos
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Videos & Recent Shots */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recently Added Videos */}
                            <div className="bg-[#0b0b0b] border border-white/10 p-6 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <h3 className="font-heading text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                        <span>🎬</span>
                                        <span>Recently Added Videos</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("VIDEOS")}
                                        className="text-[10px] text-[#c5a059] font-black uppercase tracking-widest hover:underline"
                                    >
                                        View All ({videos.length}) →
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {videos.slice(0, 5).map((v, vIdx) => (
                                        <div key={vIdx} className="flex items-center gap-3 p-2.5 rounded-xl bg-black border border-white/5 hover:border-white/20 transition-all">
                                            <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                                <img
                                                    src={v.customThumbnail || v.thumbnail || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                                                    alt={v.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate">{v.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-[#c5a059] uppercase">{v.category}</span>
                                                    <span className="text-[9px] text-gray-500">•</span>
                                                    <span className="text-[9px] text-gray-400 truncate">{v.serviceSlug}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewVideoModal({ open: true, url: v.youtubeUrl, title: v.title, ytId: v.youtubeId })}
                                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[10px] font-bold"
                                            >
                                                ▶ Play
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recently Added Shots */}
                            <div className="bg-[#0b0b0b] border border-white/10 p-6 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <h3 className="font-heading text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                        <span>📷</span>
                                        <span>Recently Added Shots</span>
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("SHOTS")}
                                        className="text-[10px] text-purple-300 font-black uppercase tracking-widest hover:underline"
                                    >
                                        View All ({shots.length}) →
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {shots.slice(0, 5).map((s, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-3 p-2.5 rounded-xl bg-black border border-white/5 hover:border-white/20 transition-all">
                                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                                                <img
                                                    src={s.imageUrl}
                                                    alt={s.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-purple-300 uppercase">{s.shotType}</span>
                                                    <span className="text-[9px] text-gray-500">•</span>
                                                    <span className="text-[9px] text-gray-400 truncate">{s.serviceSlug}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewImageModal({ open: true, url: s.imageUrl, title: s.title })}
                                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600 text-gray-300 hover:text-white text-[10px] font-bold"
                                            >
                                                🔍 View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 1: SERVICE MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                {activeTab === "SERVICES" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase font-heading text-white">
                                    All Service Pages ({filteredServices.length})
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Create and configure service endpoints, SEO titles, descriptions, and linked media.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpenServiceModal()}
                                className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>Add New Service</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((svc) => (
                                <div
                                    key={svc._id}
                                    className="bg-[#0b0b0b] border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a059]/50 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Hero Preview */}
                                        <div className="relative aspect-[16/9] w-full bg-neutral-900 border-b border-white/5">
                                            {svc.heroImage ? (
                                                <img
                                                    src={svc.heroImage}
                                                    alt={svc.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                                    <span className="text-2xl">🖼️</span>
                                                    <span className="text-[10px] font-bold uppercase mt-1">No Hero Image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#c5a059] border border-[#c5a059]/30">
                                                    {svc.category || "GENERAL"}
                                                </span>
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    svc.isPublished !== false ? "bg-green-950/80 text-green-400 border border-green-500/30" : "bg-red-950/80 text-red-400 border border-red-500/30"
                                                }`}>
                                                    {svc.isPublished !== false ? "Published" : "Draft"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-heading text-lg font-bold uppercase text-white line-clamp-1">
                                                    {svc.title}
                                                </h3>
                                            </div>
                                            <p className="text-[11px] font-mono text-gray-500 truncate">
                                                /services/{svc.slug}/
                                            </p>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                {svc.shortDescription || svc.description || "Cinematic production services by Dreamline."}
                                            </p>

                                            {/* Media Counts */}
                                            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedService(svc.slug);
                                                        setActiveTab("VIDEOS");
                                                    }}
                                                    className="text-[#c5a059] hover:underline flex items-center gap-1"
                                                >
                                                    <span>🎬</span>
                                                    <span>{svc.videoCount || 0} Videos</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedService(svc.slug);
                                                        setActiveTab("SHOTS");
                                                    }}
                                                    className="text-purple-300 hover:underline flex items-center gap-1"
                                                >
                                                    <span>📷</span>
                                                    <span>{svc.shotCount || 0} Shots</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-4 bg-black/50 border-t border-white/5 flex items-center justify-between gap-2">
                                        <a
                                            href={`/services/${svc.slug}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold uppercase"
                                        >
                                            Live Page ↗
                                        </a>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenServiceModal(svc)}
                                                className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 text-[10px] font-black uppercase transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteService(svc)}
                                                className="px-2.5 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/20 text-[10px] font-black uppercase transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 2: VIDEO MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                {activeTab === "VIDEOS" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase font-heading text-white">
                                    Video Library ({filteredVideos.length})
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Manage 4K cinematic films, YouTube reels, thumbnails, and service placements.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpenVideoModal()}
                                className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>Add New Video</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video) => (
                                <div
                                    key={video._id}
                                    className="bg-[#0b0b0b] border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a059]/50 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* 16:9 Thumbnail with Click-to-Play Preview */}
                                        <div
                                            className="relative aspect-video w-full bg-black cursor-pointer group"
                                            onClick={() => setPreviewVideoModal({ open: true, url: video.youtubeUrl, title: video.title, ytId: video.youtubeId })}
                                        >
                                            <img
                                                src={video.customThumbnail || video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                            />
                                            {/* Centered Golden Play Button */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-[#c5a059] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <span className="translate-x-0.5 font-bold">▶</span>
                                                </div>
                                            </div>
                                            {/* Format pill */}
                                            <div className="absolute bottom-2.5 right-2.5">
                                                <span className="px-2 py-0.5 rounded bg-black/80 text-[9px] font-black text-[#c5a059] uppercase border border-white/10">
                                                    {video.videoType === 'shorts' ? '9:16 Shorts' : '16:9 Cinema'}
                                                </span>
                                            </div>
                                            {/* Status Badge */}
                                            <div className="absolute top-2.5 left-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    video.isPublished !== false ? "bg-green-950/80 text-green-400 border border-green-500/30" : "bg-red-950/80 text-red-400 border border-red-500/30"
                                                }`}>
                                                    {video.isPublished !== false ? "Published" : "Draft"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="p-4 sm:p-5 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="px-2.5 py-0.5 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[9px] font-black uppercase text-[#c5a059]">
                                                    {video.category}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold truncate">
                                                    /{video.serviceSlug}/
                                                </span>
                                            </div>

                                            <h3 className="font-heading text-sm sm:text-base font-bold uppercase text-white line-clamp-2 min-h-[2.5rem]">
                                                {video.title}
                                            </h3>

                                            <p className="text-[10px] font-mono text-gray-500 truncate">
                                                ID: {video.youtubeId}
                                            </p>

                                            {/* Reorder Buttons & Status Toggle */}
                                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-500 font-bold mr-1">Order: {video.order || 0}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveVideoOrder(video, "up")}
                                                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold"
                                                        title="Move Up"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveVideoOrder(video, "down")}
                                                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold"
                                                        title="Move Down"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleVideoPublish(video)}
                                                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                                                        video.isPublished !== false
                                                            ? "bg-green-950/40 text-green-400 hover:bg-red-950/40 hover:text-red-300"
                                                            : "bg-red-950/40 text-red-400 hover:bg-green-950/40 hover:text-green-300"
                                                    }`}
                                                >
                                                    {video.isPublished !== false ? "Live" : "Draft"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleDuplicateVideo(video)}
                                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[10px] font-bold uppercase"
                                            title="Duplicate Video Entry"
                                        >
                                            Duplicate
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenVideoModal(video)}
                                                className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 text-[10px] font-black uppercase transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteVideo(video)}
                                                className="px-2.5 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/20 text-[10px] font-black uppercase transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 3: SHOT MANAGEMENT
                   ══════════════════════════════════════════════════════════════ */}
                {activeTab === "SHOTS" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <h2 className="text-xl font-black uppercase font-heading text-white">
                                    Photography Shots &amp; Film Frames ({filteredShots.length})
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Manage individual stills, client photos, and visual shots extracted from video footage.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenShotModal()}
                                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <span>+</span>
                                    <span>Single Shot</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBulkShotModal({ open: true, serviceSlug: selectedService !== "ALL" ? selectedService : (services[0]?.slug || ""), category: selectedCategory !== "ALL" ? selectedCategory : "WEDDING", videoId: "", files: [], uploading: false })}
                                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                                >
                                    <span>📷</span>
                                    <span>Bulk Upload Shots</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredShots.map((shot) => (
                                <div
                                    key={shot._id}
                                    className="bg-[#0b0b0b] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Image Frame with Lightbox Zoom */}
                                        <div
                                            className="relative aspect-square w-full bg-black cursor-pointer overflow-hidden"
                                            onClick={() => setPreviewImageModal({ open: true, url: shot.imageUrl, title: shot.title })}
                                        >
                                            <img
                                                src={shot.thumbnailUrl || shot.imageUrl}
                                                alt={shot.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Hover Zoom Icon */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm">
                                                    🔍
                                                </span>
                                            </div>
                                            {/* Shot Type Tag */}
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
                                                    {shot.shotType || "STILL"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="p-3 space-y-2">
                                            <h4 className="font-heading text-xs font-bold uppercase text-white truncate" title={shot.title}>
                                                {shot.title}
                                            </h4>

                                            <div className="flex items-center justify-between text-[9px] text-gray-400">
                                                <span className="truncate max-w-[100px]">{shot.serviceSlug}</span>
                                                <span className="font-bold">#{shot.order || 0}</span>
                                            </div>

                                            {/* Video Association Badge */}
                                            {shot.videoTitle && (
                                                <div className="p-1 rounded bg-black border border-white/5 text-[9px] text-amber-300/80 truncate">
                                                    ▶ {shot.videoTitle}
                                                </div>
                                            )}

                                            {/* Order controls */}
                                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveShotOrder(shot, "up")}
                                                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[9px] font-bold"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveShotOrder(shot, "down")}
                                                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[9px] font-bold"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleShotPublish(shot)}
                                                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        shot.isPublished !== false ? "text-green-400 bg-green-950/40" : "text-red-400 bg-red-950/40"
                                                    }`}
                                                >
                                                    {shot.isPublished !== false ? "Live" : "Draft"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-2 bg-black/60 border-t border-white/5 flex items-center justify-between gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenShotModal(shot)}
                                            className="flex-1 py-1 rounded bg-white/5 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[9px] font-bold uppercase transition-all text-center"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteShot(shot)}
                                            className="px-2 py-1 rounded bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 text-[9px] font-bold uppercase transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    TAB 4: CENTRAL MEDIA LIBRARY
                   ══════════════════════════════════════════════════════════════ */}
                {activeTab === "MEDIA" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <h2 className="text-xl font-black uppercase font-heading text-white">
                                    Central Media Library ({mediaAssets.length} Assets)
                                </h2>
                                <p className="text-xs text-gray-400">
                                    All uploaded photography, video thumbnails, and hero images with live usage protection.
                                </p>
                            </div>

                            {/* Direct Upload to Media Library */}
                            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2">
                                <span>📁</span>
                                <span>{uploadingImage ? "Uploading..." : "Upload New Files"}</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFileUpload(Array.from(e.target.files), () => loadMediaLibrary());
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {mediaAssets.map((asset, idx) => (
                                <div
                                    key={idx}
                                    className="bg-[#0b0b0b] border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a059]/40 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div
                                            className="relative aspect-square w-full bg-neutral-900 cursor-pointer overflow-hidden group"
                                            onClick={() => setPreviewImageModal({ open: true, url: asset.url, title: asset.fileName })}
                                        >
                                            <img
                                                src={asset.url}
                                                alt={asset.fileName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Usage Status Pill */}
                                            <div className="absolute top-2 right-2">
                                                {asset.usageCount > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-950/80 text-green-300 text-[8px] font-black uppercase border border-green-500/30">
                                                        ✓ {asset.usageCount} In Use
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[8px] font-black uppercase border border-amber-500/30">
                                                        Unused
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3 space-y-1">
                                            <h4 className="font-mono text-[10px] text-gray-300 truncate" title={asset.fileName}>
                                                {asset.fileName}
                                            </h4>
                                            {asset.fileSize && (
                                                <p className="text-[9px] text-gray-500">
                                                    {(asset.fileSize / 1024).toFixed(0)} KB
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar with Safe Deletion */}
                                    <div className="p-2 bg-black/60 border-t border-white/5 flex items-center justify-between gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(asset.url);
                                                showToast("Copied image URL to clipboard!");
                                            }}
                                            className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[9px] font-bold uppercase"
                                        >
                                            Copy Link
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMediaAsset(asset)}
                                            className="px-2 py-1 rounded bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 text-[9px] font-bold uppercase"
                                            title="Delete media file (warns if in use)"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MODAL 1: ADD / EDIT SERVICE
               ══════════════════════════════════════════════════════════════ */}
            {serviceModal.open && (
                <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <h3 className="font-heading text-xl font-black uppercase text-white">
                                    {serviceModal.isEdit ? `Edit Service: ${serviceForm.title}` : "Add New Service"}
                                </h3>
                                <p className="text-gray-400 text-xs">Configure service page details, category and SEO</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setServiceModal({ open: false, isEdit: false, data: null })}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveService} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={serviceForm.title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setServiceForm(prev => ({
                                                ...prev,
                                                title: newTitle,
                                                slug: prev._id ? prev.slug : newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                                            }));
                                        }}
                                        placeholder="e.g., Luxury Bengali Wedding Cinema"
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Main Category *
                                    </label>
                                    <select
                                        value={serviceForm.category}
                                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="WEDDING">WEDDING</option>
                                        <option value="CORPORATE">CORPORATE</option>
                                        <option value="DRONE & AERIAL">DRONE &amp; AERIAL</option>
                                        <option value="SOCIAL">SOCIAL</option>
                                        <option value="TECH">TECH</option>
                                        <option value="EVENT MANAGEMENT">EVENT MANAGEMENT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Service Slug / URL *
                                    </label>
                                    <div className="flex items-center bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
                                        <span className="text-gray-500 font-mono text-[10px]">/services/</span>
                                        <input
                                            type="text"
                                            required
                                            value={serviceForm.slug}
                                            onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                                            className="flex-1 bg-transparent text-white font-mono outline-none px-1"
                                        />
                                        <span className="text-gray-500 font-mono text-[10px]">/</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={serviceForm.order}
                                        onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    value={serviceForm.shortDescription}
                                    onChange={(e) => setServiceForm({ ...serviceForm, shortDescription: e.target.value })}
                                    placeholder="Brief punchy subtitle for headers..."
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Full Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={serviceForm.description}
                                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    placeholder="Comprehensive service description for client reading..."
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Hero Image Upload */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Featured Hero Image URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={serviceForm.heroImage}
                                        onChange={(e) => setServiceForm({ ...serviceForm, heroImage: e.target.value })}
                                        placeholder="https://... or upload below"
                                        className="flex-1 bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                    <label className="cursor-pointer px-4 py-2.5 bg-white/10 hover:bg-[#c5a059] text-white hover:text-black rounded-xl text-xs font-black uppercase flex items-center gap-1 transition-all">
                                        <span>Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleFileUpload([e.target.files[0]], (res) => {
                                                        setServiceForm(prev => ({ ...prev, heroImage: res.url }));
                                                    });
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        SEO Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.seoTitle}
                                        onChange={(e) => setServiceForm({ ...serviceForm, seoTitle: e.target.value })}
                                        placeholder="Google search title..."
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Publish Status
                                    </label>
                                    <select
                                        value={serviceForm.isPublished ? "published" : "draft"}
                                        onChange={(e) => setServiceForm({ ...serviceForm, isPublished: e.target.value === "published" })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="published">Published (Visible Publicly)</option>
                                        <option value="draft">Draft (Hidden)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setServiceModal({ open: false, isEdit: false, data: null })}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                                >
                                    Save Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 2: ADD / EDIT VIDEO
               ══════════════════════════════════════════════════════════════ */}
            {videoModal.open && (
                <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <h3 className="font-heading text-xl font-black uppercase text-white">
                                    {videoModal.isEdit ? `Edit Video: ${videoForm.title}` : "Add New Video"}
                                </h3>
                                <p className="text-gray-400 text-xs">Configure YouTube link, custom thumbnail, and service assignment</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setVideoModal({ open: false, isEdit: false, data: null })}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveVideo} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={videoForm.title}
                                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                                    placeholder="e.g., Traditional Bengali Wedding Cinema | Bishal & Binita"
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        YouTube URL or Video ID *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={videoForm.youtubeUrl}
                                        onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                    {getYouTubeId(videoForm.youtubeUrl) && (
                                        <p className="text-[10px] text-green-400 mt-1">
                                            ✓ Extracted ID: {getYouTubeId(videoForm.youtubeUrl)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Assign to Service *
                                    </label>
                                    <select
                                        required
                                        value={videoForm.serviceSlug}
                                        onChange={(e) => {
                                            const newSlug = e.target.value;
                                            const matchingSvc = services.find(s => s.slug === newSlug);
                                            setVideoForm({
                                                ...videoForm,
                                                serviceSlug: newSlug,
                                                category: matchingSvc?.category || videoForm.category
                                            });
                                        }}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        {services.map((svc, sIdx) => (
                                            <option key={sIdx} value={svc.slug}>
                                                [{svc.category}] {svc.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Thumbnail Preview & Custom Upload */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Thumbnail Preview &amp; Custom Upload
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="relative w-36 aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                        <img
                                            src={videoForm.customThumbnail || (getYouTubeId(videoForm.youtubeUrl) ? `https://img.youtube.com/vi/${getYouTubeId(videoForm.youtubeUrl)}/maxresdefault.jpg` : "/logo-banner.png")}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <input
                                            type="text"
                                            value={videoForm.customThumbnail}
                                            onChange={(e) => setVideoForm({ ...videoForm, customThumbnail: e.target.value })}
                                            placeholder="Leave empty for auto YouTube thumbnail or paste custom URL..."
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                        />
                                        <label className="inline-flex cursor-pointer px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[10px] font-black uppercase transition-all">
                                            <span>Upload Custom Thumbnail</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileUpload([e.target.files[0]], (res) => {
                                                            setVideoForm(prev => ({ ...prev, customThumbnail: res.url }));
                                                        });
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Video Type
                                    </label>
                                    <select
                                        value={videoForm.videoType}
                                        onChange={(e) => setVideoForm({ ...videoForm, videoType: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="standard">16:9 Standard Cinema</option>
                                        <option value="shorts">9:16 Vertical Shorts</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Format / Quality Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={videoForm.tag}
                                        onChange={(e) => setVideoForm({ ...videoForm, tag: e.target.value })}
                                        placeholder="e.g., 4K Cinematic, Full Episode"
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={videoForm.order}
                                        onChange={(e) => setVideoForm({ ...videoForm, order: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Publish Status
                                    </label>
                                    <select
                                        value={videoForm.isPublished ? "published" : "draft"}
                                        onChange={(e) => setVideoForm({ ...videoForm, isPublished: e.target.value === "published", status: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="published">Published (Visible on Service Page)</option>
                                        <option value="draft">Draft (Hidden)</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={videoForm.isFeatured}
                                            onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#c5a059] bg-black border-white/20"
                                        />
                                        <span>Mark as Featured Film ★</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVideoModal({ open: false, isEdit: false, data: null })}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                                >
                                    Save Video
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 3: ADD / EDIT SINGLE SHOT
               ══════════════════════════════════════════════════════════════ */}
            {shotModal.open && (
                <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <h3 className="font-heading text-xl font-black uppercase text-white">
                                    {shotModal.isEdit ? `Edit Shot: ${shotForm.title}` : "Add Individual Shot"}
                                </h3>
                                <p className="text-gray-400 text-xs">Configure photograph image, shot type, and optional video link</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShotModal({ open: false, isEdit: false, data: null })}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveShot} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Shot Title / Caption *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={shotForm.title}
                                    onChange={(e) => setShotForm({ ...shotForm, title: e.target.value })}
                                    placeholder="e.g., Sacred Saat Paak & Sindoor Daan Ritual"
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Image Upload / URL */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Image URL *
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    {shotForm.imageUrl && (
                                        <div className="relative w-28 h-20 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                            <img
                                                src={shotForm.imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2 w-full">
                                        <input
                                            type="text"
                                            required
                                            value={shotForm.imageUrl}
                                            onChange={(e) => setShotForm({ ...shotForm, imageUrl: e.target.value })}
                                            placeholder="Paste image link or upload file..."
                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                        />
                                        <label className="inline-flex cursor-pointer px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#c5a059] text-gray-300 hover:text-black text-[10px] font-black uppercase transition-all">
                                            <span>Upload Shot File</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileUpload([e.target.files[0]], (res) => {
                                                            setShotForm(prev => ({ ...prev, imageUrl: res.url }));
                                                        });
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Assign to Service *
                                    </label>
                                    <select
                                        required
                                        value={shotForm.serviceSlug}
                                        onChange={(e) => {
                                            const newSlug = e.target.value;
                                            const svc = services.find(s => s.slug === newSlug);
                                            setShotForm({
                                                ...shotForm,
                                                serviceSlug: newSlug,
                                                category: svc?.category || shotForm.category,
                                                videoId: ""
                                            });
                                        }}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        {services.map((svc, sIdx) => (
                                            <option key={sIdx} value={svc.slug}>
                                                [{svc.category}] {svc.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Associate with Existing Video (Optional)
                                    </label>
                                    <select
                                        value={shotForm.videoId}
                                        onChange={(e) => setShotForm({ ...shotForm, videoId: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="">-- No Associated Video --</option>
                                        {videos
                                            .filter(v => v.serviceSlug === shotForm.serviceSlug)
                                            .map((v, vIdx) => (
                                                <option key={vIdx} value={v._id}>
                                                    ▶ {v.title}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Shot Type
                                    </label>
                                    <select
                                        value={shotForm.shotType}
                                        onChange={(e) => setShotForm({ ...shotForm, shotType: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="candid">Candid Moment</option>
                                        <option value="ritual">Ritual / Tradition</option>
                                        <option value="portrait">Couple Portrait</option>
                                        <option value="cinematic-frame">Cinematic Frame</option>
                                        <option value="aerial">Drone Aerial</option>
                                        <option value="detail">Detail / Decor</option>
                                        <option value="commercial">Commercial Shoot</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={shotForm.order}
                                        onChange={(e) => setShotForm({ ...shotForm, order: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                        Publish Status
                                    </label>
                                    <select
                                        value={shotForm.isPublished ? "published" : "draft"}
                                        onChange={(e) => setShotForm({ ...shotForm, isPublished: e.target.value === "published", status: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    >
                                        <option value="published">Published (Live)</option>
                                        <option value="draft">Draft (Hidden)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShotModal({ open: false, isEdit: false, data: null })}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                                >
                                    Save Shot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 4: BULK MULTI-IMAGE SHOT UPLOAD
               ══════════════════════════════════════════════════════════════ */}
            {bulkShotModal.open && (
                <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div>
                                <h3 className="font-heading text-xl font-black uppercase text-white">
                                    Bulk Upload Photography Shots
                                </h3>
                                <p className="text-gray-400 text-xs">Upload up to 20 images at once to populate service galleries</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setBulkShotModal({ open: false, serviceSlug: "", category: "", videoId: "", files: [], uploading: false })}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleBulkShotSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Target Service Page *
                                </label>
                                <select
                                    required
                                    value={bulkShotModal.serviceSlug}
                                    onChange={(e) => {
                                        const slug = e.target.value;
                                        const svc = services.find(s => s.slug === slug);
                                        setBulkShotModal(prev => ({
                                            ...prev,
                                            serviceSlug: slug,
                                            category: svc?.category || "WEDDING",
                                            videoId: ""
                                        }));
                                    }}
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                >
                                    {services.map((svc, idx) => (
                                        <option key={idx} value={svc.slug}>
                                            [{svc.category}] {svc.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Link to Video (Optional)
                                </label>
                                <select
                                    value={bulkShotModal.videoId}
                                    onChange={(e) => setBulkShotModal(prev => ({ ...prev, videoId: e.target.value }))}
                                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                >
                                    <option value="">-- No Video Link (General Still Shots) --</option>
                                    {videos
                                        .filter(v => v.serviceSlug === bulkShotModal.serviceSlug)
                                        .map((v, idx) => (
                                            <option key={idx} value={v._id}>
                                                ▶ {v.title}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Multi-file Dropzone */}
                            <div className="border-2 border-dashed border-white/20 hover:border-[#c5a059] rounded-2xl p-6 text-center cursor-pointer transition-all bg-black/40">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setBulkShotModal(prev => ({ ...prev, files: Array.from(e.target.files) }));
                                        }
                                    }}
                                    className="hidden"
                                    id="bulk-shot-file-input"
                                />
                                <label htmlFor="bulk-shot-file-input" className="cursor-pointer block">
                                    <span className="text-3xl block mb-2">📸</span>
                                    <span className="text-xs font-black uppercase tracking-wider text-white block">
                                        Click or Drag Images Here
                                    </span>
                                    <span className="text-[10px] text-gray-500 mt-1 block">
                                        Supports JPEG, PNG, WebP up to 50MB per file
                                    </span>
                                    {bulkShotModal.files && bulkShotModal.files.length > 0 && (
                                        <div className="mt-3 p-2 bg-[#c5a059]/10 rounded-xl border border-[#c5a059]/30 text-xs text-[#c5a059] font-bold">
                                            ✓ {bulkShotModal.files.length} file(s) selected
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBulkShotModal({ open: false, serviceSlug: "", category: "", videoId: "", files: [], uploading: false })}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bulkShotModal.uploading || !bulkShotModal.files || bulkShotModal.files.length === 0}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                                >
                                    {bulkShotModal.uploading ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            <span>Processing Uploads...</span>
                                        </>
                                    ) : (
                                        <span>Upload &amp; Add Shots</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 5: VIDEO PREVIEW PLAYER
               ══════════════════════════════════════════════════════════════ */}
            {previewVideoModal.open && (
                <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-neutral-950">
                            <h3 className="text-sm font-bold uppercase text-white truncate max-w-lg">
                                {previewVideoModal.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setPreviewVideoModal({ open: false, url: "", title: "", ytId: "" })}
                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-red-600 text-white text-xs font-bold"
                            >
                                Close ✕
                            </button>
                        </div>
                        <div className="relative aspect-video w-full">
                            <iframe
                                src={`https://www.youtube.com/embed/${previewVideoModal.ytId}?autoplay=1&rel=0`}
                                title={previewVideoModal.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 6: IMAGE PREVIEW LIGHTBOX
               ══════════════════════════════════════════════════════════════ */}
            {previewImageModal.open && (
                <div
                    className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setPreviewImageModal({ open: false, url: "", title: "" })}
                >
                    <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
                        <img
                            src={previewImageModal.url}
                            alt={previewImageModal.title}
                            className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
                        />
                        <p className="text-xs text-white uppercase font-bold mt-3">
                            {previewImageModal.title}
                        </p>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL 7: CONFIRMATION DIALOG
               ══════════════════════════════════════════════════════════════ */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{confirmModal.warning ? "⚠️" : "❓"}</span>
                            <h3 className="font-heading text-lg font-black uppercase text-white">
                                {confirmModal.title}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                            {confirmModal.message}
                        </p>
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ open: false, title: "", message: "", warning: false, onConfirm: null })}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                }}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider"
                            >
                                Yes, Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
