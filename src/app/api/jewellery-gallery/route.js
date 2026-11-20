export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JewelleryItem from '@/models/JewelleryItem';

export async function GET() {
    try {
        await dbConnect();
        const items = await JewelleryItem.find({ isPublished: true, isUnclassified: { $ne: true } })
            .sort({ order: 1, createdAt: -1 })
            .select('slug coverImage images order')
            .lean();

        return NextResponse.json({
            success: true,
            count: items.length,
            items: items.map(item => ({
                id: item.slug || item._id.toString(),
                coverImage: item.coverImage,
                images: (item.images && item.images.length > 0) 
                    ? item.images.map(img => img.url) 
                    : [item.coverImage]
            }))
        });
    } catch (error) {
        console.error('Error fetching public jewellery gallery:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
