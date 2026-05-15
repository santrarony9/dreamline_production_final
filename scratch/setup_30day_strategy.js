const mongoose = require('mongoose');

const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

const JournalSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    date: String,
    category: String,
    image: String,
    excerpt: String,
    content: String,
    order: { type: Number, default: 0 },
    seo: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        keywords: { type: String, default: "" }
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);

const topics = [
    {
        title: "The Magic of Cinematic Wedding Films in Kolkata",
        category: "WEDDING",
        excerpt: "Why traditional video is evolving into cinema. How we capture the soul of Kolkata weddings.",
        content: "<h2>Cinematic Excellence</h2><p>In the heart of Kolkata, weddings are more than just events; they are grand narratives. At Dreamline Production, we move beyond traditional documentation to create cinematic masterpieces. We use slow-motion, gimbal stabilization, and expert color grading to make your wedding feel like a high-budget film.</p><p>From the early morning Bor Jatri to the emotional Bidayi, every frame is crafted with care.</p>"
    },
    {
        title: "Top 5 Pre-Wedding Shoot Locations in West Bengal",
        category: "INSIGHT",
        excerpt: "Discover hidden gems for your pre-wedding shoot, from Prinsep Ghat to the hills of North Bengal.",
        content: "<h2>Visual Storytelling</h2><p>Planning your pre-wedding? Kolkata offers a blend of heritage and modern aesthetics. We recommend Prinsep Ghat for classic vibes, the Maidan for natural beauty, or the architectural marvels of North Kolkata for a vintage touch. Our team specializes in finding the perfect angle at these iconic spots.</p>"
    },
    {
        title: "The Role of Drone Photography in Modern Events",
        category: "TECHNICAL",
        excerpt: "How aerial perspectives are changing the way we view wedding and corporate films.",
        content: "<h2>A View from Above</h2><p>Drone technology has revolutionized visual storytelling. Whether it's a grand outdoor wedding at a resort or a corporate campus showcase, aerial shots provide a scale that was previously impossible. At Dreamline, our licensed drone pilots ensure safe and breathtaking 4K footage for every project.</p>"
    },
    {
        title: "How to Choose the Right Wedding Photographer",
        category: "INSIGHT",
        excerpt: "Consistency, style, and personality. What to look for when booking your visual team.",
        content: "<h2>The Perfect Match</h2><p>Your photographer is the one person who will be with you throughout your entire wedding day. It’s not just about the portfolio; it’s about the comfort level. Look for a team that understands your vision and can work seamlessly under pressure.</p>"
    },
    {
        title: "Behind the Scenes: A Day at Tilottama Plaza Studio",
        category: "BEHIND THE SCENES",
        excerpt: "Step inside the Dreamline Production office where the magic happens.",
        content: "<h2>Where Magic Happens</h2><p>Located at 85 Tilottama Plaza, our studio is the hub of creativity. This is where we edit hundreds of hours of footage, color grade cinematic shots, and meet our wonderful clients. Come visit us to discuss your next big project!</p>"
    },
    {
        title: "Capturing the Essence of Traditional Bengali Rituals",
        category: "WEDDING",
        excerpt: "From Gaye Holud to Sindoor Daan—documenting the soul of tradition.",
        content: "<h2>Deeply Rooted</h2><p>Bengali weddings are rich with vibrant colors and deep emotions. Our 'candid' approach ensures that we don't just take pictures of the rituals; we capture the feelings behind them. The laughter during Gaye Holud and the tears during Subho Drishti—these are the moments that matter.</p>"
    },
    {
        title: "Why High-Quality Audio is Crucial for Your Film",
        category: "TECHNICAL",
        excerpt: "Visuals are only half the story. Learn why clear audio changes everything.",
        content: "<h2>Crystal Clear</h2><p>Most people forget about sound, but a cinematic film isn't complete without the laughter, the vows, and the music. We use professional wireless lavalier mics to ensure your voices are heard clearly over the background noise of the ceremony.</p>"
    },
    {
        title: "Commercial Film Solutions for Kolkata Businesses",
        category: "TECHNICAL",
        excerpt: "Boost your brand presence with professional corporate videos and product shoots.",
        content: "<h2>Business Growth</h2><p>In 2026, video content is the most powerful tool for any business. From corporate interviews to dynamic product showcases, we help Kolkata brands stand out in the digital marketplace. Professional lighting and crisp editing make all the difference.</p>"
    },
    {
        title: "Maternity Photography: Celebrating New Beginnings",
        category: "INSIGHT",
        excerpt: "A gentle and artistic approach to capturing the beauty of motherhood.",
        content: "<h2>Beautiful Journeys</h2><p>Maternity shoots are about celebrating a new chapter. We focus on soft lighting, comfortable settings, and artistic compositions to create timeless portraits that you will cherish forever.</p>"
    },
    {
        title: "The Art of Candid Photography: Why it Matters",
        category: "WEDDING",
        excerpt: "The best photos are the ones you didn't know were being taken.",
        content: "<h2>Unposed Perfection</h2><p>Candid photography is about capturing raw, unscripted emotions. No forced smiles, no awkward poses. Just you and your loved ones being yourselves. That's where the real beauty lies.</p>"
    }
];

// Replicate and vary topics for 30 days
const fullTopics = [];
for (let i = 0; i < 30; i++) {
    const base = topics[i % topics.length];
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    
    fullTopics.push({
        ...base,
        title: i >= topics.length ? `${base.title} (Series ${Math.floor(i/topics.length) + 1})` : base.title,
        date: date.toISOString().split('T')[0],
        id: `journal-${Date.now()}-${i}`
    });
}

async function setupStrategy() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        // Clear existing scheduled posts if any to avoid duplicates during setup
        // await Journal.deleteMany({ date: { $gt: new Date().toISOString().split('T')[0] } });

        for (const postData of fullTopics) {
            await Journal.findOneAndUpdate(
                { title: postData.title, date: postData.date },
                postData,
                { upsert: true, new: true }
            );
            console.log(`Scheduled: ${postData.title} for ${postData.date}`);
        }

        console.log("30-Day Strategy Setup Complete!");
        process.exit(0);
    } catch (err) {
        console.error("Setup Failed:", err);
        process.exit(1);
    }
}

setupStrategy();
