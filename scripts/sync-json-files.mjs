import fs from 'fs';

// 1. weddings.json
const weddings = JSON.parse(fs.readFileSync('weddings.json', 'utf-8'));
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

for (const w of weddings) {
    if (w.id === 'wedding-1771743825332') {
        w.coverImage = "https://backend.dreamlineproduction.com/uploads/1790781150431-DSC00187__-_2.png";
        w.img = w.coverImage;
        w.images = WEDDING_IMAGES.slice(0, 7);
    } else if (w.id === 'zamindar-soul') {
        w.coverImage = "https://backend.dreamlineproduction.com/uploads/1793328917793-Timeless_Bengali_Bri.png";
        w.img = w.coverImage;
        w.images = WEDDING_IMAGES.slice(3, 10);
    } else if (w.id === 'wedding-1778663588915') {
        w.coverImage = "https://backend.dreamlineproduction.com/uploads/1793328672306-TAN09571.JPG";
        w.img = w.coverImage;
        w.images = WEDDING_IMAGES.slice(6, 13);
    }
}
fs.writeFileSync('weddings.json', JSON.stringify(weddings, null, 2), 'utf-8');
console.log('weddings.json updated');

// 2. content.json
const content = JSON.parse(fs.readFileSync('content.json', 'utf-8'));
if (content.home?.quote) {
    content.home.quote.backgroundImage = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85";
}
if (content.gallery) {
    content.gallery.images = WEDDING_IMAGES.slice(0, 6);
}
let contentStr = JSON.stringify(content, null, 2);
contentStr = contentStr.replace(/https:\/\/dreamlinepro\.s3\.ap-south-2\.amazonaws\.com\/[^\s"']+/g, (match) => {
    return WEDDING_IMAGES[Math.floor(Math.random() * WEDDING_IMAGES.length)];
});
fs.writeFileSync('content.json', contentStr, 'utf-8');
console.log('content.json updated');
