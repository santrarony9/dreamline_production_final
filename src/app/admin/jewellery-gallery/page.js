"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function AdminJewelleryGallery() {
    // Active Tab: 'classified' or 'unclassified'
    const [activeTab, setActiveTab] = useState("classified");

    // Classified Groups State
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [allGroups, setAllGroups] = useState([]);
    const [classifiedCount, setClassifiedCount] = useState(0);
    const [unclassifiedCount, setUnclassifiedCount] = useState(0);

    // Unclassified State
    const [unclassifiedItems, setUnclassifiedItems] = useState([]);
    const [selectedUnclassifiedIds, setSelectedUnclassifiedIds] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal state for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        category: "BRACELET",
        coverImage: "",
        images: [],
        order: 0,
        isPublished: true,
        notes: ""
    });

    // Move Photo Modal
    const [movePhotoModal, setMovePhotoModal] = useState({
        isOpen: false,
        sourceGroupId: null,
        photoUrl: "",
        targetGroupId: ""
    });

    // Assign Unclassified Modal
    const [assignModal, setAssignModal] = useState({
        isOpen: false,
        unclassifiedId: null,
        targetGroupId: ""
    });

    // Bulk Group Modal
    const [isBulkGroupModalOpen, setIsBulkGroupModalOpen] = useState(false);
    const [bulkGroupData, setBulkGroupData] = useState({
        title: "New Custom Jewellery Design",
        category: "BRACELET"
    });

    const fileInputRef = useRef(null);
    const addPhotoToGroupInputRef = useRef(null);
    const [targetGroupForUpload, setTargetGroupForUpload] = useState(null);

    // Fetch items
    const fetchItems = async () => {
        setIsLoading(true);
        setError("");
        try {
            const url = new URL("/api/admin/jewellery-gallery", window.location.origin);
            url.searchParams.set("view", activeTab);
            if (activeTab === "classified" && selectedCategory !== "ALL") {
                url.searchParams.set("category", selectedCategory);
            }
            if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                if (activeTab === "classified") {
                    setItems(data.items || []);
                } else {
                    setUnclassifiedItems(data.items || []);
                }
                setClassifiedCount(data.classifiedCount || 0);
                setUnclassifiedCount(data.unclassifiedCount || 0);
                if (data.categories) setCategories(data.categories);
                if (data.allGroups) setAllGroups(data.allGroups);
            } else {
                setError(data.error || "Failed to load jewellery items");
            }
        } catch (err) {
            setError(err.message || "Failed to fetch items");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab, selectedCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchItems();
    };

    // ── Quick Change Main Thumbnail ──
    const handleChangeMainCover = async (groupId, photoUrl) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/jewellery-gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "change_cover",
                    id: groupId,
                    coverImage: photoUrl
                })
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.map(item => item._id === groupId ? { ...item, coverImage: photoUrl } : item));
                setSuccessMessage("Main thumbnail updated successfully!");
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to change cover");
            }
        } catch (err) {
            setError("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Move Photo between Groups ──
    const handleConfirmMovePhoto = async () => {
        if (!movePhotoModal.targetGroupId) {
            setError("Please select a target jewellery design group.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/jewellery-gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "move_photo",
                    sourceGroupId: movePhotoModal.sourceGroupId,
                    targetGroupId: movePhotoModal.targetGroupId,
                    photoUrl: movePhotoModal.photoUrl
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage("Photograph moved to new design group!");
                setMovePhotoModal({ isOpen: false, sourceGroupId: null, photoUrl: "", targetGroupId: "" });
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to move photo");
            }
        } catch (err) {
            setError("Move error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Remove Photo from Group to Unclassified ──
    const handleRemovePhotoToUnclassified = async (groupId, photoUrl) => {
        if (!confirm("Remove this photograph from this design group and send to Unclassified for manual review?")) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/jewellery-gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "remove_photo_to_unclassified",
                    groupId,
                    photoUrl
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage("Photo removed to unclassified review pool!");
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to remove photo");
            }
        } catch (err) {
            setError("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Assign Unclassified Photo to Existing Group ──
    const handleConfirmAssignUnclassified = async () => {
        if (!assignModal.targetGroupId) {
            setError("Please select a destination jewellery design group.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/jewellery-gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "assign_unclassified",
                    unclassifiedId: assignModal.unclassifiedId,
                    targetGroupId: assignModal.targetGroupId
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage("Photo successfully assigned to design group!");
                setAssignModal({ isOpen: false, unclassifiedId: null, targetGroupId: "" });
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to assign photo");
            }
        } catch (err) {
            setError("Assign error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Create New Group from Selected Unclassified Photos ──
    const handleCreateFromSelectedUnclassified = async () => {
        if (selectedUnclassifiedIds.length === 0) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/jewellery-gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create_from_unclassified",
                    unclassifiedIds: selectedUnclassifiedIds,
                    title: bulkGroupData.title,
                    category: bulkGroupData.category
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(`Created new jewellery group with ${selectedUnclassifiedIds.length} photographs!`);
                setSelectedUnclassifiedIds([]);
                setIsBulkGroupModalOpen(false);
                setActiveTab("classified");
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setError(data.error || "Failed to create group from selected");
            }
        } catch (err) {
            setError("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Add Photo to Specific Group Directly ──
    const handleAddPhotoToGroupFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !targetGroupForUpload) return;

        setIsSaving(true);
        try {
            const body = new FormData();
            body.append("file", file);
            const uploadRes = await fetch("/api/upload", { method: "POST", body });
            const uploadData = await uploadRes.json();
            if (!uploadData.url) throw new Error("Upload failed");

            const group = items.find(it => it._id === targetGroupForUpload);
            if (!group) throw new Error("Group not found");

            const updatedImages = [...(group.images || []), { url: uploadData.url, order: (group.images?.length || 0) + 1, isCover: false }];
            const putRes = await fetch("/api/admin/jewellery-gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: targetGroupForUpload,
                    images: updatedImages
                })
            });
            const putData = await putRes.json();
            if (putData.success) {
                setSuccessMessage("Photograph added to design group!");
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            }
        } catch (err) {
            setError("Error adding photo: " + err.message);
        } finally {
            setIsSaving(false);
            setTargetGroupForUpload(null);
            if (addPhotoToGroupInputRef.current) addPhotoToGroupInputRef.current.value = "";
        }
    };

    // ── Delete Group ──
    const handleDeleteGroup = async (id, title) => {
        if (!confirm(`Are you sure you want to delete the design group "${title}"? Original image files will NOT be deleted.`)) return;

        try {
            const res = await fetch(`/api/admin/jewellery-gallery?id=${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage("Jewellery design group deleted.");
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to delete group.");
            }
        } catch (err) {
            setError("Delete error: " + err.message);
        }
    };

    // Open Add Modal
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            title: "New Jewellery Design",
            category: categories[0] || "BRACELET",
            coverImage: "",
            images: [],
            order: classifiedCount + 1,
            isPublished: true,
            notes: ""
        });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            id: item._id,
            title: item.title,
            category: item.category,
            coverImage: item.coverImage,
            images: item.images && item.images.length > 0
                ? item.images.map(img => typeof img === 'string' ? img : img.url)
                : [item.coverImage],
            order: item.order || 0,
            isPublished: item.isPublished !== undefined ? item.isPublished : true,
            notes: item.notes || ""
        });
        setIsModalOpen(true);
    };

    // Save Modal Item
    const handleSaveItem = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const payload = {
                ...formData,
                coverImage: formData.coverImage || formData.images[0],
                images: formData.images
            };

            const method = editingItem ? "PUT" : "POST";
            const res = await fetch("/api/admin/jewellery-gallery", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage(editingItem ? "Jewellery design updated!" : "New jewellery design created!");
                setIsModalOpen(false);
                fetchItems();
                setTimeout(() => setSuccessMessage(""), 2500);
            } else {
                setError(data.error || "Failed to save jewellery design.");
            }
        } catch (err) {
            setError("Save error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💎</span>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                            Jewellery Image Grouping & Gallery Management
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Organize multi-angle photographs into single unique jewellery designs. One thumbnail per design in main gallery.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="px-5 py-2.5 bg-[#c5a059] text-black hover:bg-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                        <span>+</span> Create New Jewellery Group
                    </button>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-xs flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="text-red-400 hover:text-white">✕</button>
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex justify-between items-center">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage("")} className="text-emerald-400 hover:text-white">✕</button>
                </div>
            )}

            {/* Primary Navigation Tabs */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <button
                    type="button"
                    onClick={() => setActiveTab("classified")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === "classified"
                            ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                    <span>✨</span>
                    <span>Jewellery Design Groups ({classifiedCount})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("unclassified")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === "unclassified"
                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                    <span>🔍</span>
                    <span>Unclassified Photographs ({unclassifiedCount})</span>
                    {unclassifiedCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    )}
                </button>
            </div>

            {/* TAB 1: CLASSIFIED JEWELLERY GROUPS */}
            {activeTab === "classified" && (
                <div className="space-y-6">
                    {/* Category Filter and Search Bar */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("ALL")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    selectedCategory === "ALL"
                                        ? "bg-[#c5a059] text-black"
                                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                All Groups ({classifiedCount})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                        selectedCategory === cat
                                            ? "bg-[#c5a059] text-black"
                                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-64">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search designs..."
                                className="w-full px-3 py-1.5 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Groups Grid */}
                    {isLoading ? (
                        <div className="py-24 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-4">Loading jewellery designs...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-24 text-center bg-[#0a0a0a] border border-white/5 rounded-xl">
                            <span className="text-4xl block mb-3">💎</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">No Jewellery Groups Found</h3>
                            <p className="text-xs text-gray-500 mt-1">Create a group or assign photographs from the unclassified review pool.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-[#0a0a0a] border border-white/10 hover:border-[#c5a059]/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl"
                                >
                                    {/* Main Thumbnail Header */}
                                    <div className="relative aspect-video w-full bg-black group overflow-hidden">
                                        <img
                                            src={item.coverImage}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                                            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-[#c5a059] border border-[#c5a059]/30">
                                                {item.category}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-gray-300 border border-white/10">
                                                #{item.order}
                                            </span>
                                        </div>

                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-0.5 rounded bg-[#c5a059] text-black text-[9px] font-black uppercase tracking-wider shadow">
                                                ★ Main Thumbnail
                                            </span>
                                        </div>
                                    </div>

                                    {/* Group Details */}
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                                                <span>📷 {item.images ? item.images.length : 1} angle photographs grouped</span>
                                            </p>
                                        </div>

                                        {/* Multi-Angle Photographs Strip with Quick Actions */}
                                        <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <div className="flex items-center justify-between text-[9px] text-gray-400 uppercase font-bold">
                                                <span>Photographs in this Design:</span>
                                                <span className="text-[#c5a059]">Click photo to set as Main</span>
                                            </div>

                                            <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                                                {(item.images || []).map((img, idx) => {
                                                    const url = typeof img === 'string' ? img : img.url;
                                                    const isCover = url === item.coverImage;
                                                    return (
                                                        <div
                                                            key={url + idx}
                                                            className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 group/thumb cursor-pointer ${
                                                                isCover
                                                                    ? "border-[#c5a059] shadow-md shadow-[#c5a059]/20"
                                                                    : "border-white/20 hover:border-white/60"
                                                            }`}
                                                            onClick={() => handleChangeMainCover(item._id, url)}
                                                            title="Click to set as Main Thumbnail"
                                                        >
                                                            <img src={url} alt="" className="w-full h-full object-cover" />

                                                            {isCover && (
                                                                <span className="absolute bottom-0 inset-x-0 bg-[#c5a059] text-black text-[7px] font-black text-center uppercase">
                                                                    Main
                                                                </span>
                                                            )}

                                                            {/* Hover action bar */}
                                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setMovePhotoModal({
                                                                            isOpen: true,
                                                                            sourceGroupId: item._id,
                                                                            photoUrl: url,
                                                                            targetGroupId: allGroups.find(g => g.id !== item._id)?.id || ""
                                                                        });
                                                                    }}
                                                                    className="w-5 h-5 rounded bg-white/20 hover:bg-[#c5a059] hover:text-black text-white text-[8px] flex items-center justify-center"
                                                                    title="Move to another design group"
                                                                >
                                                                    ⇄
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemovePhotoToUnclassified(item._id, url);
                                                                    }}
                                                                    className="w-5 h-5 rounded bg-red-950 hover:bg-red-600 text-red-300 hover:text-white text-[8px] flex items-center justify-center"
                                                                    title="Remove to Unclassified Review"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Add Photo Button to this Group */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTargetGroupForUpload(item._id);
                                                        addPhotoToGroupInputRef.current?.click();
                                                    }}
                                                    className="w-14 h-14 rounded-lg border-2 border-dashed border-white/20 hover:border-[#c5a059] flex flex-col items-center justify-center text-gray-400 hover:text-white flex-shrink-0 transition-colors"
                                                    title="Add new photograph to this design group"
                                                >
                                                    <span className="text-sm">+</span>
                                                    <span className="text-[7px] uppercase font-bold">Add</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Actions */}
                                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                item.isPublished
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                                {item.isPublished ? "Visible in Gallery" : "Hidden"}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    className="px-2.5 py-1 bg-white/5 hover:bg-[#c5a059] hover:text-black rounded text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all border border-white/10"
                                                >
                                                    Edit Group
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteGroup(item._id, item.title)}
                                                    className="px-2.5 py-1 bg-red-950/40 hover:bg-red-600 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all border border-red-500/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: UNCLASSIFIED PHOTOGRAPHS (MANUAL REVIEW) */}
            {activeTab === "unclassified" && (
                <div className="space-y-6">
                    <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                                <span>⚠️</span> Unclassified Photographs ({unclassifiedCount})
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1">
                                These photographs are safely stored in your database but are completely HIDDEN from the public website. Review and match them to existing jewellery designs or group them into new designs.
                            </p>
                        </div>

                        {selectedUnclassifiedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsBulkGroupModalOpen(true)}
                                className="px-4 py-2 bg-amber-500 text-black font-black uppercase text-xs tracking-wider rounded-lg shadow-lg hover:bg-white transition-all whitespace-nowrap"
                            >
                                Group {selectedUnclassifiedIds.length} Selected into New Design
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="py-24 text-center">
                            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-4">Loading unclassified photos...</p>
                        </div>
                    ) : unclassifiedItems.length === 0 ? (
                        <div className="py-24 text-center bg-[#0a0a0a] border border-white/5 rounded-xl">
                            <span className="text-4xl block mb-3">✅</span>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">All Photographs Classified!</h3>
                            <p className="text-xs text-gray-500 mt-1">No pending unclassified photos remain in the manual review pool.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {unclassifiedItems.map((uItem) => {
                                const isSelected = selectedUnclassifiedIds.includes(uItem._id);
                                return (
                                    <div
                                        key={uItem._id}
                                        className={`bg-[#0a0a0a] border rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                                            isSelected ? "border-amber-500 shadow-lg shadow-amber-500/20" : "border-white/10 hover:border-white/30"
                                        }`}
                                    >
                                        <div className="relative aspect-square w-full bg-black">
                                            <img src={uItem.coverImage} alt="" className="w-full h-full object-cover" />
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUnclassifiedIds(prev => [...prev, uItem._id]);
                                                    } else {
                                                        setSelectedUnclassifiedIds(prev => prev.filter(id => id !== uItem._id));
                                                    }
                                                }}
                                                className="absolute top-2 left-2 w-4 h-4 rounded border-white/30 bg-black text-amber-500 focus:ring-amber-500"
                                            />
                                        </div>

                                        <div className="p-3 space-y-2">
                                            <p className="text-[10px] text-gray-300 font-bold line-clamp-1">
                                                {uItem.title}
                                            </p>

                                            <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setAssignModal({
                                                        isOpen: true,
                                                        unclassifiedId: uItem._id,
                                                        targetGroupId: allGroups[0]?.id || ""
                                                    })}
                                                    className="w-full py-1 bg-white/10 hover:bg-[#c5a059] hover:text-black rounded text-[9px] font-black uppercase tracking-wider text-gray-300 transition-colors"
                                                >
                                                    Assign to Group
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Hidden Input for Adding Photo to Specific Group */}
            <input
                type="file"
                ref={addPhotoToGroupInputRef}
                onChange={handleAddPhotoToGroupFile}
                accept="image/*"
                className="hidden"
            />

            {/* Move Photo Modal */}
            {movePhotoModal.isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                Move Photograph to Another Group
                            </h3>
                            <button
                                type="button"
                                onClick={() => setMovePhotoModal({ isOpen: false, sourceGroupId: null, photoUrl: "", targetGroupId: "" })}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                            <img src={movePhotoModal.photoUrl} alt="" className="w-16 h-16 rounded object-cover border border-white/10" />
                            <div className="text-xs text-gray-400">
                                Select the target jewellery design group to receive this photograph angle.
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                Destination Jewellery Design Group
                            </label>
                            <select
                                value={movePhotoModal.targetGroupId}
                                onChange={(e) => setMovePhotoModal(prev => ({ ...prev, targetGroupId: e.target.value }))}
                                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                            >
                                {allGroups.filter(g => g.id !== movePhotoModal.sourceGroupId).map(g => (
                                    <option key={g.id} value={g.id}>
                                        [{g.category}] {g.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setMovePhotoModal({ isOpen: false, sourceGroupId: null, photoUrl: "", targetGroupId: "" })}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmMovePhoto}
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#c5a059] text-black font-black uppercase text-xs tracking-wider rounded-lg hover:bg-white transition-all"
                            >
                                {isSaving ? "Moving..." : "Confirm Move"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Unclassified Modal */}
            {assignModal.isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                Assign Photo to Design Group
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAssignModal({ isOpen: false, unclassifiedId: null, targetGroupId: "" })}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                Target Jewellery Group
                            </label>
                            <select
                                value={assignModal.targetGroupId}
                                onChange={(e) => setAssignModal(prev => ({ ...prev, targetGroupId: e.target.value }))}
                                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                            >
                                {allGroups.map(g => (
                                    <option key={g.id} value={g.id}>
                                        [{g.category}] {g.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setAssignModal({ isOpen: false, unclassifiedId: null, targetGroupId: "" })}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAssignUnclassified}
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#c5a059] text-black font-black uppercase text-xs tracking-wider rounded-lg hover:bg-white transition-all"
                            >
                                {isSaving ? "Assigning..." : "Confirm Assign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Group Modal (From Selected Unclassified) */}
            {isBulkGroupModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">
                                Group {selectedUnclassifiedIds.length} Selected Photographs
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsBulkGroupModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    New Design Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={bulkGroupData.title}
                                    onChange={(e) => setBulkGroupData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    list="bulkCatList"
                                    required
                                    value={bulkGroupData.category}
                                    onChange={(e) => setBulkGroupData(prev => ({ ...prev, category: e.target.value.toUpperCase() }))}
                                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                />
                                <datalist id="bulkCatList">
                                    {categories.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsBulkGroupModalOpen(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateFromSelectedUnclassified}
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#c5a059] text-black font-black uppercase text-xs tracking-wider rounded-lg hover:bg-white transition-all"
                            >
                                {isSaving ? "Creating..." : "Create Design Group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Design Group Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-base font-black uppercase tracking-tight text-white font-heading">
                                {editingItem ? "Edit Jewellery Design Group" : "Create New Jewellery Design Group"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Internal Design Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        list="editCatList"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    />
                                    <datalist id="editCatList">
                                        {categories.map((c) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                                            className="w-4 h-4 rounded border-white/20 bg-black text-[#c5a059] focus:ring-[#c5a059]"
                                        />
                                        <span>Visible in Public Main Gallery</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-[#c5a059] hover:bg-white text-black rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#c5a059]/20"
                                >
                                    {isSaving ? "Saving..." : "Save Design Group"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
