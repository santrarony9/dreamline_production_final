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
        title: "Sid & Trina Wedding Ceremony",
        caption: "Sacred vows and floral garland exchange from Sid & Trina's luxury wedding film in Kolkata",
        altText: "Sid and Trina luxury Bengali wedding ceremony portrait Kolkata",
        category: "weddings",
        imageUrl: "https://img.youtube.com/vi/6S7ZKGVoEGs/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 1,
        published: true
    },
    {
        title: "Rajlaxmi Shubho Drishti Ritual",
        caption: "Bride Rajlaxmi holding sacred betel leaves during the traditional Shubho Drishti ritual",
        altText: "Rajlaxmi Shubho Drishti traditional Bengali wedding ritual Kolkata",
        category: "rituals",
        imageUrl: "https://img.youtube.com/vi/mM59Ah26olI/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 2,
        published: true
    },
    {
        title: "Heritage Mandap Sunset at Howrah",
        caption: "Royal heritage wedding mandap overlooking the iconic Howrah Bridge at golden hour sunset",
        altText: "Howrah Bridge sunset wedding mandap Kolkata by Dreamline Production",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_holud.jpg",
        aspectRatio: "vertical",
        order: 3,
        published: true
    },
    {
        title: "Traditional Bengali Sindoor Daan",
        caption: "Sacred sindoor daan wedding ceremony before the holy Agni fire captured with warm ambient lighting",
        altText: "Traditional Bengali sindoor daan wedding ceremony in Kolkata",
        category: "rituals",
        imageUrl: "/thumbnails/seo_sindoor_daan.jpg",
        aspectRatio: "vertical",
        order: 4,
        published: true
    },
    {
        title: "Cinematic Pre-Wedding Gimbal Shoot",
        caption: "On-location Ronin gimbal camera tracking shot during romantic outdoor couple pre-wedding film",
        altText: "Cinematic pre-wedding photoshoot with Ronin gimbal by Dreamline Production Kolkata",
        category: "pre-wedding",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861448333-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 5,
        published: true
    },
    {
        title: "Royal Heritage Mandap Embrace",
        caption: "Elegant black-and-white couple portrait under luxury floral wedding mandap",
        altText: "Luxury wedding couple portrait under mandap Kolkata",
        category: "weddings",
        imageUrl: "/thumbnails/seo_thumb_drishti.jpg",
        aspectRatio: "vertical",
        order: 6,
        published: true
    },
    {
        title: "Prinsep Ghat Monument Aerial Sweep",
        caption: "DGCA-certified drone aerial perspective over Vidyasagar Setu and Prinsep Ghat riverside memorial",
        altText: "Aerial drone cinematography at Prinsep Ghat and Hooghly river Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/prinsep-ghat.jpg",
        aspectRatio: "horizontal",
        order: 7,
        published: true
    },
    {
        title: "Grand Banquet Aerial Perspective",
        caption: "High-altitude certified drone view of luxury wedding banquet estate in Kolkata",
        altText: "Drone aerial photography of luxury wedding venue Kolkata",
        category: "drone",
        imageUrl: "/thumbnails/banquets-kolkata.jpg",
        aspectRatio: "horizontal",
        order: 8,
        published: true
    },
    {
        title: "L&T Mobile Air Classifier Documentary",
        caption: "High-precision industrial documentary film for L&T Construction & Mining Machinery",
        altText: "L&T industrial commercial film production by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/HQDlIySd3aM/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 9,
        published: true
    },
    {
        title: "TATA Genrobotics Bandicoot Film",
        caption: "Social robotics innovation documentary film produced for TATA Trusts",
        altText: "TATA Trusts Bandicoot commercial film by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/zFWNx12dg3c/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 10,
        published: true
    },
    {
        title: "Chandra Udyog Plant Cinematography",
        caption: "Industrial plant machinery operations and manufacturing corporate brand video",
        altText: "Chandra Udyog industrial plant video production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/UqnXM7lm4qE/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 11,
        published: true
    },
    {
        title: "Atlas Foundries Precision Shoot",
        caption: "Heavy casting and engineering foundry manufacturing commercial documentary",
        altText: "Atlas Foundries commercial documentary film Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/rZRB0R-Ane4/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 12,
        published: true
    },
    {
        title: "L&T Breaking Barriers Corporate Film",
        caption: "Corporate brand cinema showcasing heavy machinery innovation and human stories",
        altText: "L&T Breaking Barriers corporate documentary Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/8NpSypsTCbs/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 13,
        published: true
    },
    {
        title: "KSW Eco Saras Corporate Video",
        caption: "Brand story and sustainability profile film for KSW Eco Saras",
        altText: "KSW Eco Saras corporate film production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/LynqHXnCqVg/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 14,
        published: true
    },
    {
        title: "CONNEQT Kolkata Corporate Showcase",
        caption: "Modern corporate workspace cinematography and employee stories for CONNEQT Kolkata",
        altText: "CONNEQT business office commercial film Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/F6dg5pDtC_U/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 15,
        published: true
    },
    {
        title: "Brut India News Documentary",
        caption: "In-depth documentary film covering human resilience and inspiring sports narratives",
        altText: "Brut India news documentary video production by Dreamline Production",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/naGtj-8iHuM/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 16,
        published: true
    },
    {
        title: "TRT World International Feature",
        caption: "International news investigative feature documented on-location in Kolkata",
        altText: "TRT World news feature cinematography Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://img.youtube.com/vi/YCZNkMz9CS4/maxresdefault.jpg",
        aspectRatio: "horizontal",
        order: 17,
        published: true
    },
    {
        title: "Live Broadcast Multi-Cam Control Room",
        caption: "Dreamline Production multi-camera live video mixing console and field broadcast desk",
        altText: "Live multi-camera broadcast control setup by Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861422140-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 18,
        published: true
    },
    {
        title: "ATEM Mini Pro Multi-Camera Switcher",
        caption: "Live production switching rig and preview monitor during grand ceremony broadcast",
        altText: "ATEM Mini Pro switcher multi-cam setup Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861439566-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 19,
        published: true
    },
    {
        title: "Sony Alpha 4K Multi-Track Podcast Recording",
        caption: "On-camera monitor feed during professional studio podcast interview recording",
        altText: "Studio podcast recording on Sony camera Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861456574-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 20,
        published: true
    },
    {
        title: "Think Big Studio Talk Show Production",
        caption: "Full studio wide shot during multi-guest corporate interview and podcast production",
        altText: "Studio talk show video production Dreamline Production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861464923-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 21,
        published: true
    },
    {
        title: "Outdoor Documentary Dialogue Filming",
        caption: "Cinematographer filming natural garden documentary interview with directional audio",
        altText: "Documentary interview video production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861489175-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 22,
        published: true
    },
    {
        title: "Executive Acoustic Studio Interview",
        caption: "Interior corporate interview capture with dedicated lavalier mics and ambient styling",
        altText: "Executive interview shoot by Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861508628-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 23,
        published: true
    },
    {
        title: "Live News & Documentary Field Filming",
        caption: "Gimbal-stabilized dynamic street documentary recording amidst high-energy crowd rally",
        altText: "Field news documentary filming in Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861522772-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 24,
        published: true
    },
    {
        title: "High-Profile Broadcast Dialogue Production",
        caption: "Studio dialogue setup with broadcast microphones and reference field monitor",
        altText: "High profile broadcast interview recording Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861531176-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 25,
        published: true
    },
    {
        title: "Broadcast Studio Multi-Light Setup",
        caption: "Comprehensive studio filming floor showing three-point softbox lighting and tripods",
        altText: "Broadcast studio lighting and camera setup Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861544533-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 26,
        published: true
    },
    {
        title: "Location Commercial Film Filming",
        caption: "Field documentary crew directing landscape commercial shoot with monitor and gimbal",
        altText: "Commercial location film production Kolkata",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861604584-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "horizontal",
        order: 27,
        published: true
    },
    {
        title: "On-Location Investigative Video Journalism",
        caption: "Field video journalist and gimbal camera operator documenting live investigation",
        altText: "Investigative documentary filming Dreamline Production",
        category: "commercial",
        imageUrl: "https://backend.dreamlineproduction.com/uploads/1790861615934-WhatsApp_Image_2026-.jpeg",
        aspectRatio: "vertical",
        order: 28,
        published: true
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
