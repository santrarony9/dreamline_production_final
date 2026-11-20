import ProductImage from '../models/ProductImage.js';
import ProductCategory from '../models/ProductCategory.js';

export const INITIAL_PRODUCT_CATEGORIES = [
    { name: "Electronics", slug: "electronics", order: 1 },
    { name: "Fashion & Apparel", slug: "fashion-apparel", order: 2 },
    { name: "Jewellery", slug: "jewellery", order: 3 },
    { name: "Cosmetics & Beauty", slug: "cosmetics-beauty", order: 4 },
    { name: "Watches & Accessories", slug: "watches-accessories", order: 5 },
    { name: "Home & Lifestyle", slug: "home-lifestyle", order: 6 },
    { name: "Food & Beverages", slug: "food-beverages", order: 7 },
    { name: "Packaging & Commercial Products", slug: "packaging-commercial-products", order: 8 },
    { name: "Other Products", slug: "other-products", order: 9 }
];

export const INITIAL_PRODUCT_IMAGES = [
    // ── 1. ELECTRONICS ──
    {
        title: "Audio Studio Professional Headphones",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=85&w=1200",
        altText: "High-end studio monitoring headphones product photography on dark background",
        isFeatured: true,
        order: 1,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Mirrorless Cinema Camera Body & Lens",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=85&w=1200",
        altText: "Precision mirrorless camera macro dial product photography",
        isFeatured: true,
        order: 2,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Minimalist Smart Wearable Tech",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=85&w=1200",
        altText: "Modern smartwatch clean product photography with white studio background",
        isFeatured: false,
        order: 3,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Custom Mechanical Keyboard & Brass Accent",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=85&w=1200",
        altText: "Designer mechanical keyboard keycaps commercial product shoot",
        isFeatured: false,
        order: 4,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 2. FASHION & APPAREL ──
    {
        title: "Handcrafted Luxury Leather Oxford Shoes",
        category: "Fashion & Apparel",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=85&w=1200",
        altText: "Artisanal leather shoes commercial photography with studio rim lighting",
        isFeatured: true,
        order: 5,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Minimalist E-Commerce Designer Sneakers",
        category: "Fashion & Apparel",
        imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=85&w=1200",
        altText: "Contemporary luxury designer sneaker product catalog shoot",
        isFeatured: false,
        order: 6,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Premium Textured Cotton Apparel Flatlay",
        category: "Fashion & Apparel",
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=85&w=1200",
        altText: "Premium casual apparel studio e-commerce lookbook flatlay",
        isFeatured: false,
        order: 7,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Pure Silk Designer Scarf Draped Detail",
        category: "Fashion & Apparel",
        imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=85&w=1200",
        altText: "High-fashion printed silk scarf detailed studio shoot",
        isFeatured: false,
        order: 8,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 3. JEWELLERY ──
    {
        title: "Solitaire Brilliant Cut Diamond Ring",
        category: "Jewellery",
        imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=1200",
        altText: "18k gold solitaire diamond ring macro jewelry photography with specular highlights",
        isFeatured: true,
        order: 9,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Royal Kundan & Polki Choker Necklace",
        category: "Jewellery",
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=85&w=1200",
        altText: "Traditional Indian gold bridal jewellery necklace set luxury detail",
        isFeatured: true,
        order: 10,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Natural Freshwater Pearl Drop Earrings",
        category: "Jewellery",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=85&w=1200",
        altText: "Fine pearl and white gold earrings studio product shoot",
        isFeatured: false,
        order: 11,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Diamond Tennis Bracelet On Velvet",
        category: "Jewellery",
        imageUrl: "https://images.unsplash.com/photo-1611591475152-477943896570?auto=format&fit=crop&q=85&w=1200",
        altText: "Luxury diamond tennis bracelet studio product shot",
        isFeatured: false,
        order: 12,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 4. COSMETICS & BEAUTY ──
    {
        title: "Botanical Glass Serum Dropper Bottle",
        category: "Cosmetics & Beauty",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=85&w=1200",
        altText: "Organic amber skincare serum bottle with minimalist studio lighting",
        isFeatured: true,
        order: 13,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Haute Parfumerie Noir Fragrance Flacon",
        category: "Cosmetics & Beauty",
        imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=85&w=1200",
        altText: "Luxury black perfume bottle commercial product shoot with gold atomiser",
        isFeatured: true,
        order: 14,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Satin Finish Luxury Lipstick Bullet",
        category: "Cosmetics & Beauty",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=85&w=1200",
        altText: "Crimson satin lipstick in gold metallic packaging product photo",
        isFeatured: false,
        order: 15,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Organic Facial Cream & Essential Oils",
        category: "Cosmetics & Beauty",
        imageUrl: "https://images.unsplash.com/photo-1608248597359-52e4f0ef3d20?auto=format&fit=crop&q=85&w=1200",
        altText: "Natural skincare moisturizer jar with clean aesthetic product styling",
        isFeatured: false,
        order: 16,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 5. WATCHES & ACCESSORIES ──
    {
        title: "Swiss Automatic Chronograph Watch",
        category: "Watches & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=85&w=1200",
        altText: "Men's luxury chronograph timepiece macro studio catalog photo",
        isFeatured: true,
        order: 17,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Hand-Stitched Full Grain Leather Wallet",
        category: "Watches & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=85&w=1200",
        altText: "Artisanal brown leather bifold wallet product photography",
        isFeatured: false,
        order: 18,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Gold-Framed Polarized Aviator Sunglasses",
        category: "Watches & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=85&w=1200",
        altText: "Luxury gold frame designer sunglasses clean studio shoot",
        isFeatured: false,
        order: 19,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Minimalist Brushed Brass Arm Cuff",
        category: "Watches & Accessories",
        imageUrl: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=85&w=1200",
        altText: "Contemporary minimalist metallic accessory commercial photo",
        isFeatured: false,
        order: 20,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 6. HOME & LIFESTYLE ──
    {
        title: "Handmade Ceramic Textured Artisan Vase",
        category: "Home & Lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=85&w=1200",
        altText: "Modern architectural ceramic pottery lifestyle product photography",
        isFeatured: true,
        order: 21,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Nordic Brass & Frosted Desk Luminaire",
        category: "Home & Lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=85&w=1200",
        altText: "Designer interior lighting brass lamp product catalog shot",
        isFeatured: false,
        order: 22,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Matte Black Precision Pour-Over Kettle",
        category: "Home & Lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=85&w=1200",
        altText: "Barista specialty coffee kettle studio commercial photography",
        isFeatured: false,
        order: 23,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Luxury Soy Wax Candle in Dark Amber Tumbler",
        category: "Home & Lifestyle",
        imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=85&w=1200",
        altText: "Aromatherapy scented candle product photography with warm golden glow",
        isFeatured: false,
        order: 24,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 7. FOOD & BEVERAGES ──
    {
        title: "Single-Origin Specialty Roasted Coffee Beans",
        category: "Food & Beverages",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=85&w=1200",
        altText: "Gourmet coffee beans packaging and texture commercial shot",
        isFeatured: true,
        order: 25,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Cold-Pressed Extra Virgin Olive Oil Bottle",
        category: "Food & Beverages",
        imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=85&w=1200",
        altText: "Artisanal Mediterranean olive oil glass bottle product photo",
        isFeatured: false,
        order: 26,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Handcrafted Dark Chocolate with Gold Foil",
        category: "Food & Beverages",
        imageUrl: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&q=85&w=1200",
        altText: "Artisan gourmet dark chocolate bar commercial food styling",
        isFeatured: false,
        order: 27,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Craft Botanical Beverage Condensation Capture",
        category: "Food & Beverages",
        imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=85&w=1200",
        altText: "Chilled luxury beverage bottle with water droplets commercial shoot",
        isFeatured: false,
        order: 28,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 8. PACKAGING & COMMERCIAL PRODUCTS ──
    {
        title: "Matte Black Rigid Gift Box with Gold Foil",
        category: "Packaging & Commercial Products",
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=85&w=1200",
        altText: "Luxury bespoke packaging gift box with embossed metallic logo",
        isFeatured: true,
        order: 29,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Minimalist Eco-Kraft Zipper Pouch",
        category: "Packaging & Commercial Products",
        imageUrl: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&q=85&w=1200",
        altText: "Sustainable retail paper pouch packaging product shoot",
        isFeatured: false,
        order: 30,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Cosmetic Aluminum Pump Dispenser Bottle",
        category: "Packaging & Commercial Products",
        imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=85&w=1200",
        altText: "Industrial beauty cosmetic container packaging catalog photo",
        isFeatured: false,
        order: 31,
        aspectRatio: "1:1",
        isPublished: true
    },

    // ── 9. OTHER PRODUCTS ──
    {
        title: "Handcrafted 14K Gold Nib Fountain Pen",
        category: "Other Products",
        imageUrl: "https://images.unsplash.com/photo-1585336261026-77cc7c3383ae?auto=format&fit=crop&q=85&w=1200",
        altText: "Vintage luxury brass fountain pen macro nib product photography",
        isFeatured: true,
        order: 32,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "Full-Grain Leatherbound Journal",
        category: "Other Products",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=85&w=1200",
        altText: "Hand-bound leather sketchbook stationery product photo",
        isFeatured: false,
        order: 33,
        aspectRatio: "1:1",
        isPublished: true
    },
    {
        title: "CNC Machined Titanium EDC Precision Tool",
        category: "Other Products",
        imageUrl: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&q=85&w=1200",
        altText: "High-precision titanium everyday carry product macro photography",
        isFeatured: false,
        order: 34,
        aspectRatio: "1:1",
        isPublished: true
    }
];

export async function ensureProductGallerySeeded() {
    try {
        // Seed categories if empty
        const catCount = await ProductCategory.countDocuments();
        if (catCount === 0) {
            console.log("[Product Gallery] Seeding 9 default categories...");
            await ProductCategory.insertMany(INITIAL_PRODUCT_CATEGORIES);
        }

        // Seed images if empty
        const imgCount = await ProductImage.countDocuments();
        if (imgCount === 0) {
            console.log("[Product Gallery] Seeding initial curated product showcase images...");
            await ProductImage.insertMany(INITIAL_PRODUCT_IMAGES);
        }
    } catch (err) {
        console.error("[Product Gallery] Error during seed check:", err);
    }
}
