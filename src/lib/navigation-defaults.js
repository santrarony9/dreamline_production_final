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

            // Category 2: CORPORATE (7 items)
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
                title: "Documentary Film",
                url: "/services/documentary-film-production-kolkata/",
                type: "internal",
                order: 9,
                group: "CORPORATE",
                badge: "",
                description: "Engaging cultural narratives, heritage films & institutional stories",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Podcast",
                url: "/services/podcast-production-kolkata/",
                type: "internal",
                order: 10,
                group: "CORPORATE",
                badge: "",
                description: "Multi-camera 4K podcast recording, acoustic studio & engineering",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 3: DRONE & AERIAL (3 items)
            {
                title: "Drone Photography",
                url: "/services/drone-photography-kolkata/",
                type: "internal",
                order: 11,
                group: "DRONE & AERIAL",
                badge: "Certified",
                description: "DGCA-certified 4K aerial photography for architecture & events",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Drone Videography",
                url: "/services/drone-videography-kolkata/",
                type: "internal",
                order: 12,
                group: "DRONE & AERIAL",
                badge: "Popular",
                description: "Cinematic 4K FPV aerial cinematography & dynamic reels",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "3D Area and Mapping",
                url: "/services/3d-area-mapping-kolkata/",
                type: "internal",
                order: 13,
                group: "DRONE & AERIAL",
                badge: "",
                description: "Aerial photogrammetry, topographical surveys & 3D models",
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
                order: 14,
                group: "SOCIAL",
                badge: "",
                description: "Milestone birthday cinematography, vibrant celebrations & candid moments",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Rice Ceremony",
                url: "/services/rice-ceremony-photography-kolkata/",
                type: "internal",
                order: 15,
                group: "SOCIAL",
                badge: "Traditional",
                description: "Sacred Annaprashan rituals, baby photography & family blessings",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Other Social Events",
                url: "/services/other-social-events-kolkata/",
                type: "internal",
                order: 16,
                group: "SOCIAL",
                badge: "",
                description: "Anniversaries, cultural gatherings & festive social celebrations",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 5: FASHION (3 items)
            {
                title: "Fashion Photography",
                url: "/services/fashion-photography-kolkata/",
                type: "internal",
                order: 17,
                group: "FASHION",
                badge: "Editorial",
                description: "High-fashion editorials, designer lookbooks, haute couture & agency portfolios",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Fashion Videography",
                url: "/services/fashion-videography-kolkata/",
                type: "internal",
                order: 18,
                group: "FASHION",
                badge: "Cinematic",
                description: "Runway videography, fashion week coverage & dynamic stylized model reels",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Fashion Films",
                url: "/services/fashion-films-kolkata/",
                type: "internal",
                order: 19,
                group: "FASHION",
                badge: "4K Cinema",
                description: "Narrative brand films, designer campaigns & artistic luxury fashion storytelling",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 6: PRODUCT (3 items)
            {
                title: "Product Photography",
                url: "/services/product-photography-kolkata/",
                type: "internal",
                order: 20,
                group: "PRODUCT",
                badge: "Studio 4K",
                description: "E-commerce white-background catalogs, lifestyle flatlays & luxury macro details",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Product Videography",
                url: "/services/product-videography-kolkata/",
                type: "internal",
                order: 21,
                group: "PRODUCT",
                badge: "Dynamic",
                description: "360-degree rotating turntable captures, stop-motion & interactive product reels",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Product Commercials",
                url: "/services/product-commercials-kolkata/",
                type: "internal",
                order: 22,
                group: "PRODUCT",
                badge: "Campaign",
                description: "High-conversion digital ad films, social media campaigns & launch commercials",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 7: POST PRODUCTION (5 items)
            {
                title: "Video Editing",
                url: "/services/video-editing-kolkata/",
                type: "internal",
                order: 23,
                group: "POST PRODUCTION",
                badge: "Precision",
                description: "Multi-track timeline assembly, rhythmic pacing, dialogue editing & audio mastering",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Cinematic Editing",
                url: "/services/cinematic-editing-kolkata/",
                type: "internal",
                order: 24,
                group: "POST PRODUCTION",
                badge: "Narrative",
                description: "Dramatic film editing, emotional arc construction & feature-length pacing",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Colour Grading",
                url: "/services/colour-grading-kolkata/",
                type: "internal",
                order: 25,
                group: "POST PRODUCTION",
                badge: "DaVinci Pro",
                description: "DaVinci Resolve colour mastering, custom LUT creation & HDR tone mapping",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "VFX & Motion Graphics",
                url: "/services/vfx-and-motion-graphics-kolkata/",
                type: "internal",
                order: 26,
                group: "POST PRODUCTION",
                badge: "CGI & 3D",
                description: "Visual effects compositing, 3D title design, logo animations & cleanups",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Photo Retouching",
                url: "/services/photo-retouching-kolkata/",
                type: "internal",
                order: 27,
                group: "POST PRODUCTION",
                badge: "High-End",
                description: "Frequency separation skin retouching, color correction & magazine finishing",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 8: TECH (2 items)
            {
                title: "Website",
                url: "/tech",
                type: "internal",
                order: 28,
                group: "TECH",
                badge: "Digital",
                description: "Modern responsive web engineering, digital portfolios & interactive platforms",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Live Stream & Broadcast",
                url: "/services/live-stream-broadcast-kolkata/",
                type: "internal",
                order: 29,
                group: "TECH",
                badge: "Multi-Cam",
                description: "Multi-camera 4K live streaming, virtual summits & hybrid event broadcasts",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Category 9: EVENT MANAGEMENT (1 item)
            {
                title: "Coming Soon",
                url: "#",
                type: "internal",
                order: 30,
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
