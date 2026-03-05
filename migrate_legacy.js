
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

// Schemas
const WeddingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    coverImage: String,
    hoverVideo: String,
    videoUrl: String,
    albumUrl: String,
    reviews: [{ author: String, text: String, rating: Number }],
    storyChapters: [{ title: String, images: [String] }],
    vendors: [{ category: String, name: String, link: String }],
    order: { type: Number, default: 0 }
});

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    date: String,
    category: String,
    image: String,
    excerpt: String,
    content: String,
    order: { type: Number, default: 0 }
});

const ContentSchema = new mongoose.Schema({
    videoVault: [{ title: String, category: String, image: String, videoUrl: String }],
    splitGallery: [String]
}, { strict: false });

const Wedding = mongoose.models.Wedding || mongoose.model('Wedding', WeddingSchema);
const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

const legacyWeddings = [
    {
        id: 'zamindar-soul',
        title: 'The Zamindar Soul',
        subtitle: 'Heritage Selection',
        description: 'A royal heritage celebration captured in the heart of Bengal, blending tradition with cinematic grandeur.',
        coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920',
        hoverVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/dog.mp4',
        videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        albumUrl: 'https://www.canvera.com/e-photobook',
        reviews: [
            { author: "Priya & Rahul", text: "Dreamline made us feel like royalty. The Zamindar theme was captured perfectly!", rating: 5 }
        ],
        storyChapters: [
            { title: "Chapter 1", images: Array(4).fill('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600') }
        ],
        vendors: [{ category: "Venue", name: "Itc Royal Bengal" }]
    },
    {
        id: 'benarasi-dreams',
        title: 'Benarasi Dreams',
        subtitle: 'Heritage Selection',
        description: 'The vibrant colors of Varanasi woven into a love story.',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920',
        videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4'
    },
    {
        id: 'sabyasachi-aesthetic',
        title: 'Sabyasachi Aesthetic',
        subtitle: 'Heritage Selection',
        description: 'Inspired by the master couturier.',
        coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920',
        videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4'
    }
];

const legacyJournals = [
    {
        id: "journal-1",
        title: "Navigating the Best Wedding Venues in North Kolkata",
        date: "Mar 24, 2024",
        category: "Wedding Guide",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        excerpt: "From historical rajbaris to modern luxury halls, we break down the most photogenic spots.",
        content: "<p>North Kolkata is a treasure trove of heritage...</p>"
    },
    {
        id: "journal-2",
        title: "Why Professional Video Content is Mandatory for Kolkata Brands",
        date: "Feb 12, 2024",
        category: "Commercial",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800",
        excerpt: "The digital landscape of Bengal is changing.",
        content: "<p>In the age of Instagram Reels...</p>"
    }
];

const legacyVideoVault = [
    {
        title: "The Heritage Soul",
        category: "Wedding Cinema",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
    },
    {
        title: "Commercial Luxe",
        category: "Brand Film",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800",
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
    },
    {
        title: "Neon Pulse",
        category: "Music Video",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800",
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
    },
    {
        title: "Eternal Vows",
        category: "Wedding Film",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4"
    }
];

const legacySplitGallery = [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1514525253344-f814d074e015?auto=format&fit=crop&w=800"
];

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for migration");

        for (const w of legacyWeddings) {
            await Wedding.findOneAndUpdate({ id: w.id }, w, { upsert: true, new: true });
            console.log(`Migrated Wedding: ${w.title}`);
        }

        for (const j of legacyJournals) {
            await Journal.findOneAndUpdate({ id: j.id }, j, { upsert: true, new: true });
            console.log(`Migrated Journal: ${j.title}`);
        }

        await Content.findOneAndUpdate(
            {},
            {
                $set: {
                    videoVault: legacyVideoVault,
                    splitGallery: legacySplitGallery
                }
            },
            { upsert: true }
        );
        console.log("Migrated Video Vault and Master Gallery assets");

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
