"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import axios from "axios";
import Link from "next/link";

const DEFAULT_CATEGORIES = [
    {
        name: "WEDDING",
        slug: "wedding",
        description: "Luxury candid wedding photography, cinematic films and rituals in Kolkata",
        order: 1,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "Pre Wedding", url: "/services/pre-wedding-shoot-kolkata/", badge: "", description: "Cinematic romantic storytelling at Prinsep Ghat & heritage sites", isActive: true, order: 1 },
            { title: "Wedding", url: "/services/wedding-photography-kolkata/", badge: "Signature", description: "Luxury candid photography & emotional Bengali rituals", isActive: true, order: 2 },
            { title: "Post Wedding", url: "/services/post-wedding-photography-kolkata/", badge: "", description: "Intimate post-ceremony portraits, reception & newlywed memories", isActive: true, order: 3 }
        ]
    },
    {
        name: "CORPORATE",
        slug: "corporate",
        description: "Commercial ad films, brand promotions, documentaries and corporate media",
        order: 2,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "Commercial Ad", url: "/services/commercial-ad-films-kolkata/", badge: "Featured", description: "High-impact brand commercials, TVCs & digital ad campaigns", isActive: true, order: 1 },
            { title: "Brand Promotion", url: "/services/brand-promotion-kolkata/", badge: "", description: "Strategic promotional video campaigns for corporate brand growth", isActive: true, order: 2 },
            { title: "Corporate Film", url: "/services/corporate-photography-kolkata/", badge: "", description: "Executive portraits, facility walkthroughs & brand documentaries", isActive: true, order: 3 },
            { title: "Short Film", url: "/services/short-film-production-kolkata/", badge: "", description: "Narrative fiction, festival entries & branded creative shorts", isActive: true, order: 4 },
            { title: "3D Visualization", url: "/services/3d-visualization-kolkata/", badge: "", description: "CGI rendering, architectural 3D walkthroughs & visual simulations", isActive: true, order: 5 },
            { title: "Live Stream & Broadcast", url: "/services/live-stream-broadcast-kolkata/", badge: "", description: "Multi-camera live streaming, virtual conferences & hybrid broadcasts", isActive: true, order: 6 },
            { title: "Fashion Photography", url: "/services/fashion-photography-kolkata/", badge: "", description: "Editorial lookbooks, studio catalogs & model portfolio shoots", isActive: true, order: 7 },
            { title: "Podcast", url: "/services/podcast-production-kolkata/", badge: "", description: "Multi-camera 4K podcast recording, acoustic studio & engineering", isActive: true, order: 8 },
            { title: "Documentary Film", url: "/services/documentary-film-production-kolkata/", badge: "", description: "Engaging cultural narratives, heritage films & institutional stories", isActive: true, order: 9 }
        ]
    },
    {
        name: "DRONE & AERIAL",
        slug: "drone-and-aerial",
        description: "DGCA-certified 4K aerial cinematography, mapping and photogrammetry",
        order: 3,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "DRONE PHOTOGRAPHY", url: "/services/drone-photography-kolkata/", badge: "CERTIFIED", description: "DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE & EVENTS", isActive: true, order: 1 },
            { title: "DRONE VIDEOGRAPHY", url: "/services/drone-videography-kolkata/", badge: "POPULAR", description: "CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY & DYNAMIC REELS", isActive: true, order: 2 },
            { title: "3D AREA AND MAPPING", url: "/services/3d-area-mapping-kolkata/", badge: "", description: "AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS & 3D MODELS", isActive: true, order: 3 }
        ]
    },
    {
        name: "SOCIAL",
        slug: "social",
        description: "Birthdays, rice ceremonies, family celebrations and cultural events",
        order: 4,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "Birthday Photography", url: "/services/birthday-photography-kolkata/", badge: "", description: "MILESTONE CELEBRATIONS", isActive: true, order: 1 },
            { title: "Rice Ceremony", url: "/services/rice-ceremony-photography-kolkata/", badge: "Traditional", description: "SACRED ANNAPRASHAN RITUALS", isActive: true, order: 2 },
            { title: "Other Social Events", url: "/services/other-social-events-kolkata/", badge: "", description: "ANNIVERSARIES, CULTURAL AND FAMILY EVENTS", isActive: true, order: 3 }
        ]
    },
    {
        name: "TECH",
        slug: "tech",
        description: "Modern responsive web design, portfolio showcases & custom web applications",
        order: 5,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "Website", url: "/tech", badge: "", description: "MODERN RESPONSIVE WEB DESIGN, PORTFOLIO SHOWCASES & CUSTOM WEB APPLICATIONS", isActive: true, order: 1 }
        ]
    },
    {
        name: "EVENT MANAGEMENT",
        slug: "event-management",
        description: "Full-scale corporate summits, concerts & luxury event planning",
        order: 6,
        isActive: true,
        isPublished: true,
        showInMegaMenu: true,
        items: [
            { title: "Coming Soon", url: "#", badge: "COMING SOON", description: "Full-scale corporate summits, concerts & luxury event planning", isActive: true, order: 1 }
        ]
    }
];

export default function ServicesAdmin() {
    const [activeTab, setActiveTab] = useState("SERVICES_MENU"); // "SERVICES_MENU" | "CATEGORY_MANAGER" | "BUILD_PAGES"
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "success" });

    // Services categories & subcategories tree
    const [categories, setCategories] = useState([]);
    const [availablePages, setAvailablePages] = useState({ corePages: [], servicePages: [] });

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "PUBLISHED" | "DRAFT"

    // Preview Modal state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState("desktop"); // 'desktop' | 'mobile'

    // Add / Edit Category Modal state
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editingCatIdx, setEditingCatIdx] = useState(null); // null = new, number = edit
    const [catFormData, setCatFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        badge: "",
        url: "",
        order: 1,
        showInMegaMenu: true,
        isActive: true,
        isPublished: true
    });

    // Add / Edit Service Modal state
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingServiceTarget, setEditingServiceTarget] = useState(null); // { catIdx, itemIdx } or null
    const [serviceFormData, setServiceFormData] = useState({
        title: "",
        category: "WEDDING",
        url: "",
        slug: "",
        shortDescription: "",
        fullDescription: "",
        badge: "",
        isFeatured: false,
        heroImage: "",
        order: 1,
        isActive: true,
        isPublished: true
    });

    // Delete Confirmation Modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: "service", // "service" | "category"
        catIdx: null,
        itemIdx: null,
        title: ""
    });

    // BUILD PAGES STATE (Tab 3)
    const [servicePages, setServicePages] = useState([]);
    const [selectedSlug, setSelectedSlug] = useState("");
    const [pageFormData, setPageFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        shortDescription: "",
        category: "",
        heroImage: "",
        heroImageAlt: "",
        heroVideo: "",
        gallery: [],
        videos: [],
        videoSectionTitle: "",
        videoSectionSubtitle: "",
        sections: [],
        testimonials: [],
        seoTitle: "",
        metaDescription: "",
        metaKeywords: "",
        ctaText: "",
        ctaLink: "",
        active: true,
        isPublished: true
    });

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4500);
    };

    const extractSlug = (url) => {
        if (!url || url === "#") return "";
        return url.replace(/^\/services\//, "").replace(/\/$/, "").replace(/^\//, "");
    };

    // Fetch all categories, navigation items, and service pages
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [navRes, pagesRes, catRes] = await Promise.all([
                axios.get("/api/admin/navigation"),
                axios.get("/api/service-pages").catch(() => ({ data: [] })),
                axios.get("/api/admin/services/categories").catch(() => ({ data: { categories: [] } }))
            ]);

            const dbCategories = catRes.data?.categories || [];
            const categoryMetaMap = new Map();
            dbCategories.forEach(c => {
                categoryMetaMap.set(c.name.toUpperCase(), c);
            });

            if (navRes.data?.success) {
                const rootItems = navRes.data.rootItems || [];
                const servicesRoot = rootItems.find(r => r.title === "SERVICES");
                
                if (servicesRoot && Array.isArray(servicesRoot.children) && servicesRoot.children.length > 0) {
                    const groupMap = new Map();

                    // Seed map with any known categories first to preserve their order
                    if (dbCategories.length > 0) {
                        dbCategories.forEach(c => {
                            const name = c.name.toUpperCase();
                            if (!groupMap.has(name)) {
                                groupMap.set(name, {
                                    id: c.id || c._id,
                                    name: c.name,
                                    slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    description: c.description || "",
                                    image: c.image || "",
                                    badge: c.badge || "",
                                    url: c.url || "",
                                    order: c.order || 0,
                                    isActive: c.isActive !== false,
                                    isPublished: c.isPublished !== false,
                                    showInMegaMenu: c.showInMegaMenu !== false,
                                    items: []
                                });
                            }
                        });
                    }

                    servicesRoot.children.forEach(child => {
                        const grp = (child.group || "GENERAL").toUpperCase().trim();
                        if (!groupMap.has(grp)) {
                            const meta = categoryMetaMap.get(grp) || {};
                            groupMap.set(grp, {
                                id: meta.id || meta._id || null,
                                name: grp,
                                slug: meta.slug || grp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                description: meta.description || "",
                                image: meta.image || "",
                                badge: meta.badge || "",
                                url: meta.url || "",
                                order: meta.order || (groupMap.size + 1),
                                isActive: meta.isActive !== false,
                                isPublished: meta.isPublished !== false,
                                showInMegaMenu: meta.showInMegaMenu !== false,
                                items: []
                            });
                        }
                        groupMap.get(grp).items.push({
                            id: child.id || child._id,
                            title: child.title,
                            url: child.url,
                            badge: child.badge || "",
                            description: child.description || "",
                            subGroup: child.subGroup || "",
                            icon: child.icon || "",
                            isActive: child.isActive !== false,
                            order: child.order
                        });
                    });

                    const parsedCats = Array.from(groupMap.values());
                    // Sort by category order
                    parsedCats.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setCategories(parsedCats);
                } else {
                    setCategories(DEFAULT_CATEGORIES);
                }

                setAvailablePages(navRes.data.availablePages || { corePages: [], servicePages: [] });
            } else {
                setCategories(DEFAULT_CATEGORIES);
            }

            setServicePages(pagesRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setCategories(DEFAULT_CATEGORIES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Summary Statistics calculation (Part 9)
    const stats = useMemo(() => {
        let totalServices = 0;
        let publishedServices = 0;
        let draftServices = 0;

        categories.forEach(cat => {
            const items = cat.items || [];
            totalServices += items.length;
            items.forEach(it => {
                if (it.isActive !== false) {
                    publishedServices++;
                } else {
                    draftServices++;
                }
            });
        });

        return {
            totalCategories: categories.length,
            totalServices,
            publishedServices,
            draftServices
        };
    }, [categories]);

    // Filtered categories and services for display
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            if (categoryFilter !== "ALL" && cat.name.toUpperCase() !== categoryFilter.toUpperCase()) {
                return false;
            }
            return true;
        }).map(cat => {
            const items = (cat.items || []).filter(item => {
                if (statusFilter === "PUBLISHED" && item.isActive === false) return false;
                if (statusFilter === "DRAFT" && item.isActive !== false) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    const titleMatch = (item.title || "").toLowerCase().includes(q);
                    const descMatch = (item.description || "").toLowerCase().includes(q);
                    const badgeMatch = (item.badge || "").toLowerCase().includes(q);
                    const urlMatch = (item.url || "").toLowerCase().includes(q);
                    if (!titleMatch && !descMatch && !badgeMatch && !urlMatch) return false;
                }
                return true;
            });
            return { ...cat, items };
        });
    }, [categories, categoryFilter, statusFilter, searchQuery]);

    // SAVE & PUBLISH ALL CHANGES (Sync to DB & Mega Menu)
    const handleSaveServicesMenu = async () => {
        setSaving(true);
        try {
            const payload = {
                action: "save_services_menu",
                categories: categories.map((cat, cIdx) => ({
                    id: cat.id,
                    name: cat.name.trim().toUpperCase(),
                    slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: cat.description || "",
                    image: cat.image || "",
                    badge: cat.badge || "",
                    url: cat.url || "",
                    order: cIdx + 1,
                    showInMegaMenu: cat.showInMegaMenu !== false,
                    isActive: cat.isActive !== false,
                    isPublished: cat.isPublished !== false,
                    items: (cat.items || []).map((sub, sIdx) => ({
                        title: sub.title.trim(),
                        url: sub.url.trim() || "#",
                        badge: sub.badge?.trim() || "",
                        description: sub.description?.trim() || "",
                        subGroup: sub.subGroup?.trim() || "",
                        icon: sub.icon?.trim() || "",
                        isActive: sub.isActive !== false,
                        order: sIdx + 1
                    }))
                }))
            };

            const res = await axios.put("/api/admin/navigation", payload);
            if (res.data?.success) {
                showToast(res.data.message || "Services menu published successfully!");
                await fetchAllData();
            }
        } catch (err) {
            console.error("Error saving services menu:", err);
            showToast("Failed to save services menu: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // CATEGORY MANAGEMENT (Part 2)
    // ==========================================

    const openAddCategoryModal = () => {
        setEditingCatIdx(null);
        setCatFormData({
            name: "",
            slug: "",
            description: "",
            image: "",
            badge: "",
            url: "",
            order: categories.length + 1,
            showInMegaMenu: true,
            isActive: true,
            isPublished: true
        });
        setCatModalOpen(true);
    };

    const openEditCategoryModal = (catIdx) => {
        const cat = categories[catIdx];
        if (!cat) return;
        setEditingCatIdx(catIdx);
        setCatFormData({
            name: cat.name,
            slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: cat.description || "",
            image: cat.image || "",
            badge: cat.badge || "",
            url: cat.url || "",
            order: cat.order || (catIdx + 1),
            showInMegaMenu: cat.showInMegaMenu !== false,
            isActive: cat.isActive !== false,
            isPublished: cat.isPublished !== false
        });
        setCatModalOpen(true);
    };

    const handleSaveCategoryModal = () => {
        const cleanName = catFormData.name.trim().toUpperCase();
        if (!cleanName) {
            showToast("Category name cannot be empty", "error");
            return;
        }

        const cleanSlug = (catFormData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();

        if (editingCatIdx === null) {
            // Check for duplicate name
            if (categories.some(c => c.name.toUpperCase() === cleanName)) {
                showToast(`Category "${cleanName}" already exists`, "error");
                return;
            }
            const newCat = {
                name: cleanName,
                slug: cleanSlug,
                description: catFormData.description.trim(),
                image: catFormData.image,
                badge: catFormData.badge.trim(),
                url: catFormData.url.trim(),
                order: categories.length + 1,
                showInMegaMenu: catFormData.showInMegaMenu,
                isActive: catFormData.isActive,
                isPublished: catFormData.isPublished,
                items: [
                    {
                        title: "Coming Soon",
                        url: "#",
                        badge: "COMING SOON",
                        description: `Services under ${cleanName} launching soon.`,
                        isActive: true,
                        order: 1
                    }
                ]
            };
            setCategories(prev => [...prev, newCat]);
            showToast(`Category "${cleanName}" created! Remember to click "Save & Publish".`);
        } else {
            // Update existing
            setCategories(prev => {
                const next = [...prev];
                const oldName = next[editingCatIdx].name;
                next[editingCatIdx] = {
                    ...next[editingCatIdx],
                    name: cleanName,
                    slug: cleanSlug,
                    description: catFormData.description.trim(),
                    image: catFormData.image,
                    badge: catFormData.badge.trim(),
                    url: catFormData.url.trim(),
                    showInMegaMenu: catFormData.showInMegaMenu,
                    isActive: catFormData.isActive,
                    isPublished: catFormData.isPublished
                };
                return next;
            });
            showToast(`Category "${cleanName}" updated! Remember to click "Save & Publish".`);
        }
        setCatModalOpen(false);
    };

    const confirmDeleteCategory = (catIdx) => {
        const cat = categories[catIdx];
        if (!cat) return;
        setDeleteModal({
            isOpen: true,
            type: "category",
            catIdx,
            itemIdx: null,
            title: cat.name
        });
    };

    const executeDelete = async () => {
        if (deleteModal.type === "category") {
            const cat = categories[deleteModal.catIdx];
            if (!cat) return;
            // Also call API if it has an id
            if (cat.id) {
                try {
                    await axios.delete(`/api/admin/services/categories?id=${cat.id}`);
                } catch (e) {
                    console.warn("Could not delete category via direct API:", e);
                }
            }
            setCategories(prev => prev.filter((_, idx) => idx !== deleteModal.catIdx));
            showToast(`Category "${deleteModal.title}" deleted.`);
        } else if (deleteModal.type === "service") {
            const { catIdx, itemIdx } = deleteModal;
            setCategories(prev => {
                const next = [...prev];
                const cat = next[catIdx];
                if (cat) {
                    const deletedItem = cat.items[itemIdx];
                    cat.items = cat.items.filter((_, idx) => idx !== itemIdx);
                    // If no items left, keep a Coming Soon placeholder
                    if (cat.items.length === 0) {
                        cat.items.push({
                            title: "Coming Soon",
                            url: "#",
                            badge: "COMING SOON",
                            description: `Services under ${cat.name} launching soon.`,
                            isActive: true,
                            order: 1
                        });
                    }
                }
                return next;
            });
            showToast(`Service "${deleteModal.title}" deleted.`);
        }
        setDeleteModal({ isOpen: false, type: "service", catIdx: null, itemIdx: null, title: "" });
    };

    const handleMoveCategory = (catIdx, direction) => {
        const targetIdx = catIdx + direction;
        if (targetIdx < 0 || targetIdx >= categories.length) return;
        setCategories(prev => {
            const copy = [...prev];
            const temp = copy[catIdx];
            copy[catIdx] = copy[targetIdx];
            copy[targetIdx] = temp;
            return copy;
        });
    };

    const handleToggleCategoryMegaMenu = (catIdx) => {
        setCategories(prev => {
            const copy = [...prev];
            copy[catIdx] = {
                ...copy[catIdx],
                showInMegaMenu: copy[catIdx].showInMegaMenu === false ? true : false
            };
            return copy;
        });
    };

    const handleToggleCategoryActive = (catIdx) => {
        setCategories(prev => {
            const copy = [...prev];
            const newState = copy[catIdx].isActive === false ? true : false;
            copy[catIdx] = {
                ...copy[catIdx],
                isActive: newState,
                isPublished: newState
            };
            return copy;
        });
    };

    // ==========================================
    // SERVICE MANAGEMENT (Part 3 & 4: Full CRUD)
    // ==========================================

    const openAddServiceModal = (preferredCatName = null) => {
        setEditingServiceTarget(null);
        const catName = preferredCatName || (categories[0]?.name || "WEDDING");
        setServiceFormData({
            title: "",
            category: catName,
            url: "",
            slug: "",
            shortDescription: "",
            fullDescription: "",
            badge: "",
            isFeatured: false,
            heroImage: "",
            order: 1,
            isActive: true,
            isPublished: true
        });
        setServiceModalOpen(true);
    };

    const openEditServiceModal = (catIdx, itemIdx) => {
        const cat = categories[catIdx];
        if (!cat) return;
        const item = cat.items[itemIdx];
        if (!item) return;

        setEditingServiceTarget({ catIdx, itemIdx });
        const cleanSlug = extractSlug(item.url);
        // Find existing page description if available
        const matchedPage = servicePages.find(p => p.slug === cleanSlug);

        setServiceFormData({
            title: item.title,
            category: cat.name,
            url: item.url,
            slug: cleanSlug,
            shortDescription: item.description || "",
            fullDescription: matchedPage?.description || "",
            badge: item.badge || "",
            isFeatured: item.badge === "Featured" || item.badge === "Signature" || item.badge === "POPULAR",
            heroImage: matchedPage?.heroImage || "",
            order: item.order || (itemIdx + 1),
            isActive: item.isActive !== false,
            isPublished: item.isActive !== false
        });
        setServiceModalOpen(true);
    };

    const handleSaveServiceModal = async () => {
        const cleanTitle = serviceFormData.title.trim();
        if (!cleanTitle) {
            showToast("Service title is required", "error");
            return;
        }

        const targetCatName = (serviceFormData.category || "WEDDING").trim().toUpperCase();
        let targetCatIdx = categories.findIndex(c => c.name.toUpperCase() === targetCatName);
        if (targetCatIdx === -1) {
            targetCatIdx = 0;
        }

        let computedSlug = (serviceFormData.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).trim();
        let computedUrl = serviceFormData.url?.trim();
        if (!computedUrl || computedUrl === "#") {
            computedUrl = `/services/${computedSlug}/`;
        }

        const newServiceItem = {
            title: cleanTitle,
            url: computedUrl,
            badge: serviceFormData.badge?.trim() || (serviceFormData.isFeatured ? "Featured" : ""),
            description: serviceFormData.shortDescription?.trim() || "",
            isActive: serviceFormData.isActive !== false,
            order: Number(serviceFormData.order) || 1
        };

        // If creating/updating service page in background
        if (computedSlug && computedSlug !== "#") {
            try {
                await axios.post("/api/service-pages", {
                    slug: computedSlug,
                    title: cleanTitle,
                    description: serviceFormData.fullDescription || serviceFormData.shortDescription || "",
                    shortDescription: serviceFormData.shortDescription || "",
                    category: targetCatName,
                    heroImage: serviceFormData.heroImage || "",
                    featuredBadge: newServiceItem.badge,
                    active: newServiceItem.isActive,
                    isPublished: newServiceItem.isActive
                });
            } catch (err) {
                console.warn("Could not upsert service page:", err);
            }
        }

        setCategories(prev => {
            const next = [...prev];

            if (editingServiceTarget === null) {
                // ADD NEW SERVICE
                const targetCat = next[targetCatIdx];
                if (targetCat) {
                    // Remove "Coming Soon" placeholder if it was the only item
                    if (targetCat.items.length === 1 && targetCat.items[0].badge === "COMING SOON") {
                        targetCat.items = [newServiceItem];
                    } else {
                        targetCat.items.push(newServiceItem);
                    }
                }
            } else {
                // EDIT EXISTING SERVICE
                const { catIdx: origCatIdx, itemIdx: origItemIdx } = editingServiceTarget;
                if (origCatIdx === targetCatIdx) {
                    // Same category - update in place
                    next[origCatIdx].items[origItemIdx] = newServiceItem;
                } else {
                    // Category changed! Remove from original and add to target
                    next[origCatIdx].items.splice(origItemIdx, 1);
                    next[targetCatIdx].items.push(newServiceItem);
                }
            }
            return next;
        });

        showToast(`Service "${cleanTitle}" saved! Remember to click "Save & Publish Menu".`);
        setServiceModalOpen(false);
    };

    // DUPLICATE SERVICE (Part 4)
    const handleDuplicateService = (catIdx, itemIdx) => {
        const cat = categories[catIdx];
        if (!cat) return;
        const orig = cat.items[itemIdx];
        if (!orig) return;

        const copyTitle = `${orig.title} (Copy)`;
        const origSlug = extractSlug(orig.url);
        const copySlug = origSlug ? `${origSlug}-copy` : "";
        const copyUrl = copySlug ? `/services/${copySlug}/` : "#";

        const copyItem = {
            ...orig,
            title: copyTitle,
            url: copyUrl,
            order: (orig.order || itemIdx + 1) + 1
        };

        setCategories(prev => {
            const next = [...prev];
            next[catIdx].items.splice(itemIdx + 1, 0, copyItem);
            return next;
        });

        showToast(`Duplicated "${orig.title}" as "${copyTitle}".`);
    };

    const confirmDeleteService = (catIdx, itemIdx) => {
        const cat = categories[catIdx];
        if (!cat) return;
        const item = cat.items[itemIdx];
        if (!item) return;

        setDeleteModal({
            isOpen: true,
            type: "service",
            catIdx,
            itemIdx,
            title: item.title
        });
    };

    const handleMoveService = (catIdx, itemIdx, direction) => {
        const cat = categories[catIdx];
        if (!cat) return;
        const targetIdx = itemIdx + direction;
        if (targetIdx < 0 || targetIdx >= cat.items.length) return;

        setCategories(prev => {
            const next = [...prev];
            const items = [...next[catIdx].items];
            const temp = items[itemIdx];
            items[itemIdx] = items[targetIdx];
            items[targetIdx] = temp;
            next[catIdx].items = items;
            return next;
        });
    };

    const handleToggleServiceActive = (catIdx, itemIdx) => {
        setCategories(prev => {
            const next = [...prev];
            const item = next[catIdx].items[itemIdx];
            if (item) {
                item.isActive = item.isActive === false ? true : false;
            }
            return next;
        });
    };

    // Switch to Page Content Builder with pre-selected slug
    const handleJumpToPageBuilder = (url) => {
        const slug = extractSlug(url);
        if (!slug) {
            showToast("This service does not have an independent landing page slug yet.", "error");
            return;
        }
        setSelectedSlug(slug);
        setActiveTab("BUILD_PAGES");
    };

    // ==========================================
    // PAGE CONTENT BUILDER (Part 7)
    // ==========================================

    const allConfiguredSubcategories = useMemo(() => {
        const list = [];
        categories.forEach(cat => {
            (cat.items || []).forEach(sub => {
                if (sub.url && sub.url !== "#" && sub.url.includes("/services/")) {
                    list.push({
                        title: sub.title,
                        url: sub.url,
                        category: cat.name,
                        slug: extractSlug(sub.url)
                    });
                }
            });
        });
        return list;
    }, [categories]);

    // When selectedSlug changes, populate pageFormData
    useEffect(() => {
        if (!selectedSlug) return;
        const page = servicePages.find(p => p.slug === selectedSlug);
        if (page) {
            setPageFormData({
                title: page.title || "",
                subtitle: page.subtitle || "Services",
                description: page.description || "",
                shortDescription: page.shortDescription || "",
                category: page.category || "",
                heroImage: page.heroImage || "",
                heroImageAlt: page.heroImageAlt || "",
                heroVideo: page.heroVideo || "",
                gallery: page.gallery || [],
                videos: page.videos || [],
                videoSectionTitle: page.videoSectionTitle || "",
                videoSectionSubtitle: page.videoSectionSubtitle || "",
                sections: page.sections || [],
                testimonials: page.testimonials || [],
                seoTitle: page.seoTitle || "",
                metaDescription: page.metaDescription || "",
                metaKeywords: page.metaKeywords || "",
                ctaText: page.ctaText || "Get a Quote",
                ctaLink: page.ctaLink || "/contact",
                active: page.active !== false,
                isPublished: page.isPublished !== false
            });
        } else {
            const sub = allConfiguredSubcategories.find(s => s.slug === selectedSlug);
            setPageFormData({
                title: sub ? sub.title : selectedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                subtitle: "Luxury Production & Creative Services",
                description: "",
                shortDescription: "",
                category: sub ? sub.category : "",
                heroImage: "",
                heroImageAlt: "",
                heroVideo: "",
                gallery: [],
                videos: [],
                videoSectionTitle: "",
                videoSectionSubtitle: "",
                sections: [],
                testimonials: [],
                seoTitle: "",
                metaDescription: "",
                metaKeywords: "",
                ctaText: "Get a Quote",
                ctaLink: "/contact",
                active: true,
                isPublished: true
            });
        }
    }, [selectedSlug, servicePages, allConfiguredSubcategories]);

    const handleSavePageContent = async (e) => {
        e?.preventDefault();
        if (!selectedSlug) {
            showToast("Please select a service page to build", "error");
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post("/api/service-pages", {
                ...pageFormData,
                slug: selectedSlug
            });
            if (res.status === 200 || res.status === 201) {
                showToast(`Service page "${pageFormData.title}" saved and revalidated!`);
                const pagesRes = await axios.get("/api/service-pages");
                setServicePages(pagesRes.data || []);
            }
        } catch (err) {
            showToast("Error saving page: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleMoveVideo = async (vIdx, targetSlug) => {
        if (!targetSlug || targetSlug === selectedSlug) return;
        const videoToMove = pageFormData.videos[vIdx];
        if (!videoToMove) return;

        setSaving(true);
        try {
            const targetPage = servicePages.find(p => p.slug === targetSlug) || {};
            const targetVideos = [...(targetPage.videos || []), videoToMove];
            
            await axios.post("/api/service-pages", {
                ...targetPage,
                slug: targetSlug,
                title: targetPage.title || allConfiguredSubcategories.find(s => s.slug === targetSlug)?.title || targetSlug,
                videos: targetVideos
            });

            const remainingVideos = pageFormData.videos.filter((_, idx) => idx !== vIdx);
            const updatedCurrent = { ...pageFormData, videos: remainingVideos };
            setPageFormData(updatedCurrent);

            await axios.post("/api/service-pages", {
                ...updatedCurrent,
                slug: selectedSlug
            });

            const pagesRes = await axios.get("/api/service-pages");
            setServicePages(pagesRes.data || []);
            showToast(`Moved video to "${targetSlug}" successfully!`);
        } catch (err) {
            console.error("Failed to move video:", err);
            showToast("Failed to move video: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleFeatureOnHomepage = async (video) => {
        setSaving(true);
        try {
            const { data: contentData } = await axios.get("/api/content");
            const currentVault = contentData?.videoVault || [];
            const exists = currentVault.some(v => v.videoUrl === video.url);
            if (exists) {
                showToast("Video is already in Homepage Featured Vault!", "info");
                return;
            }
            const updatedVault = [
                ...currentVault,
                {
                    title: video.title || "Featured Production",
                    category: video.category || pageFormData.title || "Cinematic Film",
                    videoUrl: video.url,
                    image: video.thumbnail || ""
                }
            ];
            await axios.post("/api/content", {
                videoVault: updatedVault
            });
            showToast("Added video to Homepage Featured Vault!");
        } catch (err) {
            console.error("Failed to feature on homepage:", err);
            showToast("Failed to feature video: " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#050505] min-h-screen text-white flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-xs uppercase font-black tracking-widest text-[#c5a059]">Loading Services Management System...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#050505] min-h-screen text-white p-4 sm:p-8 md:p-12">
            {/* Top Toast Banner */}
            {toast.message && (
                <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    toast.type === "error" ? "bg-red-950/95 border-red-500/40 text-red-200" : "bg-[#0e0e0e]/95 border-[#c5a059]/50 text-[#c5a059]"
                }`}>
                    <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
                                Localhost Dynamic Backend
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                • Database Connected
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                            SERVICES <span className="text-[#c5a059]">MANAGEMENT</span>
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                            Control categories, individual services, landing pages, SEO, and frontend mega menu.
                        </p>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all"
                        >
                            <span>👁️</span> Preview Mega Menu
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveServicesMenu}
                            disabled={saving}
                            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(197,160,89,0.3)] transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    <span>Save &amp; Publish Menu</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* KPI SUMMARY CARDS (Part 9) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Categories</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-[#c5a059]">{stats.totalCategories}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Independent</span>
                        </div>
                    </div>
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Services</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats.totalServices}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Offerings</span>
                        </div>
                    </div>
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Published Services</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-400">{stats.publishedServices}</span>
                            <span className="text-[10px] text-emerald-500/70 uppercase font-bold">Live on Menu</span>
                        </div>
                    </div>
                    <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Draft / Inactive</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-amber-400">{stats.draftServices}</span>
                            <span className="text-[10px] text-amber-500/70 uppercase font-bold">Hidden</span>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex flex-wrap gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab("SERVICES_MENU")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "SERVICES_MENU"
                                ? "bg-[#c5a059] text-black shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <span>🗂️</span> 1. Services &amp; Categories ({categories.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("CATEGORY_MANAGER")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "CATEGORY_MANAGER"
                                ? "bg-[#c5a059] text-black shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <span>📂</span> 2. Category Manager
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("BUILD_PAGES")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "BUILD_PAGES"
                                ? "bg-[#c5a059] text-black shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <span>🛠️</span> 3. Page Content Builder ({allConfiguredSubcategories.length})
                    </button>
                </div>

                {/* ============================================================== */}
                {/* TAB 1: SERVICES & CATEGORIES (Main Services Overview) */}
                {/* ============================================================== */}
                {activeTab === "SERVICES_MENU" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Search, Filter & Action Bar */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                {/* Search input */}
                                <div className="relative min-w-[220px] flex-1 max-w-md">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search services by name, badge or url..."
                                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#c5a059] outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Category filter */}
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-bold uppercase tracking-wider focus:border-[#c5a059] outline-none"
                                >
                                    <option value="ALL">All Categories ({categories.length})</option>
                                    {categories.map((c, idx) => (
                                        <option key={idx} value={c.name}>{c.name}</option>
                                    ))}
                                </select>

                                {/* Status filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-bold uppercase tracking-wider focus:border-[#c5a059] outline-none"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PUBLISHED">Published Only</option>
                                    <option value="DRAFT">Draft / Hidden</option>
                                </select>
                            </div>

                            {/* Top Buttons */}
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                    type="button"
                                    onClick={openAddCategoryModal}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c5a059]/30 text-[#c5a059] text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    + Add Category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openAddServiceModal()}
                                    className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-md"
                                >
                                    + Add Service
                                </button>
                            </div>
                        </div>

                        {/* List of Categories */}
                        <div className="space-y-8">
                            {filteredCategories.map((cat, catIdx) => {
                                const origCatIdx = categories.findIndex(c => c.name === cat.name);
                                return (
                                    <div
                                        key={catIdx}
                                        className="bg-[#0b0b0b] border border-white/10 hover:border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-6 transition-all shadow-xl"
                                    >
                                        {/* Category Header Row */}
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-xs font-black text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-lg border border-[#c5a059]/20">
                                                    0{cat.order || (origCatIdx + 1)}
                                                </span>
                                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#c5a059]">
                                                    {cat.name}
                                                </h2>
                                                {cat.badge && (
                                                    <span className="text-[8px] bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                                        {cat.badge}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    ({cat.items.length} {cat.items.length === 1 ? "Service" : "Services"})
                                                </span>
                                            </div>

                                            {/* Category Controls */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Mega Menu Toggle */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleCategoryMegaMenu(origCatIdx)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                        cat.showInMegaMenu !== false
                                                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                                            : "bg-gray-900 border-gray-700 text-gray-400"
                                                    }`}
                                                    title="Toggle whether this category appears in the frontend mega menu"
                                                >
                                                    {cat.showInMegaMenu !== false ? "✓ Mega Menu: ON" : "✕ Mega Menu: OFF"}
                                                </button>

                                                {/* Active Toggle */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleCategoryActive(origCatIdx)}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                        cat.isActive !== false
                                                            ? "bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]"
                                                            : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                                                    }`}
                                                >
                                                    {cat.isActive !== false ? "Published" : "Draft"}
                                                </button>

                                                {/* Reorder Up/Down */}
                                                <button
                                                    type="button"
                                                    disabled={origCatIdx === 0}
                                                    onClick={() => handleMoveCategory(origCatIdx, -1)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white text-xs"
                                                    title="Move Category Up"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={origCatIdx === categories.length - 1}
                                                    onClick={() => handleMoveCategory(origCatIdx, 1)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white text-xs"
                                                    title="Move Category Down"
                                                >
                                                    ▼
                                                </button>

                                                {/* Edit Category */}
                                                <button
                                                    type="button"
                                                    onClick={() => openEditCategoryModal(origCatIdx)}
                                                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider"
                                                >
                                                    Edit Category
                                                </button>

                                                {/* Add Service to this category */}
                                                <button
                                                    type="button"
                                                    onClick={() => openAddServiceModal(cat.name)}
                                                    className="px-3 py-1.5 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/40 text-[#c5a059] text-[10px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    + Add Service
                                                </button>

                                                {/* Delete Category */}
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDeleteCategory(origCatIdx)}
                                                    className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-xs border border-red-500/20"
                                                    title="Delete this entire category"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {cat.description && (
                                            <p className="text-gray-400 text-xs italic">
                                                {cat.description}
                                            </p>
                                        )}

                                        {/* Service Items List */}
                                        <div className="space-y-3">
                                            {cat.items.length === 0 ? (
                                                <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center space-y-2">
                                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">No services in this category yet</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => openAddServiceModal(cat.name)}
                                                        className="text-xs font-black uppercase text-[#c5a059] hover:underline"
                                                    >
                                                        + Add First Service
                                                    </button>
                                                </div>
                                            ) : (
                                                cat.items.map((sub, itemIdx) => {
                                                    const isComingSoon = sub.badge === "COMING SOON" || sub.url === "#";
                                                    return (
                                                        <div
                                                            key={itemIdx}
                                                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                                                sub.isActive !== false
                                                                    ? "bg-[#101010] border-white/5 hover:border-[#c5a059]/30"
                                                                    : "bg-black/40 border-dashed border-white/5 opacity-60"
                                                            }`}
                                                        >
                                                            {/* Service details */}
                                                            <div className="space-y-1 flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-black text-white uppercase tracking-wide">
                                                                        {sub.title}
                                                                    </span>
                                                                    {sub.badge && (
                                                                        <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                                                                            sub.badge === "CERTIFIED"
                                                                                ? "bg-[#332815] text-[#c5a059] border border-[#c5a059]/40"
                                                                                : sub.badge === "POPULAR"
                                                                                ? "bg-[#251e12] text-[#d4af37] border border-[#d4af37]/40"
                                                                                : sub.badge === "COMING SOON"
                                                                                ? "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                                                                                : "bg-[#c5a059]/15 text-[#c5a059]"
                                                                        }`}>
                                                                            {sub.badge}
                                                                        </span>
                                                                    )}
                                                                    {sub.isActive === false && (
                                                                        <span className="text-[8px] bg-red-950/60 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
                                                                            Draft / Hidden
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {sub.description && (
                                                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-3xl line-clamp-2">
                                                                        {sub.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                                                                    <span>URL: {sub.url}</span>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons for Service */}
                                                            <div className="flex items-center gap-1.5 flex-shrink-0 self-end md:self-center">
                                                                {/* Up/Down order buttons */}
                                                                <button
                                                                    type="button"
                                                                    disabled={itemIdx === 0}
                                                                    onClick={() => handleMoveService(origCatIdx, itemIdx, -1)}
                                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-400 hover:text-white text-xs"
                                                                    title="Move Up"
                                                                >
                                                                    ▲
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={itemIdx === cat.items.length - 1}
                                                                    onClick={() => handleMoveService(origCatIdx, itemIdx, 1)}
                                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-400 hover:text-white text-xs"
                                                                    title="Move Down"
                                                                >
                                                                    ▼
                                                                </button>

                                                                {/* Active / Publish toggle */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleServiceActive(origCatIdx, itemIdx)}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                                        sub.isActive !== false
                                                                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                                                                            : "bg-gray-900 border-gray-700 text-gray-400"
                                                                    }`}
                                                                    title="Toggle publish / draft"
                                                                >
                                                                    {sub.isActive !== false ? "Live" : "Draft"}
                                                                </button>

                                                                {/* Edit Service */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditServiceModal(origCatIdx, itemIdx)}
                                                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider"
                                                                >
                                                                    Edit
                                                                </button>

                                                                {/* Duplicate Service (Part 4) */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDuplicateService(origCatIdx, itemIdx)}
                                                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#c5a059] text-[10px] font-black uppercase tracking-wider"
                                                                    title="Duplicate service"
                                                                >
                                                                    Duplicate
                                                                </button>

                                                                {/* Page Content Builder Quick Link */}
                                                                {sub.url && sub.url !== "#" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleJumpToPageBuilder(sub.url)}
                                                                        className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-black uppercase tracking-wider transition-all"
                                                                        title="Manage page content, hero, gallery, videos"
                                                                    >
                                                                        Page Content ↗
                                                                    </button>
                                                                )}

                                                                {/* Delete Service */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => confirmDeleteService(origCatIdx, itemIdx)}
                                                                    className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 text-xs border border-red-500/20"
                                                                    title="Permanently delete service"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 2: CATEGORY MANAGER (Dedicated Category Table & Settings) */}
                {/* ============================================================== */}
                {activeTab === "CATEGORY_MANAGER" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                    Category Management <span className="text-[#c5a059]">Dashboard</span>
                                </h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    Manage individual category names, slugs, ordering, descriptions, and mega menu visibility.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openAddCategoryModal}
                                className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-md"
                            >
                                + Add New Category
                            </button>
                        </div>

                        {/* Category Table */}
                        <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase tracking-widest text-[9px] font-black">
                                        <tr>
                                            <th className="py-4 px-6">Order</th>
                                            <th className="py-4 px-6">Category Name</th>
                                            <th className="py-4 px-6">Slug</th>
                                            <th className="py-4 px-6">Services</th>
                                            <th className="py-4 px-6">Mega Menu</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {categories.map((cat, catIdx) => (
                                            <tr key={catIdx} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-mono text-[#c5a059] font-black">0{catIdx + 1}</span>
                                                        <div className="flex flex-col ml-2">
                                                            <button
                                                                type="button"
                                                                disabled={catIdx === 0}
                                                                onClick={() => handleMoveCategory(catIdx, -1)}
                                                                className="text-[9px] text-gray-400 hover:text-white disabled:opacity-20"
                                                            >
                                                                ▲
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={catIdx === categories.length - 1}
                                                                onClick={() => handleMoveCategory(catIdx, 1)}
                                                                className="text-[9px] text-gray-400 hover:text-white disabled:opacity-20"
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <span className="font-black text-white uppercase tracking-wider text-sm">
                                                            {cat.name}
                                                        </span>
                                                        {cat.description && (
                                                            <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-1">
                                                                {cat.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-gray-400 text-[11px]">
                                                    {cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-bold">
                                                        {cat.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleCategoryMegaMenu(catIdx)}
                                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                            cat.showInMegaMenu !== false
                                                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                                                : "bg-gray-900 border-gray-700 text-gray-400"
                                                        }`}
                                                    >
                                                        {cat.showInMegaMenu !== false ? "Visible" : "Hidden"}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleCategoryActive(catIdx)}
                                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                            cat.isActive !== false
                                                                ? "bg-[#c5a059]/15 border-[#c5a059]/40 text-[#c5a059]"
                                                                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                                                        }`}
                                                    >
                                                        {cat.isActive !== false ? "Published" : "Draft"}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditCategoryModal(catIdx)}
                                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCategoryFilter(cat.name);
                                                                setActiveTab("SERVICES_MENU");
                                                            }}
                                                            className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-black uppercase tracking-wider transition-all"
                                                        >
                                                            View Services
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDeleteCategory(catIdx)}
                                                            className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 text-xs border border-red-500/20"
                                                            title="Delete category"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 3: PAGE CONTENT BUILDER (Part 7) */}
                {/* ============================================================== */}
                {activeTab === "BUILD_PAGES" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Selector Subheader */}
                        <div className="bg-[#0b0b0b] border border-white/10 p-6 rounded-3xl space-y-4">
                            <label className="text-xs font-black uppercase tracking-wider text-[#c5a059] block">
                                Choose Service Landing Page to Build &amp; Master
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <select
                                    value={selectedSlug}
                                    onChange={(e) => setSelectedSlug(e.target.value)}
                                    className="bg-black border border-white/10 rounded-2xl px-5 py-3 text-sm text-white font-bold outline-none focus:border-[#c5a059] flex-1"
                                >
                                    <option value="">-- Select a Service Page --</option>
                                    {allConfiguredSubcategories.map((sub, idx) => (
                                        <option key={idx} value={sub.slug}>
                                            [{sub.category}] {sub.title} (/services/{sub.slug}/)
                                        </option>
                                    ))}
                                </select>

                                {selectedSlug && (
                                    <a
                                        href={`/services/${selectedSlug}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <span>Preview Live</span> ↗
                                    </a>
                                )}
                            </div>
                        </div>

                        {selectedSlug ? (
                            <form onSubmit={handleSavePageContent} className="space-y-8">
                                {/* Core Info Section */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest pb-4 border-b border-white/5">
                                        1. Core Page Branding &amp; Headlines
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Page Title (H1)
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.title}
                                                onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Subtitle / Specialty
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.subtitle}
                                                onChange={(e) => setPageFormData({ ...pageFormData, subtitle: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Category Association
                                            </label>
                                            <select
                                                value={pageFormData.category}
                                                onChange={(e) => setPageFormData({ ...pageFormData, category: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]"
                                            >
                                                <option value="">-- Choose Category --</option>
                                                {categories.map((c, idx) => (
                                                    <option key={idx} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                SEO Canonical URL Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedSlug}
                                                disabled
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Short Description (Menu &amp; Meta Excerpt)
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.shortDescription}
                                                onChange={(e) => setPageFormData({ ...pageFormData, shortDescription: e.target.value })}
                                                placeholder="Brief 1-line description shown in mega menu"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Full Editorial Description (Landing Page Story)
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={pageFormData.description}
                                                onChange={(e) => setPageFormData({ ...pageFormData, description: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#c5a059] leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Media Section */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest pb-4 border-b border-white/5">
                                        2. Hero Banner &amp; Media
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Hero Banner Image
                                            </label>
                                            <ImageUploader
                                                currentImage={pageFormData.heroImage}
                                                recommendedSize="1920x800"
                                                onUploadSuccess={(url) => setPageFormData({ ...pageFormData, heroImage: url })}
                                            />
                                            <input
                                                type="text"
                                                value={pageFormData.heroImageAlt}
                                                onChange={(e) => setPageFormData({ ...pageFormData, heroImageAlt: e.target.value })}
                                                placeholder="Hero Image SEO Alt Text..."
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                Hero Video URL (Optional YouTube or MP4)
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.heroVideo}
                                                onChange={(e) => setPageFormData({ ...pageFormData, heroVideo: e.target.value })}
                                                placeholder="https://youtube.com/watch?v=... or direct mp4"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c5a059]"
                                            />
                                            <p className="text-gray-500 text-[10px] leading-relaxed">
                                                If supplied, this cinematic video will play in the hero header.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Sections Builder (Part 7) */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <div>
                                            <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">
                                                3. Service Content Sections ({pageFormData.sections?.length || 0})
                                            </h3>
                                            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Add rich content blocks, features and breakdowns</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPageFormData({
                                                ...pageFormData,
                                                sections: [...(pageFormData.sections || []), { title: "", subtitle: "", content: "", image: "", order: (pageFormData.sections?.length || 0) + 1 }]
                                            })}
                                            className="px-4 py-2 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/40 text-[#c5a059] text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            + Add Section
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(pageFormData.sections || []).map((sec, secIdx) => (
                                            <div key={secIdx} className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-[#c5a059] uppercase tracking-wider">
                                                        Section #{secIdx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const copy = [...pageFormData.sections];
                                                            copy.splice(secIdx, 1);
                                                            setPageFormData({ ...pageFormData, sections: copy });
                                                        }}
                                                        className="text-red-400 hover:text-red-200 text-xs font-black uppercase"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={sec.subtitle}
                                                        onChange={(e) => {
                                                            const copy = [...pageFormData.sections];
                                                            copy[secIdx].subtitle = e.target.value;
                                                            setPageFormData({ ...pageFormData, sections: copy });
                                                        }}
                                                        placeholder="Section Subtitle (e.g. Mastered Craftsmanship)"
                                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={sec.title}
                                                        onChange={(e) => {
                                                            const copy = [...pageFormData.sections];
                                                            copy[secIdx].title = e.target.value;
                                                            setPageFormData({ ...pageFormData, sections: copy });
                                                        }}
                                                        placeholder="Section Heading (e.g. 4K Cinema Optics)"
                                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                    />
                                                    <textarea
                                                        rows={3}
                                                        value={sec.content}
                                                        onChange={(e) => {
                                                            const copy = [...pageFormData.sections];
                                                            copy[secIdx].content = e.target.value;
                                                            setPageFormData({ ...pageFormData, sections: copy });
                                                        }}
                                                        placeholder="Section text narrative..."
                                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059] md:col-span-2"
                                                    />
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-[10px] text-gray-400 uppercase font-black">Section Feature Image (Optional)</label>
                                                        <ImageUploader
                                                            currentImage={sec.image}
                                                            recommendedSize="1200x800"
                                                            onUploadSuccess={(url) => {
                                                                const copy = [...pageFormData.sections];
                                                                copy[secIdx].image = url;
                                                                setPageFormData({ ...pageFormData, sections: copy });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Photo Gallery & Captured Frames Section (Part 3.5) */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                                        <div>
                                            <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">
                                                3.5 Captured Frames &amp; Photo Gallery ({pageFormData.gallery?.length || 0})
                                            </h3>
                                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">
                                                Manage high-definition portfolio still frames, ritual moments &amp; visual captures.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPageFormData({
                                                ...pageFormData,
                                                gallery: [...(pageFormData.gallery || []), { url: "", caption: "", alt: "" }]
                                            })}
                                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c5a059]/30 text-[#c5a059] text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            + Add Photo
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(pageFormData.gallery || []).length === 0 ? (
                                            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                                                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">No photos added yet in this service gallery.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setPageFormData({
                                                        ...pageFormData,
                                                        gallery: [{ url: "", caption: "", alt: "" }]
                                                    })}
                                                    className="mt-3 text-xs text-[#c5a059] underline font-bold uppercase tracking-wider"
                                                >
                                                    Click here to add the first photo
                                                </button>
                                            </div>
                                        ) : (
                                            (pageFormData.gallery || []).map((img, gIdx) => (
                                                <div key={gIdx} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-black/60 p-4 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
                                                    {/* Reorder Buttons & Index */}
                                                    <div className="flex items-center gap-1.5 self-start md:self-center">
                                                        <span className="w-6 h-6 rounded-lg bg-white/5 text-gray-400 text-[10px] font-black flex items-center justify-center">
                                                            {gIdx + 1}
                                                        </span>
                                                        <div className="flex flex-row md:flex-col gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={gIdx === 0}
                                                                onClick={() => {
                                                                    const copy = [...pageFormData.gallery];
                                                                    const temp = copy[gIdx - 1];
                                                                    copy[gIdx - 1] = copy[gIdx];
                                                                    copy[gIdx] = temp;
                                                                    setPageFormData({ ...pageFormData, gallery: copy });
                                                                }}
                                                                className="p-1 px-2 md:px-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-300 hover:text-white text-[10px] font-bold"
                                                                title="Move Up"
                                                            >
                                                                ▲
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={gIdx === pageFormData.gallery.length - 1}
                                                                onClick={() => {
                                                                    const copy = [...pageFormData.gallery];
                                                                    const temp = copy[gIdx + 1];
                                                                    copy[gIdx + 1] = copy[gIdx];
                                                                    copy[gIdx] = temp;
                                                                    setPageFormData({ ...pageFormData, gallery: copy });
                                                                }}
                                                                className="p-1 px-2 md:px-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-300 hover:text-white text-[10px] font-bold"
                                                                title="Move Down"
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Image Thumbnail Preview */}
                                                    <div className="w-24 aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-[#111] flex-shrink-0 flex items-center justify-center relative">
                                                         {img.url ? (
                                                             <img 
                                                                 src={img.url} 
                                                                 alt={img.alt || "Preview"} 
                                                                 className="w-full h-full object-cover" 
                                                             />
                                                         ) : (
                                                             <span className="text-[9px] text-gray-500 uppercase font-black text-center px-1">
                                                                 No Image
                                                             </span>
                                                         )}
                                                    </div>

                                                    {/* Inputs */}
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                         <input
                                                             type="text"
                                                             value={img.url}
                                                             onChange={(e) => {
                                                                 const copy = [...pageFormData.gallery];
                                                                 copy[gIdx].url = e.target.value;
                                                                 setPageFormData({ ...pageFormData, gallery: copy });
                                                             }}
                                                             placeholder="Image URL (https://...)"
                                                             className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                         />
                                                         <input
                                                             type="text"
                                                             value={img.caption || ""}
                                                             onChange={(e) => {
                                                                 const copy = [...pageFormData.gallery];
                                                                 copy[gIdx].caption = e.target.value;
                                                                 setPageFormData({ ...pageFormData, gallery: copy });
                                                             }}
                                                             placeholder="Caption (e.g. Saat Paak Ritual)"
                                                             className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                         />
                                                         <input
                                                             type="text"
                                                             value={img.alt || ""}
                                                             onChange={(e) => {
                                                                 const copy = [...pageFormData.gallery];
                                                                 copy[gIdx].alt = e.target.value;
                                                                 setPageFormData({ ...pageFormData, gallery: copy });
                                                             }}
                                                             placeholder="Alt text for SEO"
                                                             className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                         />
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                         type="button"
                                                         onClick={() => {
                                                             const copy = [...pageFormData.gallery];
                                                             copy.splice(gIdx, 1);
                                                             setPageFormData({ ...pageFormData, gallery: copy });
                                                         }}
                                                         className="px-3 py-2 rounded-xl bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 text-xs font-black uppercase transition-all border border-red-500/20 self-end md:self-center"
                                                         title="Remove photo"
                                                    >
                                                         Remove
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Video Showcase Section */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                                        <div>
                                            <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">
                                                4. Featured YouTube &amp; Video Showcase ({pageFormData.videos?.length || 0})
                                            </h3>
                                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">
                                                Add YouTube videos. Live thumbnails, 16:9 responsive embeds &amp; reordering controls.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPageFormData({
                                                ...pageFormData,
                                                videos: [...(pageFormData.videos || []), { title: "", url: "", thumbnail: "" }]
                                            })}
                                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c5a059]/30 text-[#c5a059] text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            + Add Video
                                        </button>
                                    </div>

                                    {/* Section Heading & Subtitle Configuration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                Video Gallery Heading (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.videoSectionTitle || ""}
                                                onChange={(e) => setPageFormData({ ...pageFormData, videoSectionTitle: e.target.value })}
                                                placeholder="e.g., Birthday Photography Videos"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                Video Gallery Subtitle (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.videoSectionSubtitle || ""}
                                                onChange={(e) => setPageFormData({ ...pageFormData, videoSectionSubtitle: e.target.value })}
                                                placeholder="e.g., Explore our celebratory birthday cinematography & candid moments."
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(pageFormData.videos || []).length === 0 ? (
                                            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                                                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">No videos added yet for this service.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setPageFormData({
                                                        ...pageFormData,
                                                        videos: [{ title: "", url: "", thumbnail: "" }]
                                                    })}
                                                    className="mt-3 text-xs text-[#c5a059] underline font-bold uppercase tracking-wider"
                                                >
                                                    Click here to add the first video
                                                </button>
                                            </div>
                                        ) : (
                                            (pageFormData.videos || []).map((vid, vIdx) => {
                                                const rawUrl = vid.url || "";
                                                const ytMatch = rawUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
                                                const ytId = ytMatch && ytMatch[2].length === 11 ? ytMatch[2] : (/^[a-zA-Z0-9_-]{11}$/.test(rawUrl.trim()) ? rawUrl.trim() : null);
                                                const thumbUrl = vid.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                                                return (
                                                    <div key={vIdx} className="bg-black/60 p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-all space-y-4">
                                                        {/* Top Row: Reorder, Index, Title, and Action Controls */}
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-lg bg-white/5 text-[#c5a059] text-[10px] font-black flex items-center justify-center">
                                                                    #{vIdx + 1}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={vIdx === 0}
                                                                        onClick={() => {
                                                                            const copy = [...pageFormData.videos];
                                                                            const temp = copy[vIdx - 1];
                                                                            copy[vIdx - 1] = copy[vIdx];
                                                                            copy[vIdx] = temp;
                                                                            setPageFormData({ ...pageFormData, videos: copy });
                                                                        }}
                                                                        className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-300 hover:text-white text-[10px] font-bold"
                                                                        title="Move Up"
                                                                    >
                                                                        ▲
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={vIdx === pageFormData.videos.length - 1}
                                                                        onClick={() => {
                                                                            const copy = [...pageFormData.videos];
                                                                            const temp = copy[vIdx + 1];
                                                                            copy[vIdx + 1] = copy[vIdx];
                                                                            copy[vIdx] = temp;
                                                                            setPageFormData({ ...pageFormData, videos: copy });
                                                                        }}
                                                                        className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-gray-300 hover:text-white text-[10px] font-bold"
                                                                        title="Move Down"
                                                                    >
                                                                        ▼
                                                                    </button>
                                                                </div>
                                                                {vid.category && (
                                                                    <span className="px-2 py-0.5 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-[9px] font-black uppercase tracking-wider border border-[#c5a059]/20">
                                                                        {vid.category}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                {vid.url && (
                                                                    <a
                                                                        href={vid.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold flex items-center gap-1"
                                                                        title="Open on YouTube"
                                                                    >
                                                                        Watch ↗
                                                                    </a>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFeatureOnHomepage(vid)}
                                                                    className="px-2.5 py-1 rounded-lg bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 text-[10px] font-black uppercase tracking-wider transition-all"
                                                                    title="Add to Homepage Featured Video Vault"
                                                                >
                                                                    ★ Feature on Home
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const copy = [...pageFormData.videos];
                                                                        copy.splice(vIdx, 1);
                                                                        setPageFormData({ ...pageFormData, videos: copy });
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 text-[10px] font-black uppercase transition-all border border-red-500/20"
                                                                    title="Remove video"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Middle Row: Preview & Form Fields */}
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                            {/* Thumbnail Preview */}
                                                            <div className="md:col-span-3">
                                                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center relative">
                                                                    {thumbUrl ? (
                                                                        <img 
                                                                            src={thumbUrl} 
                                                                            alt={vid.title || "Preview"} 
                                                                            className="w-full h-full object-cover" 
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[9px] text-gray-500 uppercase font-black text-center px-1">
                                                                            No Thumbnail
                                                                        </span>
                                                                    )}
                                                                    {ytId && (
                                                                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-black text-[#c5a059] uppercase">
                                                                            16:9
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] text-gray-500 mt-1 truncate">ID: {ytId || "custom URL"}</p>
                                                            </div>

                                                            {/* Inputs */}
                                                            <div className="md:col-span-9 space-y-3">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            Video Title / Caption
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={vid.title || ""}
                                                                            onChange={(e) => {
                                                                                const copy = [...pageFormData.videos];
                                                                                copy[vIdx].title = e.target.value;
                                                                                setPageFormData({ ...pageFormData, videos: copy });
                                                                            }}
                                                                            placeholder="e.g., Royal Bengali Wedding Cinematography"
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            YouTube URL / ID
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={vid.url || ""}
                                                                            onChange={(e) => {
                                                                                const copy = [...pageFormData.videos];
                                                                                const newUrl = e.target.value;
                                                                                copy[vIdx].url = newUrl;
                                                                                const m = newUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/);
                                                                                const id = m && m[2].length === 11 ? m[2] : null;
                                                                                if (id && !copy[vIdx].thumbnail) {
                                                                                    copy[vIdx].thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                                                                                }
                                                                                setPageFormData({ ...pageFormData, videos: copy });
                                                                            }}
                                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            Category / Style Tag
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={vid.category || ""}
                                                                            onChange={(e) => {
                                                                                const copy = [...pageFormData.videos];
                                                                                copy[vIdx].category = e.target.value;
                                                                                setPageFormData({ ...pageFormData, videos: copy });
                                                                            }}
                                                                            placeholder="e.g., Wedding Film, Drone Cinematography"
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            Custom Thumbnail URL (Optional)
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={vid.thumbnail || ""}
                                                                            onChange={(e) => {
                                                                                const copy = [...pageFormData.videos];
                                                                                copy[vIdx].thumbnail = e.target.value;
                                                                                setPageFormData({ ...pageFormData, videos: copy });
                                                                            }}
                                                                            placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Description and Move Video */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                                                                    <div className="sm:col-span-7">
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            Description / Synopsis (Optional)
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={vid.description || ""}
                                                                            onChange={(e) => {
                                                                                const copy = [...pageFormData.videos];
                                                                                copy[vIdx].description = e.target.value;
                                                                                setPageFormData({ ...pageFormData, videos: copy });
                                                                            }}
                                                                            placeholder="Brief scene or production notes..."
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                                        />
                                                                    </div>
                                                                    <div className="sm:col-span-5">
                                                                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                                                            Move to Service Page
                                                                        </label>
                                                                        <select
                                                                            defaultValue=""
                                                                            onChange={(e) => {
                                                                                const target = e.target.value;
                                                                                if (target) {
                                                                                    if (window.confirm(`Move video "${vid.title || 'Untitled'}" to ${target}?`)) {
                                                                                        handleMoveVideo(vIdx, target);
                                                                                    }
                                                                                    e.target.value = "";
                                                                                }
                                                                            }}
                                                                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#c5a059]"
                                                                        >
                                                                            <option value="" disabled>-- Move video to service... --</option>
                                                                            {allConfiguredSubcategories
                                                                                .filter(sub => sub.slug !== selectedSlug)
                                                                                .map((sub, sIdx) => (
                                                                                    <option key={sIdx} value={sub.slug}>
                                                                                        [{sub.category}] {sub.title}
                                                                                    </option>
                                                                                ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Testimonials Section (Part 7) */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <div>
                                            <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest">
                                                5. Client Testimonials ({pageFormData.testimonials?.length || 0})
                                            </h3>
                                            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Social proof, quotes, and star reviews</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPageFormData({
                                                ...pageFormData,
                                                testimonials: [...(pageFormData.testimonials || []), { clientName: "", company: "", comment: "", rating: 5, avatar: "" }]
                                            })}
                                            className="px-4 py-2 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/40 text-[#c5a059] text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            + Add Testimonial
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(pageFormData.testimonials || []).map((test, tIdx) => (
                                            <div key={tIdx} className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-[#c5a059] uppercase">Review #{tIdx + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const copy = [...pageFormData.testimonials];
                                                            copy.splice(tIdx, 1);
                                                            setPageFormData({ ...pageFormData, testimonials: copy });
                                                        }}
                                                        className="text-red-400 hover:text-red-200 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={test.clientName}
                                                        onChange={(e) => {
                                                            const copy = [...pageFormData.testimonials];
                                                            copy[tIdx].clientName = e.target.value;
                                                            setPageFormData({ ...pageFormData, testimonials: copy });
                                                        }}
                                                        placeholder="Client Name"
                                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={test.company}
                                                        onChange={(e) => {
                                                            const copy = [...pageFormData.testimonials];
                                                            copy[tIdx].company = e.target.value;
                                                            setPageFormData({ ...pageFormData, testimonials: copy });
                                                        }}
                                                        placeholder="Role / Company"
                                                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                                    />
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={test.comment}
                                                    onChange={(e) => {
                                                        const copy = [...pageFormData.testimonials];
                                                        copy[tIdx].comment = e.target.value;
                                                        setPageFormData({ ...pageFormData, testimonials: copy });
                                                    }}
                                                    placeholder="Client quote or praise..."
                                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SEO & CTA Settings (Part 7) */}
                                <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-3xl space-y-6">
                                    <h3 className="text-[#c5a059] text-xs font-black uppercase tracking-widest pb-4 border-b border-white/5">
                                        6. SEO &amp; Call To Action (CTA)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                SEO Meta Title
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.seoTitle}
                                                onChange={(e) => setPageFormData({ ...pageFormData, seoTitle: e.target.value })}
                                                placeholder="Custom SEO Title for Google (60 chars)"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                SEO Meta Keywords
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.metaKeywords}
                                                onChange={(e) => setPageFormData({ ...pageFormData, metaKeywords: e.target.value })}
                                                placeholder="kolkata, wedding, cinematic film, drone..."
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                SEO Meta Description
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={pageFormData.metaDescription}
                                                onChange={(e) => setPageFormData({ ...pageFormData, metaDescription: e.target.value })}
                                                placeholder="Search engine snippet text (155-160 chars)"
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                CTA Button Text
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.ctaText}
                                                onChange={(e) => setPageFormData({ ...pageFormData, ctaText: e.target.value })}
                                                placeholder="Get a Quote / Book Consultation"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                                CTA Button Link
                                            </label>
                                            <input
                                                type="text"
                                                value={pageFormData.ctaLink}
                                                onChange={(e) => setPageFormData({ ...pageFormData, ctaLink: e.target.value })}
                                                placeholder="/contact or /bookings"
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-10 py-4 rounded-2xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Publishing Page Content..." : "Save & Publish Page Content"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-[#0b0b0b] border border-dashed border-white/10 p-16 rounded-3xl text-center space-y-3">
                                <span className="text-3xl">📑</span>
                                <h4 className="text-base font-black uppercase tracking-wider text-gray-400">
                                    No Service Page Selected
                                </h4>
                                <p className="text-gray-500 text-xs max-w-md mx-auto">
                                    Select any service above from the dropdown to edit its hero image, videos, sections, testimonials, and SEO tags.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* ADD / EDIT CATEGORY MODAL (Part 2) */}
            {/* ============================================================== */}
            {catModalOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-[#0e0e0e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <h3 className="text-lg font-black uppercase tracking-wider text-[#c5a059]">
                                {editingCatIdx === null ? "+ Add New Category" : `Edit Category: ${catFormData.name}`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCatModalOpen(false)}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={catFormData.name}
                                    onChange={(e) => setCatFormData({
                                        ...catFormData,
                                        name: e.target.value.toUpperCase(),
                                        slug: catFormData.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                                    })}
                                    placeholder="e.g. LUXURY EVENTS"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059] uppercase font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Category Slug (URL Identifier)
                                </label>
                                <input
                                    type="text"
                                    value={catFormData.slug}
                                    onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                                    placeholder="e.g. luxury-events"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 font-mono outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Category Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={catFormData.description}
                                    onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                                    placeholder="Short summary of this service category..."
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Badge (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={catFormData.badge}
                                    onChange={(e) => setCatFormData({ ...catFormData, badge: e.target.value })}
                                    placeholder="e.g. Signature, COMING SOON"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={catFormData.showInMegaMenu}
                                        onChange={(e) => setCatFormData({ ...catFormData, showInMegaMenu: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold uppercase text-white">Show in Mega Menu</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={catFormData.isActive}
                                        onChange={(e) => setCatFormData({ ...catFormData, isActive: e.target.checked, isPublished: e.target.checked })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold uppercase text-white">Active / Published</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setCatModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCategoryModal}
                                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider"
                            >
                                {editingCatIdx === null ? "Add Category" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* ADD / EDIT SERVICE MODAL (Part 4) */}
            {/* ============================================================== */}
            {serviceModalOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-[#0e0e0e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <h3 className="text-lg font-black uppercase tracking-wider text-[#c5a059]">
                                {editingServiceTarget === null ? "+ Add New Service" : `Edit Service: ${serviceFormData.title}`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setServiceModalOpen(false)}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                            {/* Title & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Service Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceFormData.title}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setServiceFormData({
                                                ...serviceFormData,
                                                title: val,
                                                slug: serviceFormData.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                                            });
                                        }}
                                        placeholder="e.g. Cinematic Pre-Wedding"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#c5a059] font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Category *
                                    </label>
                                    <select
                                        value={serviceFormData.category}
                                        onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-[#c5a059]"
                                    >
                                        {categories.map((c, idx) => (
                                            <option key={idx} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* URL and Slug */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        SEO Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceFormData.slug}
                                        onChange={(e) => {
                                            const sl = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                            setServiceFormData({
                                                ...serviceFormData,
                                                slug: sl,
                                                url: `/services/${sl}/`
                                            });
                                        }}
                                        placeholder="e.g. pre-wedding-shoot-kolkata"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 font-mono outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Target URL
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceFormData.url}
                                        onChange={(e) => setServiceFormData({ ...serviceFormData, url: e.target.value })}
                                        placeholder="e.g. /services/... or #"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 font-mono outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            {/* Short Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Short Description (Mega Menu Caption)
                                </label>
                                <textarea
                                    rows={2}
                                    value={serviceFormData.shortDescription}
                                    onChange={(e) => setServiceFormData({ ...serviceFormData, shortDescription: e.target.value })}
                                    placeholder="Brief description displayed under the service title in the mega menu..."
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Full Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Full Editorial Description (Landing Page)
                                </label>
                                <textarea
                                    rows={3}
                                    value={serviceFormData.fullDescription}
                                    onChange={(e) => setServiceFormData({ ...serviceFormData, fullDescription: e.target.value })}
                                    placeholder="Comprehensive service description for the dedicated landing page..."
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                />
                            </div>

                            {/* Badges and Order */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Badge Text (e.g. CERTIFIED, POPULAR, Signature)
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceFormData.badge}
                                        onChange={(e) => setServiceFormData({ ...serviceFormData, badge: e.target.value })}
                                        placeholder="Leave empty or enter badge text"
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={serviceFormData.order}
                                        onChange={(e) => setServiceFormData({ ...serviceFormData, order: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            {/* Hero / Featured Image */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                    Featured Image
                                </label>
                                <ImageUploader
                                    currentImage={serviceFormData.heroImage}
                                    recommendedSize="1200x800"
                                    onUploadSuccess={(url) => setServiceFormData({ ...serviceFormData, heroImage: url })}
                                />
                            </div>

                            {/* Status Toggles */}
                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={serviceFormData.isActive}
                                        onChange={(e) => setServiceFormData({
                                            ...serviceFormData,
                                            isActive: e.target.checked,
                                            isPublished: e.target.checked
                                        })}
                                        className="accent-[#c5a059] w-4 h-4 rounded"
                                    />
                                    <span className="text-xs font-bold uppercase text-white">Active / Published</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setServiceModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveServiceModal}
                                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-white text-black text-xs font-black uppercase tracking-wider"
                            >
                                {editingServiceTarget === null ? "Add Service" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ============================================================== */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="bg-[#121212] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-400">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-base font-black uppercase tracking-wider">
                                Confirm Permanent Deletion
                            </h3>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed">
                            Are you sure you want to permanently delete{" "}
                            <span className="text-white font-black underline">{deleteModal.title}</span>?
                            {deleteModal.type === "category" && " All services under this category will also be removed."}
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, type: "service", catIdx: null, itemIdx: null, title: "" })}
                                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MEGA MENU LIVE PREVIEW MODAL (Part 6) */}
            {/* ============================================================== */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-[#0c0c0c] border border-[#c5a059]/40 rounded-3xl p-6 max-w-6xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <span className="text-xs uppercase font-black tracking-widest text-[#c5a059]">
                                    Live Mega Menu Simulation ({categories.filter(c => c.showInMegaMenu !== false && c.isActive !== false).length} Columns)
                                </span>
                                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode("desktop")}
                                        className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                                            previewMode === "desktop" ? "bg-[#c5a059] text-black" : "text-gray-400"
                                        }`}
                                    >
                                        Desktop
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode("mobile")}
                                        className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                                            previewMode === "mobile" ? "bg-[#c5a059] text-black" : "text-gray-400"
                                        }`}
                                    >
                                        Mobile
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPreviewOpen(false)}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {/* Preview Body */}
                        <div className="overflow-y-auto flex-1 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5">
                            {previewMode === "desktop" ? (
                                <div className="bg-[#0c0c0c] border border-[#c5a059]/35 rounded-3xl p-6 shadow-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 items-start">
                                        {categories
                                            .filter(cat => cat.showInMegaMenu !== false && cat.isActive !== false)
                                            .map((cat, cIdx) => (
                                                <div key={cIdx} className="space-y-3 min-w-0 w-full">
                                                    <div className="flex items-center pb-2.5 border-b border-[#242424]">
                                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#c5a059] truncate">
                                                            {cat.name}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(cat.items || []).filter(i => i.isActive !== false).map((item, iIdx) => (
                                                            <div key={iIdx} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                                                                <div className="flex items-start justify-between gap-1">
                                                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                                                                        {item.title}
                                                                    </span>
                                                                    {item.badge && (
                                                                        <span className="text-[7px] bg-[#c5a059]/20 text-[#c5a059] px-1 py-0.5 rounded font-black uppercase flex-shrink-0">
                                                                            {item.badge}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-[8.5px] text-gray-400 line-clamp-2 leading-relaxed">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-sm mx-auto bg-[#0c0c0c] border border-[#c5a059]/35 rounded-3xl p-4 space-y-3 shadow-2xl">
                                    {categories
                                        .filter(cat => cat.showInMegaMenu !== false && cat.isActive !== false)
                                        .map((cat, cIdx) => (
                                            <div key={cIdx} className="space-y-2 pb-3 border-b border-white/5">
                                                <h4 className="text-xs font-black uppercase text-[#c5a059] tracking-wider">
                                                    {cat.name}
                                                </h4>
                                                <div className="space-y-1.5 pl-2">
                                                    {(cat.items || []).filter(i => i.isActive !== false).map((item, iIdx) => (
                                                        <div key={iIdx} className="flex justify-between items-center text-[10px] text-gray-300">
                                                            <span>{item.title}</span>
                                                            {item.badge && (
                                                                <span className="text-[7px] bg-[#c5a059]/20 text-[#c5a059] px-1 py-0.5 rounded font-black">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
