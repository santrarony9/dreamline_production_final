export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to keep legacy Content.splitGallery synchronized with published items
async function syncContentSplitGallery() {
    try {
        const publishedItems = await GalleryItem.find({ published: true })
            .sort({ order: 1, createdAt: -1 })
            .select('imageUrl')
            .lean();
        const urls = publishedItems.map(item => item.imageUrl).filter(Boolean);
        if (urls.length > 0) {
            await Content.updateOne({}, { $set: { splitGallery: urls } });
        }
    } catch (err) {
        console.error("Failed to sync Content.splitGallery:", err);
    }
}

// Initial seed data from authentic Dreamline Production assets
const INITIAL_GALLERY_SEED = [
    {
        title: "Candid Bengali Bridal Portrait",
        caption: "Emotional candid bridal portrait during wedding preparations in Kolkata",
        altText: "Candid emotional Bengali bridal portrait by Dreamline Production Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 1
    },
    {
        title: "Royal Couple Evening Reception",
        caption: "Luxury couple portrait during grand evening wedding reception",
        altText: "Luxury couple portrait during grand evening wedding reception in Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 2
    },
    {
        title: "Sunset at Prinsep Ghat",
        caption: "Romantic pre-wedding couple photoshoot at the historic Prinsep Ghat Kolkata",
        altText: "Cinematic romantic pre-wedding photoshoot at Prinsep Ghat by Dreamline Production",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 3
    },
    {
        title: "Traditional Sindoor Daan Ritual",
        caption: "Traditional sindoor daan wedding ceremony captured with cinematic lighting",
        altText: "Traditional Bengali sindoor daan wedding ceremony in Kolkata",
        category: "rituals",
        imageUrl: "/thumbnails/seo_sindoor_daan.jpg",
        aspectRatio: "vertical",
        order: 4
    },
    {
        title: "Intimate Heritage Narrative",
        caption: "Intimate pre-wedding destination narrative amidst historic heritage architecture",
        altText: "Heritage estate destination pre-wedding couple photography Kolkata",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 5
    },
    {
        title: "Shubho Drishti Ceremony",
        caption: "Traditional auspicious Shubho Drishti betel leaf ceremony captured candidly",
        altText: "Auspicious Shubho Drishti Bengali wedding ritual photography",
        category: "rituals",
        imageUrl: "/thumbnails/seo_thumb_drishti.jpg",
        aspectRatio: "vertical",
        order: 6
    },
    {
        title: "Golden Hour Couple Portrait",
        caption: "Cinematic bride and groom golden hour portrait in Kolkata",
        altText: "Golden hour cinematic wedding couple photoshoot Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 7
    },
    {
        title: "Vibrant Gaye Holud Moments",
        caption: "Vibrant haldi ceremony moments filled with genuine laughter and family celebrations",
        altText: "Vibrant Gaye Holud turmeric ceremony photography Kolkata",
        category: "rituals",
        imageUrl: "/thumbnails/seo_thumb_holud.jpg",
        aspectRatio: "vertical",
        order: 8
    },
    {
        title: "Saat Paak Sacred Circles",
        caption: "Seven sacred circumambulations of Saat Paak wedding ritual",
        altText: "Seven sacred vows Saat Paak Bengali marriage ritual photography",
        category: "rituals",
        imageUrl: "/thumbnails/seo_saat_paak.jpg",
        aspectRatio: "vertical",
        order: 9
    },
    {
        title: "Sacred Garland Exchange Vows",
        caption: "Cinematic wedding vows and exchange of floral garlands ritual in Kolkata",
        altText: "Mala Bodol exchange of floral garlands ceremony in Kolkata",
        category: "rituals",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861480620-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 10
    },
    {
        title: "Bridal Preparation Artistry",
        caption: "Meticulous bridal preparation with traditional Benarasi saree and sandalwood art",
        altText: "Bridal preparation and makeup artistry photography Kolkata",
        category: "weddings",
        imageUrl: "/thumbnails/seo_bridal_makeup.jpg",
        aspectRatio: "vertical",
        order: 11
    },
    {
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude DGCA-certified drone view of luxury wedding banquet estate in Kolkata",
        altText: "DGCA certified drone aerial photography of luxury wedding venue Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/banquets-kolkata.jpg",
        aspectRatio: "horizontal",
        order: 12
    },
    {
        title: "Prinsep Ghat Monument Aerial",
        caption: "Aerial sweep over Vidyasagar Setu and Prinsep Ghat riverside memorial",
        altText: "Aerial drone cinematography at Prinsep Ghat and Hooghly river Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/prinsep-ghat.jpg",
        aspectRatio: "horizontal",
        order: 13
    },
    {
        title: "Bou Bhat Welcoming Ritual",
        caption: "Cherished Bou Bhat ceremony welcoming the newlywed bride to the household",
        altText: "Bou Bhat traditional Bengali post-wedding reception ritual",
        category: "rituals",
        imageUrl: "/thumbnails/seo_bou_bhat.jpg",
        aspectRatio: "vertical",
        order: 14
    },
    {
        title: "Ashirbad Blessings Ceremony",
        caption: "Elders offering sacred blessings during the traditional Ashirbad ceremony",
        altText: "Traditional Ashirbad wedding blessings ceremony Kolkata",
        category: "rituals",
        imageUrl: "/thumbnails/seo_ashirbad.jpg",
        aspectRatio: "vertical",
        order: 15
    },
    {
        title: "L&T Industrial Cinematography",
        caption: "High-precision commercial documentary for L&T Superior Mobile Air Classifier",
        altText: "L&T industrial commercial film production by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 16
    },
    {
        title: "TATA Genrobotics Bandicoot Film",
        caption: "Documentary innovation film highlighting social robotics for TATA Trust",
        altText: "TATA Trust Bandicoot commercial film by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/zFWNx12dg3c/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 17
    },
    {
        title: "Chandra Udyog Factory Cinematography",
        caption: "Manufacturing plant process documentation and brand storytelling",
        altText: "Chandra Udyog industrial plant video production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/UqnXM7lm4qE/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 18
    },
    {
        title: "Atlas Foundries Precision Shoot",
        caption: "Heavy casting and foundry manufacturing commercial cinematography",
        altText: "Atlas Foundries commercial documentary film Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 19
    },
    {
        title: "Candid Couple Laughter",
        caption: "Spontaneous laughter shared between bride and groom during phere rituals",
        altText: "Candid wedding couple laughter and genuine emotions Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861489175-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 20
    },
    {
        title: "Heritage Mandap Decor & Atmosphere",
        caption: "Grand floral mandap decor illuminated under warm evening fairy lights",
        altText: "Luxury Bengali wedding mandap decor and floral architecture",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861508628-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 21
    },
    {
        title: "Intimate Pre-Wedding Silhouette",
        caption: "Sunset silhouette capture capturing contemporary romance along Hooghly river",
        altText: "Cinematic couple silhouette pre-wedding shoot Kolkata",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861522772-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 22
    },
    {
        title: "Bengali Bride Kalai Shobha",
        caption: "Artisan gold jewelry and traditional Shankha Pola bridal details",
        altText: "Traditional Bengali bridal jewelry and Shankha Pola close-up portrait",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861531176-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 23
    },
    {
        title: "Vows and Sacred Fire Agni Sakshi",
        caption: "Solemn marital vows witnessed before the sacred Agni wedding fire",
        altText: "Agni Sakshi holy fire vows ceremony Bengali wedding",
        category: "rituals",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861544533-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 24
    },
    {
        title: "Pre-Wedding Urban Street Narrative",
        caption: "Stylized retro fashion pre-wedding shoot in heritage North Kolkata streets",
        altText: "North Kolkata vintage pre-wedding photography by Dreamline Production",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861562409-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 25
    },
    {
        title: "Grand Sindoor Daan Climax",
        caption: "Heart-stopping moment of vermilion application sealing the marital union",
        altText: "Cinematic sindoor daan wedding photography Kolkata",
        category: "rituals",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861570785-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 26
    },
    {
        title: "Groom Baraat Celebrations",
        caption: "High-energy dhol and fireworks procession celebrating the groom's arrival",
        altText: "Groom baraat entry and grand wedding celebration Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861604584-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 27
    },
    {
        title: "Modern Couple Twilight Portrait",
        caption: "Twilight architectural portrait capturing modern luxury couture",
        altText: "Modern luxury wedding couple twilight photoshoot Kolkata",
        category: "weddings",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861615934-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 28
    }
];

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const all = searchParams.get("all") === "true";

        // Check if DB has items; if not, seed with authentic production assets
        const existingCount = await GalleryItem.countDocuments();
        if (existingCount === 0) {
            await GalleryItem.insertMany(INITIAL_GALLERY_SEED);
            await syncContentSplitGallery();
        }

        const filter = {};
        if (!all) {
            filter.published = true;
        }
        if (category && category !== "all") {
            filter.category = category;
        }

        const items = await GalleryItem.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        // Calculate dynamic category counts
        const allItems = await GalleryItem.find(all ? {} : { published: true }).select('category').lean();
        const counts = {
            all: allItems.length,
            weddings: allItems.filter(i => i.category === 'weddings').length,
            'pre-wedding': allItems.filter(i => i.category === 'pre-wedding').length,
            rituals: allItems.filter(i => i.category === 'rituals').length,
            commercial: allItems.filter(i => i.category === 'commercial').length,
            drone: allItems.filter(i => i.category === 'drone').length
        };

        return NextResponse.json({
            items,
            counts,
            total: items.length
        });
    } catch (err) {
        console.error("GET /api/gallery error:", err);
        return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Handle reorder array
        if (body.action === 'reorder' && Array.isArray(body.items)) {
            const bulkOps = body.items.map((item, index) => ({
                updateOne: {
                    filter: { _id: item._id || item.id },
                    update: { $set: { order: index + 1 } }
                }
            }));
            if (bulkOps.length > 0) {
                await GalleryItem.bulkWrite(bulkOps);
            }
            await syncContentSplitGallery();
            revalidatePath('/gallery');
            revalidatePath('/');
            return NextResponse.json({ success: true, message: "Order updated successfully" });
        }

        // Validate required fields for new item
        if (!body.title || !body.imageUrl) {
            return NextResponse.json({ error: "Title and Image URL are required" }, { status: 400 });
        }

        // Determine next order
        const maxOrderItem = await GalleryItem.findOne().sort({ order: -1 }).select('order').lean();
        const nextOrder = (maxOrderItem?.order || 0) + 1;

        const newItem = await GalleryItem.create({
            title: body.title.trim(),
            caption: (body.caption || "").trim(),
            altText: (body.altText || body.title).trim(),
            category: body.category || 'weddings',
            imageUrl: body.imageUrl.trim(),
            aspectRatio: body.aspectRatio || 'vertical',
            order: body.order !== undefined ? body.order : nextOrder,
            published: body.published !== undefined ? Boolean(body.published) : true
        });

        await syncContentSplitGallery();
        revalidatePath('/gallery');
        revalidatePath('/');

        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (err) {
        console.error("POST /api/gallery error:", err);
        return NextResponse.json({ error: err.message || "Failed to create gallery item" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const itemId = body._id || body.id;

        if (!itemId) {
            return NextResponse.json({ error: "Item ID is required for update" }, { status: 400 });
        }

        const updateFields = {};
        if (body.title !== undefined) updateFields.title = body.title.trim();
        if (body.caption !== undefined) updateFields.caption = body.caption.trim();
        if (body.altText !== undefined) updateFields.altText = body.altText.trim();
        if (body.category !== undefined) updateFields.category = body.category;
        if (body.imageUrl !== undefined) updateFields.imageUrl = body.imageUrl.trim();
        if (body.aspectRatio !== undefined) updateFields.aspectRatio = body.aspectRatio;
        if (body.order !== undefined) updateFields.order = Number(body.order);
        if (body.published !== undefined) updateFields.published = Boolean(body.published);

        const updated = await GalleryItem.findByIdAndUpdate(
            itemId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
        }

        await syncContentSplitGallery();
        revalidatePath('/gallery');
        revalidatePath('/');

        return NextResponse.json({ success: true, item: updated });
    } catch (err) {
        console.error("PUT /api/gallery error:", err);
        return NextResponse.json({ error: err.message || "Failed to update gallery item" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Item ID is required for deletion" }, { status: 400 });
        }

        const deleted = await GalleryItem.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
        }

        await syncContentSplitGallery();
        revalidatePath('/gallery');
        revalidatePath('/');

        return NextResponse.json({ success: true, message: "Gallery item deleted successfully" });
    } catch (err) {
        console.error("DELETE /api/gallery error:", err);
        return NextResponse.json({ error: err.message || "Failed to delete gallery item" }, { status: 500 });
    }
}
