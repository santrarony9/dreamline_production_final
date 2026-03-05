
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

// Schemas (Minimal for migration)
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

const Wedding = mongoose.models.Wedding || mongoose.model('Wedding', WeddingSchema);
const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);

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
            { author: "Priya & Rahul", text: "Dreamline made us feel like royalty. The Zamindar theme was captured perfectly!", rating: 5 },
            { author: "Anjali S.", text: "The attention to detail in the rituals was breathtaking.", rating: 5 }
        ],
        storyChapters: [
            { title: "Chapter 1: The Expectation", images: Array(4).fill('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600') },
            { title: "Chapter 2: The Rituals", images: Array(4).fill('https://images.unsplash.com/photo-1623192070105-89689871e44f?auto=format&fit=crop&w=600') },
            { title: "Chapter 3: The Celebration", images: Array(4).fill('https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600') }
        ],
        vendors: [
            { category: "Venue", name: "Itc Royal Bengal" },
            { category: "Makeup", name: "Aniruddha Chakladar" },
            { category: "Decor", name: "Ferns & Petals" },
            { category: "Outfit", name: "Sabyasachi Mukherjee" }
        ]
    },
    {
        id: 'benarasi-dreams',
        title: 'Benarasi Dreams',
        subtitle: 'Heritage Selection',
        description: 'The vibrant colors of Varanasi woven into a love story. A visual symphony of red and gold.',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920',
        hoverVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/dog.mp4',
        videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        albumUrl: 'https://www.canvera.com/e-photobook',
        reviews: [
            { author: "Sneha & Amit", text: "Our Benarasi wedding looked like a movie scene. Thank you Rony!", rating: 5 }
        ],
        storyChapters: [
            { title: "Chapter 1: Golden Hour", images: Array(6).fill('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600') },
            { title: "Chapter 2: The Vows", images: Array(6).fill('https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600') }
        ],
        vendors: [
            { category: "Venue", name: "Raajkutir Swabhumi" },
            { category: "Makeup", name: "Abhijit Chanda" }
        ]
    },
    {
        id: 'sabyasachi-aesthetic',
        title: 'Sabyasachi Aesthetic',
        subtitle: 'Heritage Selection',
        description: 'Inspired by the master couturier, this wedding was a masterclass in elegance and subtle luxury.',
        coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920',
        hoverVideo: 'https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/dog.mp4',
        videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        albumUrl: 'https://www.canvera.com/e-photobook',
        reviews: [
            { author: "Meera & Arjun", text: "Elegant, timeless, and classic. Exactly what we wanted.", rating: 5 }
        ],
        storyChapters: [
            { title: "Chapter 1: The First Look", images: Array(4).fill('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600') },
            { title: "Chapter 2: The Ceremony", images: Array(8).fill('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600') }
        ],
        vendors: [
            { category: "Venue", name: "Taj Bengal" },
            { category: "Photography", name: "Dreamline Production" }
        ]
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
        content: `
            <p>North Kolkata is a treasure trove of heritage and culture, offering some of the most stunning backdrops for wedding photography. In this guide, we explore the top venues that blend tradition with luxury.</p>
            <h3>1. The Heritage Rajbaris</h3>
            <p>Nothing screams royalty like a wedding in a restored Rajbari. The intricate architecture, sprawling courtyards, and vintage charm provide a cinematic setting that is hard to replicate.</p>
            <h3>2. Modern Luxury Banquets</h3>
            <p>For those who prefer a contemporary touch, several new luxury banquet halls have opened up along VIP Road and New Town, offering world-class amenities and lighting systems perfect for high-definition video coverage.</p>
            <p>At Dreamline Production, we have extensive experience shooting in all these locations, ensuring your memories are captured in the best light possible.</p>
        `
    },
    {
        id: "journal-2",
        title: "Why Professional Video Content is Mandatory for Kolkata Brands",
        date: "Feb 12, 2024",
        category: "Commercial",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800",
        excerpt: "The digital landscape of Bengal is changing. Here is how video production scales ROI.",
        content: `
            <p>In the age of Instagram Reels and YouTube Shorts, static images are no longer enough to capture audience attention. Brands in Kolkata are rapidly shifting towards video-first marketing strategies.</p>
            <h3>Engagement is Key</h3>
            <p>Video content generates 1200% more shares than text and images combined. For local brands, this means a massive opportunity to reach new customers through organic sharing.</p>
            <h3>Storytelling Builds Trust</h3>
            <p>A well-produced commercial doesn't just sell a product; it tells a story. Whether it's a heritage jewelry brand or a modern tech startup, your narrative is what connects you with your audience.</p>
        `
    },
    {
        id: "journal-3",
        title: "Mastering Low Light Photography: Tilottama Plaza Studio Secrets",
        date: "Jan 05, 2024",
        category: "Technical",
        image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&w=800",
        excerpt: "A technical breakdown of our signature lighting style that defines Dreamline Production.",
        content: `
            <p>Low light photography is often the most challenging yet rewarding aspect of cinematic visuals. At our studio in Tilottama Plaza, we experiment with various techniques to master this art.</p>
            <h3>The Equipment</h3>
            <p>We rely on prime lenses with wide apertures (f/1.2 or f/1.4) to let in maximum light without compromising on shutter speed. This allows us to capture sharp images even in dimly lit reception halls.</p>
            <h3>Creative Lighting</h3>
            <p>It's not just about the camera; it's about how you shape the light. We use RGB stick lights and softboxes to create separation and depth, giving our subjects a three-dimensional pop against dark backgrounds.</p>
        `
    }
];

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for migration");

        // Migrate Weddings
        for (const w of legacyWeddings) {
            await Wedding.findOneAndUpdate({ id: w.id }, w, { upsert: true, new: true });
            console.log(`Migrated Wedding: ${w.title}`);
        }

        // Migrate Journals
        for (const j of legacyJournals) {
            await Journal.findOneAndUpdate({ id: j.id }, j, { upsert: true, new: true });
            console.log(`Migrated Journal: ${j.title}`);
        }

        console.log("Migration completed successfully!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
