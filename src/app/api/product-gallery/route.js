export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductImage from '@/models/ProductImage';
import ProductCategory from '@/models/ProductCategory';
import { ensureProductGallerySeeded, INITIAL_PRODUCT_CATEGORIES } from '@/lib/product-gallery-defaults';

export async function GET(request) {
    try {
        await dbConnect();
        await ensureProductGallerySeeded();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const featuredOnly = searchParams.get('featured') === 'true';

        // Query filter: always only published images for visitors
        const query = { isPublished: true };

        if (category && category !== 'All' && category !== 'all') {
            query.category = category;
        }

        if (featuredOnly) {
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

        // Fetch images sorted by custom order, then featured, then creation date
        const images = await ProductImage.find(query)
            .sort({ order: 1, isFeatured: -1, createdAt: -1 })
            .lean();

        // Fetch active categories
        let categories = await ProductCategory.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        if (!categories || categories.length === 0) {
            categories = INITIAL_PRODUCT_CATEGORIES;
        }

        return NextResponse.json({
            success: true,
            images: JSON.parse(JSON.stringify(images || [])),
            categories: JSON.parse(JSON.stringify(categories || [])),
            total: images.length
        });
    } catch (error) {
        console.error("[API Product Gallery] GET Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch product gallery images" },
            { status: 500 }
        );
    }
}
