import fs from 'fs';
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);
if (!match) process.exit(1);
const uri = match[1].trim();

const WEDDING_IMAGES = [
    "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861480620-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861489175-WhatsApp_Image_2026-.jpeg",
    "https://backend.dreamlineproduction.com/uploads/1790861508628-WhatsApp_Image_2026-.jpeg",
    "/thumbnails/seo_ashirbad.jpg",
    "/thumbnails/seo_bou_bhat.jpg",
    "/thumbnails/seo_bridal_makeup.jpg",
    "/thumbnails/seo_saat_paak.jpg",
    "/thumbnails/seo_sindoor_daan.jpg",
    "/thumbnails/seo_thumb_drishti.jpg",
    "/thumbnails/seo_thumb_holud.jpg"
];

const JOURNAL_MAP = {
    "the-magic-of-cinematic-wedding-films-in-kolkata": "/thumbnails/prinsep-ghat.jpg",
    "top-5-pre-wedding-shoot-locations-in-west-bengal": "/thumbnails/banquets-kolkata.jpg",
    "the-role-of-drone-photography-in-modern-events": "/thumbnails/seo_thumb_lighting.jpg",
    "how-to-choose-the-right-wedding-photographer": "/thumbnails/seo_thumb_checklist.jpg",
    "behind-the-scenes-a-day-at-tilottama-plaza-studio": "/thumbnails/seo_thumb_1.jpg",
    "capturing-the-essence-of-traditional-bengali-rituals": "/thumbnails/seo_saat_paak.jpg",
    "why-high-quality-audio-is-crucial-for-your-film": "/thumbnails/seo_thumb_2.jpg",
    "commercial-film-solutions-for-kolkata-businesses": "/thumbnails/seo_thumb_3.jpg",
    "maternity-photography-celebrating-new-beginnings": "/thumbnails/seo_thumb_4.jpg",
    "the-art-of-candid-photography-why-it-matters": "/thumbnails/seo_thumb_bw.jpg"
};

async function migrate() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    console.log("Migrating contents...");
    const content = await db.collection('contents').findOne();
    if (content) {
        const update = {};
        if (content.home?.quote?.backgroundImage?.includes('amazonaws.com')) {
            update['home.quote.backgroundImage'] = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85";
        }
        if (content.gallery?.images) {
            update['gallery.images'] = WEDDING_IMAGES.slice(0, 6);
        }
        if (Object.keys(update).length > 0) {
            await db.collection('contents').updateOne({ _id: content._id }, { $set: update });
            console.log("Contents updated:", Object.keys(update));
        }
    }

    console.log("Migrating weddings...");
    // 1. Sid & Trina
    await db.collection('weddings').updateOne(
        { id: "wedding-1771743825332" },
        {
            $set: {
                coverImage: "https://backend.dreamlineproduction.com/uploads/1790781150431-DSC00187__-_2.png",
                img: "https://backend.dreamlineproduction.com/uploads/1790781150431-DSC00187__-_2.png",
                images: WEDDING_IMAGES.slice(0, 7)
            }
        }
    );

    // 2. Diandra & Surjo
    await db.collection('weddings').updateOne(
        { id: "zamindar-soul" },
        {
            $set: {
                coverImage: "https://backend.dreamlineproduction.com/uploads/1793328917793-Timeless_Bengali_Bri.png",
                img: "https://backend.dreamlineproduction.com/uploads/1793328917793-Timeless_Bengali_Bri.png",
                images: WEDDING_IMAGES.slice(3, 10)
            }
        }
    );

    // 3. Rajlaxmi & Mohit
    await db.collection('weddings').updateOne(
        { id: "wedding-1778663588915" },
        {
            $set: {
                coverImage: "https://backend.dreamlineproduction.com/uploads/1793328672306-TAN09571.JPG",
                img: "https://backend.dreamlineproduction.com/uploads/1793328672306-TAN09571.JPG",
                images: WEDDING_IMAGES.slice(6, 13)
            }
        }
    );
    console.log("Weddings updated!");

    console.log("Migrating journals...");
    for (const [id, image] of Object.entries(JOURNAL_MAP)) {
        await db.collection('journals').updateOne(
            { id },
            { $set: { image } }
        );
    }
    // Also catch any other journal with S3
    const brokenJournals = await db.collection('journals').find({ image: /amazonaws\.com/ }).toArray();
    for (const bj of brokenJournals) {
        await db.collection('journals').updateOne(
            { _id: bj._id },
            { $set: { image: "/thumbnails/seo_thumb_5.jpg" } }
        );
    }
    console.log("Journals updated!");

    await mongoose.disconnect();
    console.log("Migration complete!");
}

migrate().catch(console.error);
