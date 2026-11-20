export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import ProductCategory from '@/models/ProductCategory';
import ProductImage from '@/models/ProductImage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureProductGallerySeeded, INITIAL_PRODUCT_CATEGORIES } from '@/lib/product-gallery-defaults';

const slugify = (text) => (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── GET: Fetch all categories ──
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        await ensureProductGallerySeeded();

        const categories = await ProductCategory.find().sort({ order: 1 }).lean();

        // Get count of images in each category
        const counts = await ProductImage.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => {
            if (c._id) countMap[c._id] = c.count;
        });

        const enriched = (categories.length > 0 ? categories : INITIAL_PRODUCT_CATEGORIES).map(cat => ({
            ...cat,
            imageCount: countMap[cat.name] || 0
        }));

        return NextResponse.json({
            success: true,
            categories: JSON.parse(JSON.stringify(enriched))
        });
    } catch (error) {
        console.error("[Admin Product Categories] GET Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
    }
}

// ── POST: Create new category ──
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { name, slug, order, isActive } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const categorySlug = slugify(slug || name);

        // Check if exists
        const existing = await ProductCategory.findOne({
            $or: [{ name: name.trim() }, { slug: categorySlug }]
        });

        if (existing) {
            return NextResponse.json({ error: "A category with this name or slug already exists" }, { status: 409 });
        }

        let finalOrder = order;
        if (finalOrder === undefined || finalOrder === null) {
            const lastCat = await ProductCategory.findOne().sort({ order: -1 }).lean();
            finalOrder = (lastCat?.order || 0) + 1;
        }

        const newCategory = await ProductCategory.create({
            name: name.trim(),
            slug: categorySlug,
            order: Number(finalOrder),
            isActive: isActive !== false
        });

        revalidatePath('/services/product-photography-kolkata');
        revalidatePath('/services/product');
        revalidatePath('/api/product-gallery');

        return NextResponse.json({
            success: true,
            message: "Category created successfully",
            category: newCategory
        });
    } catch (error) {
        console.error("[Admin Product Categories] POST Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
    }
}

// ── PUT: Update or reorder categories ──
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Batch reorder array
        if (Array.isArray(body.reorder)) {
            const bulkOps = body.reorder.map(item => ({
                updateOne: {
                    filter: { _id: item.id || item._id },
                    update: { $set: { order: Number(item.order) } }
                }
            }));

            await ProductCategory.bulkWrite(bulkOps);

            revalidatePath('/services/product-photography-kolkata');
            revalidatePath('/services/product');
            revalidatePath('/api/product-gallery');

            return NextResponse.json({ success: true, message: "Category order updated" });
        }

        // Single category update
        const { _id, name, slug, order, isActive } = body;
        if (!_id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        const prevCategory = await ProductCategory.findById(_id);
        if (!prevCategory) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        const updateData = {};
        if (name !== undefined && name.trim()) {
            updateData.name = name.trim();
            // If name changed, update any images belonging to previous name!
            if (prevCategory.name !== name.trim()) {
                await ProductImage.updateMany(
                    { category: prevCategory.name },
                    { $set: { category: name.trim() } }
                );
            }
        }
        if (slug !== undefined) updateData.slug = slugify(slug || name);
        if (order !== undefined) updateData.order = Number(order);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updated = await ProductCategory.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true }
        );

        revalidatePath('/services/product-photography-kolkata');
        revalidatePath('/services/product');
        revalidatePath('/api/product-gallery');

        return NextResponse.json({
            success: true,
            message: "Category updated successfully",
            category: updated
        });
    } catch (error) {
        console.error("[Admin Product Categories] PUT Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
    }
}

// ── DELETE: Delete category ──
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        const category = await ProductCategory.findById(id);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Reassign any images with this category to "Other Products"
        await ProductImage.updateMany(
            { category: category.name },
            { $set: { category: "Other Products" } }
        );

        await ProductCategory.findByIdAndDelete(id);

        revalidatePath('/services/product-photography-kolkata');
        revalidatePath('/services/product');
        revalidatePath('/api/product-gallery');

        return NextResponse.json({
            success: true,
            message: `Category "${category.name}" deleted. Any associated images reassigned to "Other Products".`
        });
    } catch (error) {
        console.error("[Admin Product Categories] DELETE Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
    }
}
