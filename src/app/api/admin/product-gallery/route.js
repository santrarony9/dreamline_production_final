export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import ProductImage from '@/models/ProductImage';
import ProductCategory from '@/models/ProductCategory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureProductGallerySeeded, INITIAL_PRODUCT_CATEGORIES } from '@/lib/product-gallery-defaults';

// ── GET: Fetch all images (Admin view) ──
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        await ensureProductGallerySeeded();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const status = searchParams.get('status'); // 'all', 'published', 'draft', 'featured'

        const query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (status === 'published') {
            query.isPublished = true;
        } else if (status === 'draft') {
            query.isPublished = false;
        } else if (status === 'featured') {
            query.isFeatured = true;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: regex },
                { altText: regex },
                { category: regex }
            ];
        }

        const images = await ProductImage.find(query)
            .sort({ order: 1, isFeatured: -1, createdAt: -1 })
            .lean();

        // Get category list and counts
        const categories = await ProductCategory.find().sort({ order: 1 }).lean();
        const allImages = await ProductImage.find({}, { category: 1, isPublished: 1, isFeatured: 1 }).lean();

        const categoryCounts = {};
        allImages.forEach(img => {
            const cat = img.category || 'Other Products';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const totalPublished = allImages.filter(i => i.isPublished).length;
        const totalDraft = allImages.filter(i => !i.isPublished).length;
        const totalFeatured = allImages.filter(i => i.isFeatured).length;

        return NextResponse.json({
            success: true,
            images: JSON.parse(JSON.stringify(images || [])),
            categories: JSON.parse(JSON.stringify(categories.length > 0 ? categories : INITIAL_PRODUCT_CATEGORIES)),
            categoryCounts,
            stats: {
                total: allImages.length,
                published: totalPublished,
                draft: totalDraft,
                featured: totalFeatured
            }
        });
    } catch (error) {
        console.error("[Admin Product Gallery] GET Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch images" }, { status: 500 });
    }
}

// ── POST: Create single or multiple images ──
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Batch upload case: { images: [...] }
        if (Array.isArray(body.images) && body.images.length > 0) {
            // Find max order
            const lastItem = await ProductImage.findOne().sort({ order: -1 }).lean();
            let baseOrder = (lastItem?.order || 0) + 1;

            const docsToInsert = body.images.map((img, idx) => ({
                title: img.title?.trim() || "Product Showcase Image",
                imageUrl: img.imageUrl?.trim(),
                thumbnailUrl: img.thumbnailUrl?.trim() || img.imageUrl?.trim() || "",
                category: img.category?.trim() || "Other Products",
                altText: img.altText?.trim() || img.title?.trim() || "",
                isFeatured: Boolean(img.isFeatured),
                isPublished: img.isPublished !== false,
                aspectRatio: img.aspectRatio || "1:1",
                order: img.order !== undefined ? img.order : baseOrder + idx
            })).filter(item => Boolean(item.imageUrl));

            if (docsToInsert.length === 0) {
                return NextResponse.json({ error: "No valid image data provided" }, { status: 400 });
            }

            const inserted = await ProductImage.insertMany(docsToInsert);

            revalidatePath('/services/product-photography-kolkata');
            revalidatePath('/services/product');
            revalidatePath('/api/product-gallery');

            return NextResponse.json({
                success: true,
                message: `Successfully added ${inserted.length} product image(s)`,
                count: inserted.length,
                images: inserted
            });
        }

        // Single image case
        const { title, imageUrl, thumbnailUrl, category, altText, isFeatured, isPublished, aspectRatio, order } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        let finalOrder = order;
        if (finalOrder === undefined || finalOrder === null) {
            const lastItem = await ProductImage.findOne().sort({ order: -1 }).lean();
            finalOrder = (lastItem?.order || 0) + 1;
        }

        const newImage = await ProductImage.create({
            title: title?.trim() || "Product Showcase Image",
            imageUrl: imageUrl.trim(),
            thumbnailUrl: thumbnailUrl?.trim() || imageUrl.trim(),
            category: category?.trim() || "Other Products",
            altText: altText?.trim() || title?.trim() || "",
            isFeatured: Boolean(isFeatured),
            isPublished: isPublished !== false,
            aspectRatio: aspectRatio || "1:1",
            order: finalOrder
        });

        revalidatePath('/services/product-photography-kolkata');
        revalidatePath('/services/product');
        revalidatePath('/api/product-gallery');

        return NextResponse.json({
            success: true,
            message: "Product image added successfully",
            image: newImage
        });
    } catch (error) {
        console.error("[Admin Product Gallery] POST Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create product image" }, { status: 500 });
    }
}

// ── PUT: Update single image or batch reorder ──
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Case A: Batch reorder array [{ id, order }]
        if (Array.isArray(body.reorder) && body.reorder.length > 0) {
            const bulkOps = body.reorder.map(item => ({
                updateOne: {
                    filter: { _id: item.id || item._id },
                    update: { $set: { order: Number(item.order) } }
                }
            }));

            await ProductImage.bulkWrite(bulkOps);

            revalidatePath('/services/product-photography-kolkata');
            revalidatePath('/services/product');
            revalidatePath('/api/product-gallery');

            return NextResponse.json({
                success: true,
                message: "Image order updated successfully"
            });
        }

        // Case B: Single image update
        const { _id, title, imageUrl, thumbnailUrl, category, altText, isFeatured, isPublished, aspectRatio, order } = body;

        if (!_id) {
            return NextResponse.json({ error: "Image ID is required for update" }, { status: 400 });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl.trim();
        if (category !== undefined) updateData.category = category.trim();
        if (altText !== undefined) updateData.altText = altText.trim();
        if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
        if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
        if (aspectRatio !== undefined) updateData.aspectRatio = aspectRatio;
        if (order !== undefined) updateData.order = Number(order);

        const updated = await ProductImage.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        revalidatePath('/services/product-photography-kolkata');
        revalidatePath('/services/product');
        revalidatePath('/api/product-gallery');

        return NextResponse.json({
            success: true,
            message: "Product image updated successfully",
            image: updated
        });
    } catch (error) {
        console.error("[Admin Product Gallery] PUT Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update product image" }, { status: 500 });
    }
}

// ── DELETE: Delete single image or bulk IDs ──
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const deleted = await ProductImage.findByIdAndDelete(id);
            if (!deleted) {
                return NextResponse.json({ error: "Image not found" }, { status: 404 });
            }

            revalidatePath('/services/product-photography-kolkata');
            revalidatePath('/services/product');
            revalidatePath('/api/product-gallery');

            return NextResponse.json({
                success: true,
                message: "Product image deleted successfully"
            });
        }

        // Bulk delete via body { ids: [...] }
        const body = await request.json().catch(() => ({}));
        if (Array.isArray(body.ids) && body.ids.length > 0) {
            const res = await ProductImage.deleteMany({ _id: { $in: body.ids } });

            revalidatePath('/services/product-photography-kolkata');
            revalidatePath('/services/product');
            revalidatePath('/api/product-gallery');

            return NextResponse.json({
                success: true,
                message: `Successfully deleted ${res.deletedCount} image(s)`
            });
        }

        return NextResponse.json({ error: "No image ID provided for deletion" }, { status: 400 });
    } catch (error) {
        console.error("[Admin Product Gallery] DELETE Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete product image" }, { status: 500 });
    }
}
