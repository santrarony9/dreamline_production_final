import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment.");
    process.exit(1);
}

// 19 Services across exactly 5 categories
const SERVICES_HIERARCHY = [
    // Category 1: WEDDING (3 items)
    {
        title: "Pre Wedding",
        url: "/services/pre-wedding-shoot-kolkata/",
        group: "WEDDING",
        order: 1,
        badge: "",
        description: "Cinematic romantic storytelling at Prinsep Ghat & heritage sites"
    },
    {
        title: "Wedding",
        url: "/services/wedding-photography-kolkata/",
        group: "WEDDING",
        order: 2,
        badge: "Signature",
        description: "Luxury candid photography & emotional Bengali rituals"
    },
    {
        title: "Post Wedding",
        url: "/services/post-wedding-photography-kolkata/",
        group: "WEDDING",
        order: 3,
        badge: "",
        description: "Intimate post-ceremony portraits, reception & newlywed memories"
    },

    // Category 2: CORPORATE (12 items in exact order)
    {
        title: "Commercial Ad",
        url: "/services/commercial-ad-films-kolkata/",
        group: "CORPORATE",
        order: 4,
        badge: "Featured",
        description: "High-impact brand commercials, TVCs & digital ad campaigns"
    },
    {
        title: "Brand Promotion",
        url: "/services/brand-promotion-kolkata/",
        group: "CORPORATE",
        order: 5,
        badge: "",
        description: "Strategic promotional video campaigns for corporate brand growth"
    },
    {
        title: "Corporate Film",
        url: "/services/corporate-photography-kolkata/",
        group: "CORPORATE",
        order: 6,
        badge: "",
        description: "Executive portraits, facility walkthroughs & brand documentaries"
    },
    {
        title: "Short Film",
        url: "/services/short-film-production-kolkata/",
        group: "CORPORATE",
        order: 7,
        badge: "",
        description: "Narrative fiction, festival entries & branded creative shorts"
    },
    {
        title: "Drone Photography",
        url: "/services/drone-photography-kolkata/",
        group: "CORPORATE",
        subGroup: "DRONE & AERIAL",
        icon: "🛸",
        order: 8,
        badge: "CERTIFIED",
        description: "DGCA-CERTIFIED 4K AERIAL PHOTOGRAPHY FOR ARCHITECTURE & EVENTS"
    },
    {
        title: "Drone Videography",
        url: "/services/drone-videography-kolkata/",
        group: "CORPORATE",
        subGroup: "DRONE & AERIAL",
        icon: "🛸",
        order: 9,
        badge: "POPULAR",
        description: "CINEMATIC 4K FPV AERIAL CINEMATOGRAPHY & DYNAMIC REELS"
    },
    {
        title: "3D Area and Mapping",
        url: "/services/3d-area-mapping-kolkata/",
        group: "CORPORATE",
        subGroup: "DRONE & AERIAL",
        icon: "🛸",
        order: 10,
        badge: "",
        description: "AERIAL PHOTOGRAMMETRY, TOPOGRAPHICAL SURVEYS & 3D MODELS"
    },
    {
        title: "3D Visualization",
        url: "/services/3d-visualization-kolkata/",
        group: "CORPORATE",
        order: 11,
        badge: "",
        description: "CGI rendering, architectural 3D walkthroughs & visual simulations"
    },
    {
        title: "Live Stream & Broadcast",
        url: "/services/live-stream-broadcast-kolkata/",
        group: "CORPORATE",
        order: 12,
        badge: "",
        description: "Multi-camera live streaming, virtual conferences & hybrid broadcasts"
    },
    {
        title: "Fashion Photography",
        url: "/services/fashion-photography-kolkata/",
        group: "CORPORATE",
        order: 13,
        badge: "",
        description: "Editorial lookbooks, studio catalogs & model portfolio shoots"
    },
    {
        title: "Podcast",
        url: "/services/podcast-production-kolkata/",
        group: "CORPORATE",
        order: 14,
        badge: "",
        description: "Multi-camera 4K podcast recording, acoustic studio & engineering"
    },
    {
        title: "Documentary Film",
        url: "/services/documentary-film-production-kolkata/",
        group: "CORPORATE",
        order: 15,
        badge: "",
        description: "Engaging cultural narratives, heritage films & institutional stories"
    },

    // Category 3: SOCIAL (3 items)
    {
        title: "Birthday Photography",
        url: "/services/birthday-photography-kolkata/",
        group: "SOCIAL",
        order: 16,
        badge: "",
        description: "Milestone birthdays, theme celebrations & candid family moments"
    },
    {
        title: "Rice Ceremony",
        url: "/services/rice-ceremony-photography-kolkata/",
        group: "SOCIAL",
        order: 17,
        badge: "Traditional",
        description: "Traditional Annaprashan milestones & cherished family rituals"
    },
    {
        title: "Other Social Events",
        url: "/services/other-social-events-kolkata/",
        group: "SOCIAL",
        order: 18,
        badge: "",
        description: "Anniversaries, family reunions, cultural festivals & celebrations"
    },

    // Category 4: TECH (1 item)
    {
        title: "Website",
        url: "/tech",
        group: "TECH",
        order: 19,
        badge: "Digital",
        description: "Cinematic web engineering, high-performance UI/UX & digital apps"
    },

    // Category 5: EVENT MANAGEMENT (1 item)
    {
        title: "Coming Soon",
        url: "#",
        group: "EVENT MANAGEMENT",
        order: 20,
        badge: "COMING SOON",
        description: "Full-scale corporate summits, concerts & luxury event planning"
    }
];

// Default service pages to seed if missing
const MISSING_SERVICE_PAGES = [
    {
        slug: "post-wedding-photography-kolkata",
        title: "Post-Wedding Photography in Kolkata",
        subtitle: "Luxury Post-Wedding & Reception Shoots",
        description: "Capture the newlywed romance and grand reception elegance with Dreamline Production's bespoke post-wedding photography in Kolkata.",
        active: true,
        gallery: [],
        videos: []
    },
    {
        slug: "short-film-production-kolkata",
        title: "Short Film Production in Kolkata",
        subtitle: "Narrative & Festival Cinema",
        description: "Award-winning short film production house in Kolkata, offering complete script-to-screen filmmaking, casting, and cinematic color grading.",
        active: true,
        gallery: [],
        videos: []
    },
    {
        slug: "3d-visualization-kolkata",
        title: "3D Visualization & Architectural CGI in Kolkata",
        subtitle: "Photorealistic 3D Walkthroughs & CGI",
        description: "State-of-the-art 3D architectural rendering, photorealistic CGI animations, and visual walkthroughs for real estate developers and designers.",
        active: true,
        aliases: ["3d-visualization", "2d-animation-kolkata"],
        gallery: [],
        videos: []
    },
    {
        slug: "live-stream-broadcast-kolkata",
        title: "Live Stream & Multi-Camera Broadcast in Kolkata",
        subtitle: "Broadcast-Grade Live Streaming",
        description: "Low-latency multi-camera 4K live streaming and hybrid event broadcasts for corporate summits, award shows, and luxury weddings.",
        active: true,
        gallery: [],
        videos: []
    },
    {
        slug: "fashion-photography-kolkata",
        title: "Fashion Photography in Kolkata",
        subtitle: "Editorial Lookbooks & Haute Couture",
        description: "High-fashion editorial shoots, commercial fashion lookbooks, and high-end model portfolios by Kolkata's leading creative production studio.",
        active: true,
        gallery: [],
        videos: []
    },
    {
        slug: "birthday-photography-kolkata",
        title: "Birthday Photography in Kolkata",
        subtitle: "Milestone Celebrations & Candids",
        description: "Vibrant candid photography and cinematic video coverage for milestone birthday celebrations, kids' themes, and luxury private parties.",
        active: true,
        gallery: [],
        videos: []
    },
    {
        slug: "other-social-events-kolkata",
        title: "Social Events & Celebration Photography in Kolkata",
        subtitle: "Anniversaries & Cultural Galas",
        description: "Preserve every milestone anniversary, cultural celebration, and prestigious gathering with timeless cinematography and candid portraits.",
        active: true,
        gallery: [],
        videos: []
    }
];

async function run() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log("=== 1. BACKING UP CURRENT NAVIGATION ITEMS ===");
    const currentNavItems = await db.collection('navigationitems').find({}).toArray();
    const backupCollectionName = `navigationitems_backup_${Date.now()}`;
    if (currentNavItems.length > 0) {
        await db.collection(backupCollectionName).insertMany(currentNavItems);
        console.log(`Backed up ${currentNavItems.length} items to "${backupCollectionName}".`);
    }

    console.log("\n=== 2. SEEDING MISSING SERVICE PAGES ===");
    for (const page of MISSING_SERVICE_PAGES) {
        const existing = await db.collection('servicepages').findOne({ slug: page.slug });
        if (!existing) {
            await db.collection('servicepages').insertOne({
                ...page,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`+ Created ServicePage: ${page.slug} (${page.title})`);
        } else {
            console.log(`✓ ServicePage already exists: ${page.slug}`);
        }
    }

    console.log("\n=== 3. LOCATING OR CREATING SERVICES ROOT MENU ITEM ===");
    let servicesRoot = await db.collection('navigationitems').findOne({
        title: "SERVICES",
        parentId: null
    });

    if (!servicesRoot) {
        const result = await db.collection('navigationitems').insertOne({
            title: "SERVICES",
            url: "/services/",
            type: "internal",
            parentId: null,
            order: 3,
            openInNewTab: false,
            isActive: true,
            displayDesktop: true,
            displayMobile: true,
            isDropdown: true,
            badge: "5 Categories",
            description: "Cinematic, Corporate & Aerial Media Services",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        servicesRoot = { _id: result.insertedId };
        console.log("+ Created root SERVICES menu item.");
    } else {
        await db.collection('navigationitems').updateOne(
            { _id: servicesRoot._id },
            {
                $set: {
                    isDropdown: true,
                    isActive: true,
                    displayDesktop: true,
                    displayMobile: true,
                    badge: "5 Categories",
                    order: 3
                }
            }
        );
        console.log("✓ Updated root SERVICES menu item:", servicesRoot._id);
    }

    console.log("\n=== 4. UPDATING CHILDREN OF SERVICES TO THE 5-CATEGORY STRUCTURE ===");
    // Delete existing direct children of SERVICES so we can re-populate clean structure
    const deleteRes = await db.collection('navigationitems').deleteMany({
        parentId: servicesRoot._id
    });
    console.log(`Removed ${deleteRes.deletedCount} old children under SERVICES.`);

    const newChildrenDocs = SERVICES_HIERARCHY.map(item => ({
        title: item.title,
        url: item.url,
        type: "internal",
        parentId: servicesRoot._id,
        order: item.order,
        group: item.group,
        subGroup: item.subGroup || "",
        badge: item.badge,
        description: item.description,
        icon: item.icon || "",
        openInNewTab: false,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        isDropdown: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await db.collection('navigationitems').insertMany(newChildrenDocs);
    console.log(`Inserted ${newChildrenDocs.length} services children across 5 categories.`);

    console.log("\n=== 5. VERIFYING FINAL NAVIGATION ITEMS IN DB ===");
    const finalItems = await db.collection('navigationitems').find({ parentId: servicesRoot._id }).sort({ order: 1 }).toArray();
    console.log(`Services children count: ${finalItems.length}`);
    const groups = {};
    finalItems.forEach(i => {
        if (!groups[i.group]) groups[i.group] = [];
        groups[i.group].push(`${i.order}. ${i.title} (${i.url})`);
    });

    for (const [grp, items] of Object.entries(groups)) {
        console.log(`\nCategory [${grp}] (${items.length} items):`);
        items.forEach(it => console.log(`   - ${it}`));
    }

    await mongoose.disconnect();
    console.log("\nMigration completed successfully!");
}

run().catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
});
