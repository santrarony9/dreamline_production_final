import fs from 'fs';
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);
if (!match) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
}
const uri = match[1].trim();

// 1. RECONCILED WEDDINGS DATA - Zero mixing, 100% authentic
const RECONCILED_WEDDINGS = [
    {
        id: "wedding-1771743825332",
        title: "SID & TRINA",
        subtitle: "Luxury Bengali Wedding",
        description: "A grand celebration of love, heritage, and timeless Bengali wedding rituals documented with cinematic vision in Kolkata.",
        coverImage: "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
        img: "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
        hoverVideo: "",
        videoUrl: "https://youtu.be/6S7ZKGVoEGs",
        albumUrl: "",
        location: "KOLKATA",
        altText: "Sid & Trina Luxury Bengali Wedding Film Kolkata by Dreamline Production",
        review: "Dreamline Production captured our most sacred vows and emotional moments with breathtaking cinematic beauty. Truly unforgettable!",
        clientNames: "Sid & Trina",
        images: [
            "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg"
        ],
        imageAltTexts: [
            "Sid & Trina Exchange of Garlands Ceremony in Kolkata"
        ],
        reviews: [
            {
                author: "Sid & Trina",
                text: "Dreamline Production captured our most sacred vows and emotional moments with breathtaking cinematic beauty. Truly unforgettable!",
                rating: 5
            }
        ],
        storyChapters: [],
        vendors: [
            { category: "Photography & Cinematography", name: "Dreamline Production" },
            { category: "Location", name: "Kolkata" }
        ],
        order: 1
    },
    {
        id: "zamindar-soul",
        title: "DIANDRA & SURJO",
        subtitle: "Heritage Selection",
        description: "A royal heritage celebration captured in the heart of Bengal, blending tradition with cinematic grandeur.",
        coverImage: "/thumbnails/seo_thumb_holud.jpg",
        img: "/thumbnails/seo_thumb_holud.jpg",
        hoverVideo: "",
        videoUrl: "",
        albumUrl: "https://www.canvera.com/e-photobook",
        location: "ITC ROYAL BENGAL, KOLKATA",
        altText: "Diandra & Surjo Royal Heritage Bengali Wedding Kolkata by Dreamline Production",
        review: "Dreamline made us feel like royalty. The heritage theme was captured with regal elegance!",
        clientNames: "Diandra & Surjo",
        images: [
            "/thumbnails/seo_thumb_holud.jpg",
            "/thumbnails/seo_thumb_drishti.jpg",
            "/thumbnails/seo_thumb_1.jpg",
            "/thumbnails/seo_thumb_2.jpg",
            "/thumbnails/seo_thumb_11.jpg"
        ],
        imageAltTexts: [
            "Diandra & Surjo Royal Heritage Wedding Mandap at Sunset with Howrah Bridge Kolkata",
            "Diandra & Surjo Intimate Heritage Wedding Couple Embrace Kolkata",
            "Diandra & Surjo Grand Floral Palace Mandap Ceremony Kolkata",
            "Diandra & Surjo Cinematic Wedding Aisle Entry Filmed by Dreamline Production",
            "Diandra & Surjo Royal Heritage Palace Estate at Twilight"
        ],
        reviews: [
            {
                author: "Diandra & Surjo",
                text: "Dreamline made us feel like royalty. The heritage theme was captured with regal elegance!",
                rating: 5
            }
        ],
        storyChapters: [],
        vendors: [
            { category: "Venue", name: "ITC Royal Bengal, Kolkata" },
            { category: "Photography", name: "Dreamline Production" }
        ],
        order: 2
    },
    {
        id: "wedding-1778663588915",
        title: "RAJLAXMI & MOHIT",
        subtitle: "Traditional Bengali Wedding",
        description: "Traditional Bengali wedding rituals and emotional family moments captured with artistic framing and cinematic elegance in Kolkata.",
        coverImage: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        img: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        hoverVideo: "",
        videoUrl: "https://youtu.be/mM59Ah26olI",
        albumUrl: "",
        location: "KOLKATA",
        altText: "Rajlaxmi & Mohit Bengali Wedding Cinema Kolkata by Dreamline Production",
        review: "The Dreamline team made every ritual look like poetry on screen. We cherish our wedding film every single day.",
        clientNames: "Rajlaxmi & Mohit",
        images: [
            "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
            "/thumbnails/seo_sindoor_daan.jpg"
        ],
        imageAltTexts: [
            "Rajlaxmi Shubho Drishti Betel Leaf Ceremony Kolkata",
            "Rajlaxmi & Mohit Sacred Bengali Sindoor Daan Fire Ceremony Kolkata"
        ],
        reviews: [
            {
                author: "Rajlaxmi & Mohit",
                text: "The Dreamline team made every ritual look like poetry on screen. We cherish our wedding film every single day.",
                rating: 5
            }
        ],
        storyChapters: [],
        vendors: [
            { category: "Photography & Cinematography", name: "Dreamline Production" },
            { category: "Location", name: "Kolkata" }
        ],
        order: 3
    }
];

// 2. RECONCILED GALLERY ITEMS
const RECONCILED_GALLERY_ITEMS = [
    // --- WEDDINGS CATEGORY (Every wedding photograph accurately titled with couple name, project link, and authentic asset) ---
    {
        title: "Sid & Trina - Luxury Bengali Wedding Ceremony",
        caption: "Sacred vows and floral garland exchange from Sid & Trina's luxury wedding film in Kolkata",
        altText: "Sid and Trina luxury Bengali wedding ceremony portrait Kolkata",
        category: "weddings",
        imageUrl: "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 1,
        published: true,
        weddingId: "wedding-1771743825332",
        projectUrl: "/wedding/wedding-1771743825332"
    },
    {
        title: "Rajlaxmi & Mohit - Shubho Drishti Ceremony",
        caption: "Bride Rajlaxmi holding sacred betel leaves during traditional Shubho Drishti ritual in Kolkata",
        altText: "Rajlaxmi and Mohit Shubho Drishti traditional Bengali wedding ritual Kolkata",
        category: "weddings",
        imageUrl: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 2,
        published: true,
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    {
        title: "Diandra & Surjo - Heritage Mandap Sunset at Howrah",
        caption: "Royal heritage wedding celebration overlooking the iconic Howrah Bridge at golden hour sunset",
        altText: "Diandra and Surjo Howrah Bridge sunset wedding mandap Kolkata by Dreamline Production",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_holud.jpg",
        aspectRatio: "vertical",
        order: 3,
        published: true,
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        title: "Rajlaxmi & Mohit - Sacred Bengali Sindoor Daan",
        caption: "Sacred sindoor daan wedding ceremony before the holy Agni fire captured with warm ambient lighting",
        altText: "Rajlaxmi and Mohit traditional Bengali sindoor daan wedding ceremony in Kolkata",
        category: "weddings",
        imageUrl: "/thumbnails/seo_sindoor_daan.jpg",
        aspectRatio: "vertical",
        order: 4,
        published: true,
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    {
        title: "Diandra & Surjo - Royal Heritage Mandap Embrace",
        caption: "Intimate black-and-white couple portrait under luxury floral wedding mandap",
        altText: "Diandra and Surjo luxury wedding couple portrait under mandap Kolkata",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_drishti.jpg",
        aspectRatio: "vertical",
        order: 5,
        published: true,
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        title: "Diandra & Surjo - Palace Courtyard Mandap Celebration",
        caption: "Grand floral garland exchange under heritage palace courtyard mandap with festive illuminations",
        altText: "Diandra and Surjo grand floral palace mandap wedding ceremony Kolkata",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_1.jpg",
        aspectRatio: "vertical",
        order: 6,
        published: true,
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        title: "Diandra & Surjo - Cinematic Wedding Aisle Entry",
        caption: "Cinematographer tracking bride and groom aisle entrance with Ronin gimbal stabilizer",
        altText: "Diandra and Surjo cinematic wedding aisle entry filmed by Dreamline Production",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_2.jpg",
        aspectRatio: "vertical",
        order: 7,
        published: true,
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },
    {
        title: "Diandra & Surjo - Royal Palace Heritage Estate at Twilight",
        caption: "Architectural twilight view of illuminated heritage palace courtyard and wedding reflection pool",
        altText: "Diandra and Surjo luxury wedding estate venue Kolkata by Dreamline Production",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_11.jpg",
        aspectRatio: "horizontal",
        order: 8,
        published: true,
        weddingId: "zamindar-soul",
        projectUrl: "/wedding/zamindar-soul"
    },

    // --- PRE-WEDDING ---
    {
        title: "Cinematic Pre-Wedding Gimbal Shoot",
        caption: "On-location Ronin gimbal camera tracking shot during romantic outdoor couple pre-wedding film",
        altText: "Cinematic pre-wedding photoshoot with Ronin gimbal by Dreamline Production Kolkata",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 9,
        published: true
    },

    // --- RITUALS ---
    {
        title: "Rajlaxmi Shubho Drishti Ritual",
        caption: "Traditional Shubho Drishti ritual documentation in Kolkata",
        altText: "Traditional Shubho Drishti ritual wedding photography Kolkata",
        category: "rituals",
        imageUrl: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 10,
        published: true,
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },
    {
        title: "Traditional Bengali Sindoor Daan Ritual",
        caption: "Sacred sindoor daan wedding ceremony before the holy Agni fire",
        altText: "Traditional Bengali sindoor daan ceremony Kolkata",
        category: "rituals",
        imageUrl: "/thumbnails/seo_sindoor_daan.jpg",
        aspectRatio: "vertical",
        order: 11,
        published: true,
        weddingId: "wedding-1778663588915",
        projectUrl: "/wedding/wedding-1778663588915"
    },

    // --- DRONE & AERIAL ---
    {
        title: "Prinsep Ghat Monument Aerial Sweep",
        caption: "DGCA-certified drone aerial perspective over Vidyasagar Setu and Prinsep Ghat riverside memorial",
        altText: "Aerial drone cinematography at Prinsep Ghat and Hooghly river Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/prinsep-ghat.jpg",
        aspectRatio: "horizontal",
        order: 12,
        published: true
    },
    {
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude certified drone view of luxury wedding banquet estate in Kolkata",
        altText: "Drone aerial photography of luxury wedding venue Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/banquets-kolkata.jpg",
        aspectRatio: "horizontal",
        order: 13,
        published: true
    },

    // --- COMMERCIAL & DOCUMENTARY FILMS ---
    {
        title: "L&T Mobile Air Classifier Documentary",
        caption: "High-precision industrial documentary film for L&T Construction & Mining Machinery",
        altText: "L&T industrial commercial film production by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 14,
        published: true
    },
    {
        title: "TATA Genrobotics Bandicoot Film",
        caption: "Social robotics innovation documentary film produced for TATA Trusts",
        altText: "TATA Trusts Bandicoot commercial film by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/zFWNx12dg3c/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 15,
        published: true
    },
    {
        title: "Chandra Udyog Plant Cinematography",
        caption: "Industrial plant machinery operations and manufacturing corporate brand video",
        altText: "Chandra Udyog industrial plant video production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/UqnXM7lm4qE/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 16,
        published: true
    },
    {
        title: "Atlas Foundries Precision Shoot",
        caption: "Heavy casting and engineering foundry manufacturing commercial documentary",
        altText: "Atlas Foundries commercial documentary film Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 17,
        published: true
    },
    {
        title: "L&T Breaking Barriers Corporate Film",
        caption: "Corporate brand cinema showcasing heavy machinery innovation and human stories",
        altText: "L&T Breaking Barriers corporate documentary Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/8NpSypsTCbs/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 18,
        published: true
    },
    {
        title: "KSW Eco Saras Corporate Video",
        caption: "Brand story and sustainability profile film for KSW Eco Saras",
        altText: "KSW Eco Saras corporate film production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/LynqHXnCqVg/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 19,
        published: true
    },
    {
        title: "CONNEQT Kolkata Corporate Showcase",
        caption: "Modern corporate workspace cinematography and employee stories for CONNEQT Kolkata",
        altText: "CONNEQT business office commercial film Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/F6dg5pDtC_U/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 20,
        published: true
    },
    {
        title: "Brut India News Documentary",
        caption: "In-depth documentary film covering human resilience and inspiring sports narratives",
        altText: "Brut India news documentary video production by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/naGtj-8iHuM/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 21,
        published: true
    },
    {
        title: "TRT World International Feature",
        caption: "International news investigative feature documented on-location in Kolkata",
        altText: "TRT World news feature cinematography Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/YCZNkMz9CS4/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 22,
        published: true
    },
    {
        title: "Live Broadcast Multi-Cam Control Room",
        caption: "Dreamline Production multi-camera live video mixing console and field broadcast desk",
        altText: "Live multi-camera broadcast control setup by Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 23,
        published: true
    },
    {
        title: "ATEM Mini Pro Multi-Camera Switcher",
        caption: "Live production switching rig and preview monitor during grand ceremony broadcast",
        altText: "ATEM Mini Pro switcher multi-cam setup Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 24,
        published: true
    },
    {
        title: "Sony Alpha 4K Multi-Track Podcast Recording",
        caption: "On-camera monitor feed during professional studio podcast interview recording",
        altText: "Studio podcast recording on Sony camera Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 25,
        published: true
    },
    {
        title: "Think Big Studio Talk Show Production",
        caption: "Full studio wide shot during multi-guest corporate interview and podcast production",
        altText: "Studio talk show video production Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 26,
        published: true
    },
    {
        title: "Outdoor Documentary Dialogue Filming",
        caption: "Cinematographer filming natural garden documentary interview with directional audio",
        altText: "Documentary interview video production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861489175-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 27,
        published: true
    },
    {
        title: "Executive Acoustic Studio Interview",
        caption: "Interior corporate interview capture with dedicated lavalier mics and ambient styling",
        altText: "Executive interview shoot by Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861508628-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 28,
        published: true
    },
    {
        title: "Live News & Documentary Field Filming",
        caption: "Gimbal-stabilized dynamic street documentary recording amidst high-energy crowd rally",
        altText: "Field news documentary filming in Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861522772-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 29,
        published: true
    },
    {
        title: "High-Profile Broadcast Dialogue Production",
        caption: "Studio dialogue setup with broadcast microphones and reference field monitor",
        altText: "High profile broadcast interview recording Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861531176-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 30,
        published: true
    },
    {
        title: "Location Commercial Film Filming",
        caption: "Field documentary crew directing landscape commercial shoot with monitor and gimbal",
        altText: "Commercial location film production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861604584-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 31,
        published: true
    },
    {
        title: "On-Location Investigative Video Journalism",
        caption: "Field video journalist and gimbal camera operator documenting live investigation",
        altText: "Investigative documentary filming Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861615934-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 32,
        published: true
    }
];

async function run() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        // 1. Reconcile Weddings collection
        console.log("Updating weddings in MongoDB...");
        for (const w of RECONCILED_WEDDINGS) {
            await db.collection('weddings').updateOne(
                { id: w.id },
                {
                    $set: {
                        title: w.title,
                        subtitle: w.subtitle,
                        description: w.description,
                        coverImage: w.coverImage,
                        img: w.img,
                        videoUrl: w.videoUrl,
                        albumUrl: w.albumUrl,
                        location: w.location,
                        altText: w.altText,
                        review: w.review,
                        clientNames: w.clientNames,
                        images: w.images,
                        imageAltTexts: w.imageAltTexts,
                        reviews: w.reviews,
                        storyChapters: w.storyChapters,
                        vendors: w.vendors,
                        order: w.order
                    }
                },
                { upsert: true }
            );
            console.log(` -> Reconciled Wedding: ${w.title} (Featured Cover: ${w.coverImage}, Images: ${w.images.length})`);
        }

        // 2. Reconcile Content collection splitGallery
        console.log("Updating Content.splitGallery...");
        const splitGalleryUrls = RECONCILED_GALLERY_ITEMS.map(i => i.imageUrl);
        await db.collection('contents').updateOne(
            {},
            {
                $set: {
                    splitGallery: splitGalleryUrls,
                    "home.motionArchive.images": [
                        "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
                        "/thumbnails/seo_thumb_holud.jpg",
                        "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
                        "/thumbnails/seo_sindoor_daan.jpg",
                        "/thumbnails/prinsep-ghat.jpg",
                        "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg"
                    ]
                }
            }
        );
        console.log(" -> Reconciled Content splitGallery and motionArchive");

        // 3. Reconcile GalleryItems collection
        console.log("Updating GalleryItem collection...");
        await db.collection('galleryitems').deleteMany({});
        await db.collection('galleryitems').insertMany(RECONCILED_GALLERY_ITEMS);
        console.log(` -> Inserted ${RECONCILED_GALLERY_ITEMS.length} verified authentic GalleryItems`);

        // 4. Update local JSON files
        console.log("Synchronizing weddings.json and content.json files on disk...");
        const dbWeddings = await db.collection('weddings').find().toArray();
        fs.writeFileSync('weddings.json', JSON.stringify(dbWeddings, null, 2), 'utf-8');
        console.log(" -> Saved weddings.json");

        const dbContent = await db.collection('contents').findOne();
        fs.writeFileSync('content.json', JSON.stringify(dbContent, null, 2), 'utf-8');
        console.log(" -> Saved content.json");

        console.log("=================================================");
        console.log("SUCCESS: All wedding projects, galleries, and image associations 100% reconciled!");
        console.log("=================================================");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

run();
