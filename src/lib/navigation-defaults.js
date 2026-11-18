/**
 * Flagship default navigation structure for Dreamline Production.
 * Used when initializing a fresh database or resetting the menu.
 */

export const DEFAULT_NAVIGATION_SEED = [
    {
        title: "HOME",
        url: "/",
        type: "internal",
        order: 1,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: false,
        children: []
    },
    {
        title: "ABOUT US",
        url: "/about/",
        type: "internal",
        order: 2,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: false,
        children: []
    },
    {
        title: "SERVICES",
        url: "/services/",
        type: "internal",
        order: 3,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: true,
        badge: "",
        children: [
            // Category 1: WEDDING (3 items)
            {
                title: "Pre Wedding",
                url: "/services/pre-wedding-shoot-kolkata/",
                type: "internal",
                order: 1,
                group: "WEDDING",
                badge: "",
                description: "Cinematic romantic storytelling at Prinsep Ghat & heritage sites",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Wedding",
                url: "/services/wedding-photography-kolkata/",
                type: "internal",
                order: 2,
                group: "WEDDING",
                badge: "Signature",
                description: "Luxury candid photography & emotional Bengali rituals",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Post Wedding",
                url: "/services/post-wedding-photography-kolkata/",
                type: "internal",
                order: 3,
                group: "WEDDING",
                badge: "",
                description: "Intimate post-ceremony portraits, reception & newlywed memories",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 2: CORPORATE (9 items in exact order)
            {
                title: "Commercial Ad",
                url: "/services/commercial-ad-films-kolkata/",
                type: "internal",
                order: 4,
                group: "CORPORATE",
                badge: "Featured",
                description: "High-impact brand commercials, TVCs & digital ad campaigns",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Brand Promotion",
                url: "/services/brand-promotion-kolkata/",
                type: "internal",
                order: 5,
                group: "CORPORATE",
                badge: "",
                description: "Strategic promotional video campaigns for corporate brand growth",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Corporate Film",
                url: "/services/corporate-photography-kolkata/",
                type: "internal",
                order: 6,
                group: "CORPORATE",
                badge: "",
                description: "Executive portraits, facility walkthroughs & brand documentaries",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Short Film",
                url: "/services/short-film-production-kolkata/",
                type: "internal",
                order: 7,
                group: "CORPORATE",
                badge: "",
                description: "Narrative fiction, festival entries & branded creative shorts",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "3D Visualization",
                url: "/services/3d-visualization-kolkata/",
                type: "internal",
                order: 8,
                group: "CORPORATE",
                badge: "",
                description: "CGI rendering, architectural 3D walkthroughs & visual simulations",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Live Stream & Broadcast",
                url: "/services/live-stream-broadcast-kolkata/",
                type: "internal",
                order: 9,
                group: "CORPORATE",
                badge: "",
                description: "Multi-camera live streaming, virtual conferences & hybrid broadcasts",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Fashion Photography",
                url: "/services/fashion-photography-kolkata/",
                type: "internal",
                order: 10,
                group: "CORPORATE",
                badge: "",
                description: "Editorial lookbooks, studio catalogs & model portfolio shoots",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Podcast",
                url: "/services/podcast-production-kolkata/",
                type: "internal",
                order: 11,
                group: "CORPORATE",
                badge: "",
                description: "Multi-camera 4K podcast recording, acoustic studio & engineering",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Documentary Film",
                url: "/services/documentary-film-production-kolkata/",
                type: "internal",
                order: 12,
                group: "CORPORATE",
                badge: "",
                description: "Impactful non-fiction storytelling, social causes & heritage films",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 3: DRONE & AERIAL (3 items - Independent 3rd Column)
            {
                title: "DRONE PHOTOGRAPHY",
                url: "/services/drone-photography-kolkata/",
                type: "internal",
                order: 13,
                group: "DRONE & AERIAL",
                icon: "🛸",
                badge: "CERTIFIED",
                description: "DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE & EVENTS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "DRONE VIDEOGRAPHY",
                url: "/services/drone-videography-kolkata/",
                type: "internal",
                order: 14,
                group: "DRONE & AERIAL",
                icon: "🛸",
                badge: "POPULAR",
                description: "CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY & DYNAMIC REELS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "3D AREA AND MAPPING",
                url: "/services/3d-area-mapping-kolkata/",
                type: "internal",
                order: 15,
                group: "DRONE & AERIAL",
                icon: "🛸",
                badge: "",
                description: "AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS & 3D MODELS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 4: SOCIAL (3 items)
            {
                title: "Birthday Photography",
                url: "/services/birthday-photography-kolkata/",
                type: "internal",
                order: 16,
                group: "SOCIAL",
                badge: "",
                description: "MILESTONE CELEBRATIONS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Rice Ceremony",
                url: "/services/rice-ceremony-photography-kolkata/",
                type: "internal",
                order: 17,
                group: "SOCIAL",
                badge: "Traditional",
                description: "SACRED ANNAPRASHAN RITUALS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Other Social Events",
                url: "/services/other-social-events-kolkata/",
                type: "internal",
                order: 18,
                group: "SOCIAL",
                badge: "",
                description: "ANNIVERSARIES, CULTURAL AND FAMILY EVENTS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 5: TECH (1 item)
            {
                title: "Website",
                url: "/tech",
                type: "internal",
                order: 19,
                group: "TECH",
                badge: "",
                description: "MODERN RESPONSIVE WEB DESIGN, PORTFOLIO SHOWCASES & CUSTOM WEB APPLICATIONS",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 6: EVENT MANAGEMENT (1 item)
            {
                title: "Coming Soon",
                url: "#",
                type: "internal",
                order: 20,
                group: "EVENT MANAGEMENT",
                badge: "COMING SOON",
                description: "Full-scale corporate summits, concerts & luxury event planning",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            }
        ]
    },
    {
        title: "PORTFOLIO",
        url: "/portfolio/",
        type: "internal",
        order: 4,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: true,
        children: [
            {
                title: "Master Portfolio",
                url: "/portfolio/",
                type: "internal",
                order: 1,
                icon: "✨",
                description: "Complete showcase of cinema & commercial work",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Luxury Wedding Cinema",
                url: "/luxury",
                type: "internal",
                order: 2,
                icon: "💍",
                description: "Award-winning Bengali & destination wedding films",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Commercial & Ad Films",
                url: "/commercial",
                type: "internal",
                order: 3,
                icon: "🎥",
                description: "High-impact brand campaigns, TVCs & corporate stories",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Tech & 3D Innovation",
                url: "/tech",
                type: "internal",
                order: 4,
                icon: "💻",
                description: "3D area mapping, VFX & digital web engineering",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            }
        ]
    },
    {
        title: "BLOGS",
        url: "/blogs/",
        type: "internal",
        order: 5,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: false,
        children: []
    },
    {
        title: "CONTACT US",
        url: "/contact/",
        type: "internal",
        order: 6,
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: false,
        children: []
    }
];
