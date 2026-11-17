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
        badge: "10+",
        children: [
            // Group 1: Drone & Aerial
            {
                title: "Drone Photography",
                url: "/services/drone-photography-kolkata/",
                type: "internal",
                order: 1,
                group: "Drone & Aerial",
                icon: "🛸",
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
                order: 2,
                group: "Drone & Aerial",
                icon: "🛸",
                badge: "Popular",
                description: "Cinematic 4K FPV aerial cinematography & dynamic reels",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "3D Area Mapping",
                url: "/services/3d-area-mapping-kolkata/",
                type: "internal",
                order: 3,
                group: "Drone & Aerial",
                icon: "🛸",
                badge: "",
                description: "Aerial photogrammetry, topographical surveys & 3D models",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Group 2: Commercial & Corporate
            {
                title: "Video Production Agency",
                url: "/services/video-production-agency-kolkata/",
                type: "internal",
                order: 4,
                group: "Commercial & Corporate",
                icon: "🎥",
                badge: "Featured",
                description: "Brand commercials, TVCs, ad films & digital campaigns",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Corporate Photography",
                url: "/services/corporate-photography-kolkata/",
                type: "internal",
                order: 5,
                group: "Commercial & Corporate",
                icon: "🎥",
                badge: "",
                description: "Executive portraits, facility walkthroughs & brand stories",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Podcast Production",
                url: "/services/podcast-production-kolkata/",
                type: "internal",
                order: 6,
                group: "Commercial & Corporate",
                icon: "🎥",
                badge: "",
                description: "Multi-camera 4K podcast recording & audio engineering in Kolkata",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Documentary Films",
                url: "/services/documentary-film-production-kolkata/",
                type: "internal",
                order: 7,
                group: "Commercial & Corporate",
                icon: "🎥",
                badge: "",
                description: "Engaging cultural narratives & corporate documentaries",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },

            // Group 3: Weddings & Celebrations
            {
                title: "Wedding Photography",
                url: "/services/wedding-photography-kolkata/",
                type: "internal",
                order: 8,
                group: "Weddings & Celebrations",
                icon: "💍",
                badge: "Signature",
                description: "Luxury candid photography & emotional Bengali rituals",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Pre-Wedding Shoots",
                url: "/services/pre-wedding-shoot-kolkata/",
                type: "internal",
                order: 9,
                group: "Weddings & Celebrations",
                icon: "💍",
                badge: "",
                description: "Cinematic romantic storytelling at Prinsep Ghat & heritage sites",
                openInNewTab: false,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            },
            {
                title: "Rice Ceremony",
                url: "/services/rice-ceremony-photography-kolkata/",
                type: "internal",
                order: 10,
                group: "Weddings & Celebrations",
                icon: "💍",
                badge: "",
                description: "Traditional Annaprashan milestones & cherished family rituals",
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
