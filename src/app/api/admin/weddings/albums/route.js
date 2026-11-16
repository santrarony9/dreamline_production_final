export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import WeddingAlbum from "@/models/WeddingAlbum";
import Wedding from "@/models/Wedding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import fs from "fs";
import path from "path";

// Helper to keep weddings.json synchronized on disk
async function syncWeddingsJson() {
    try {
        const allWeddings = await Wedding.find().sort({ order: 1 }).lean();
        const filePath = path.join(process.cwd(), 'weddings.json');
        fs.writeFileSync(filePath, JSON.stringify(allWeddings, null, 2), 'utf-8');
    } catch (err) {
        console.error("Failed to sync weddings.json:", err);
    }
}

// Automatically bootstrap WeddingAlbums from existing Weddings if collection is empty
async function ensureAlbumsBootstrapped() {
    try {
        const count = await WeddingAlbum.countDocuments();
        if (count === 0) {
            const existingWeddings = await Wedding.find().sort({ order: 1 }).lean();
            for (const w of existingWeddings) {
                const albumId = `album-${w.id}`;
                const rawImages = Array.isArray(w.images) ? w.images : [];
                const rawAlts = Array.isArray(w.imageAltTexts) ? w.imageAltTexts : [];
                const cover = w.coverImage || w.img || rawImages[0] || "";

                const photos = rawImages.map((url, idx) => ({
                    id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
                    albumId: albumId,
                    url: url,
                    caption: (idx === 0 && w.subtitle) ? `${w.title} - ${w.subtitle}` : "",
                    altText: rawAlts[idx] || `${w.title} wedding photograph Kolkata`,
                    order: idx + 1,
                    isCover: url === cover,
                    createdAt: new Date()
                }));

                await WeddingAlbum.create({
                    albumId: albumId,
                    weddingId: w.id,
                    title: w.title,
                    subtitle: w.subtitle || "",
                    clientNames: w.clientNames || w.title,
                    description: w.description || "",
                    location: w.location || "Kolkata",
                    date: w.date || new Date(),
                    coverImage: cover,
                    videoUrl: w.videoUrl || "",
                    albumUrl: w.albumUrl || "",
                    published: w.published !== false,
                    order: w.order || 0,
                    photos: photos,
                    createdAt: w.createdAt || new Date(),
                    updatedAt: new Date()
                });
            }
        }
    } catch (err) {
        console.error("Bootstrapping WeddingAlbums failed:", err);
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        await ensureAlbumsBootstrapped();

        const { searchParams } = new URL(request.url);
        const albumId = searchParams.get("albumId");
        const weddingId = searchParams.get("weddingId");
        const all = searchParams.get("all") === "true";

        if (albumId) {
            const album = await WeddingAlbum.findOne({ albumId }).lean();
            if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
            return NextResponse.json(album);
        }

        if (weddingId) {
            const album = await WeddingAlbum.findOne({ weddingId }).lean();
            if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
            return NextResponse.json(album);
        }

        const filter = {};
        if (!all) {
            filter.published = true;
        }

        const albums = await WeddingAlbum.find(filter).sort({ order: 1, createdAt: -1 }).lean();
        return NextResponse.json(albums);
    } catch (err) {
        return safeErrorResponse(err, "Wedding Albums GET");
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        if (!data.title || !data.title.trim()) {
            return NextResponse.json({ error: "Album title is required" }, { status: 400 });
        }

        const cleanTitle = data.title.trim();
        const weddingId = data.weddingId || `wedding-${Date.now()}`;
        const albumId = data.albumId || `album-${weddingId}`;

        // Prepare photos array with required albumId
        const incomingPhotos = Array.isArray(data.photos) ? data.photos : [];
        const photos = incomingPhotos.map((p, idx) => ({
            id: p.id || `photo-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
            albumId: albumId,
            url: p.url,
            caption: p.caption || "",
            altText: p.altText || `${cleanTitle} wedding photography`,
            order: p.order !== undefined ? p.order : idx + 1,
            isCover: Boolean(p.isCover),
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
        }));

        const coverImage = data.coverImage || (photos.find(p => p.isCover)?.url) || photos[0]?.url || "";

        // 1. Create WeddingAlbum
        const album = await WeddingAlbum.create({
            albumId,
            weddingId,
            title: cleanTitle,
            subtitle: data.subtitle || "Luxury Bengali Wedding",
            clientNames: data.clientNames || cleanTitle,
            description: data.description || "",
            location: data.location || "Kolkata",
            date: data.date ? new Date(data.date) : new Date(),
            coverImage,
            videoUrl: data.videoUrl || "",
            albumUrl: data.albumUrl || "",
            published: data.published !== false,
            order: data.order !== undefined ? Number(data.order) : 0,
            photos,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 2. Create or sync corresponding Wedding record
        const imageUrls = photos.map(p => p.url).filter(Boolean);
        const imageAltTexts = photos.map(p => p.altText || `${cleanTitle} wedding photo`);

        await Wedding.findOneAndUpdate(
            { id: weddingId },
            {
                $set: {
                    id: weddingId,
                    title: cleanTitle,
                    subtitle: data.subtitle || "Luxury Bengali Wedding",
                    clientNames: data.clientNames || cleanTitle,
                    description: data.description || "",
                    location: data.location || "Kolkata",
                    date: data.date ? new Date(data.date) : new Date(),
                    coverImage,
                    img: coverImage,
                    videoUrl: data.videoUrl || "",
                    albumUrl: data.albumUrl || "",
                    images: imageUrls,
                    imageAltTexts,
                    published: data.published !== false,
                    order: data.order !== undefined ? Number(data.order) : 0,
                    photos,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        await syncWeddingsJson();

        try {
            revalidatePath("/gallery");
            revalidatePath(`/wedding/${weddingId}`);
            revalidatePath("/luxury");
            revalidatePath("/portfolio");
            revalidatePath("/");
            revalidatePath("/admin/weddings");
        } catch (e) {}

        return NextResponse.json({ success: true, album }, { status: 201 });
    } catch (err) {
        return safeErrorResponse(err, "Wedding Album POST");
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        const albumId = data.albumId;
        const weddingId = data.weddingId;

        if (!albumId && !weddingId && !data._id) {
            return NextResponse.json({ error: "Album identifier is required for update" }, { status: 400 });
        }

        // Find existing album
        let existingAlbum = null;
        if (albumId) existingAlbum = await WeddingAlbum.findOne({ albumId });
        if (!existingAlbum && weddingId) existingAlbum = await WeddingAlbum.findOne({ weddingId });
        if (!existingAlbum && data._id) existingAlbum = await WeddingAlbum.findById(data._id);

        if (!existingAlbum) {
            return NextResponse.json({ error: "Wedding album not found" }, { status: 404 });
        }

        const targetAlbumId = existingAlbum.albumId || `album-${existingAlbum.weddingId}`;
        const targetWeddingId = existingAlbum.weddingId;

        // Process photos
        const incomingPhotos = Array.isArray(data.photos) ? data.photos : existingAlbum.photos;
        const photos = incomingPhotos.map((p, idx) => ({
            id: p.id || `photo-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
            albumId: targetAlbumId,
            url: p.url,
            caption: p.caption || "",
            altText: p.altText || `${data.title || existingAlbum.title} wedding photograph`,
            order: p.order !== undefined ? Number(p.order) : idx + 1,
            isCover: Boolean(p.isCover),
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
        }));

        let coverImage = data.coverImage;
        if (!coverImage) {
            coverImage = (photos.find(p => p.isCover)?.url) || photos[0]?.url || existingAlbum.coverImage || "";
        }

        const updateFields = {
            title: (data.title !== undefined ? data.title : existingAlbum.title).trim(),
            subtitle: data.subtitle !== undefined ? data.subtitle : existingAlbum.subtitle,
            clientNames: data.clientNames !== undefined ? data.clientNames : existingAlbum.clientNames,
            description: data.description !== undefined ? data.description : existingAlbum.description,
            location: data.location !== undefined ? data.location : existingAlbum.location,
            date: data.date ? new Date(data.date) : existingAlbum.date,
            coverImage,
            videoUrl: data.videoUrl !== undefined ? data.videoUrl : existingAlbum.videoUrl,
            albumUrl: data.albumUrl !== undefined ? data.albumUrl : existingAlbum.albumUrl,
            published: data.published !== undefined ? Boolean(data.published) : existingAlbum.published,
            order: data.order !== undefined ? Number(data.order) : existingAlbum.order,
            photos,
            updatedAt: new Date()
        };

        const updatedAlbum = await WeddingAlbum.findByIdAndUpdate(
            existingAlbum._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // Synchronize Wedding document
        const imageUrls = photos.map(p => p.url).filter(Boolean);
        const imageAltTexts = photos.map(p => p.altText || `${updateFields.title} wedding photo`);

        await Wedding.findOneAndUpdate(
            { id: targetWeddingId },
            {
                $set: {
                    title: updateFields.title,
                    subtitle: updateFields.subtitle,
                    clientNames: updateFields.clientNames,
                    description: updateFields.description,
                    location: updateFields.location,
                    date: updateFields.date,
                    coverImage: updateFields.coverImage,
                    img: updateFields.coverImage,
                    videoUrl: updateFields.videoUrl,
                    albumUrl: updateFields.albumUrl,
                    images: imageUrls,
                    imageAltTexts,
                    published: updateFields.published,
                    order: updateFields.order,
                    photos,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        await syncWeddingsJson();

        try {
            revalidatePath("/gallery");
            revalidatePath(`/wedding/${targetWeddingId}`);
            revalidatePath("/luxury");
            revalidatePath("/portfolio");
            revalidatePath("/");
            revalidatePath("/admin/weddings");
        } catch (e) {}

        return NextResponse.json({ success: true, album: updatedAlbum });
    } catch (err) {
        return safeErrorResponse(err, "Wedding Album PUT");
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const albumId = searchParams.get("albumId");
        const weddingId = searchParams.get("weddingId");

        if (!albumId && !weddingId) {
            return NextResponse.json({ error: "Album or Wedding ID required" }, { status: 400 });
        }

        await dbConnect();
        
        let deletedAlbum = null;
        if (albumId) deletedAlbum = await WeddingAlbum.findOneAndDelete({ albumId });
        if (!deletedAlbum && weddingId) deletedAlbum = await WeddingAlbum.findOneAndDelete({ weddingId });

        const targetWeddingId = weddingId || deletedAlbum?.weddingId;
        if (targetWeddingId) {
            await Wedding.findOneAndDelete({ id: targetWeddingId });
        }

        await syncWeddingsJson();

        try {
            revalidatePath("/gallery");
            revalidatePath("/luxury");
            revalidatePath("/portfolio");
            revalidatePath("/");
            revalidatePath("/admin/weddings");
        } catch (e) {}

        return NextResponse.json({ success: true, message: "Wedding album removed successfully" });
    } catch (err) {
        return safeErrorResponse(err, "Wedding Album DELETE");
    }
}
