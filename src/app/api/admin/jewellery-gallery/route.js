export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JewelleryItem from '@/models/JewelleryItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safeErrorResponse } from '@/lib/error-handler';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const view = searchParams.get('view') || 'classified'; // 'classified' or 'unclassified'

        let query = {};
        if (view === 'unclassified') {
            query.isUnclassified = true;
        } else {
            query.isUnclassified = { $ne: true };
            if (category && category !== 'ALL') {
                query.category = category;
            }
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ title: regex }, { slug: regex }, { category: regex }, { notes: regex }];
        }

        const items = await JewelleryItem.find(query)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        // Get total counts
        const [classifiedCount, unclassifiedCount] = await Promise.all([
            JewelleryItem.countDocuments({ isUnclassified: { $ne: true } }),
            JewelleryItem.countDocuments({ isUnclassified: true })
        ]);

        // Distinct categories for filters in admin (from classified groups)
        const categories = await JewelleryItem.distinct('category', { isUnclassified: { $ne: true } });

        // Also fetch lightweight list of all groups for "Move Photo" dropdowns
        const allGroups = await JewelleryItem.find({ isUnclassified: { $ne: true } })
            .select('_id title category')
            .sort({ title: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: items.length,
            classifiedCount,
            unclassifiedCount,
            categories: categories.sort(),
            allGroups: allGroups.map(g => ({ id: g._id.toString(), title: g.title, category: g.category })),
            items: items.map(item => ({
                ...item,
                _id: item._id.toString()
            }))
        });
    } catch (error) {
        return safeErrorResponse(error, 'Failed to fetch jewellery items');
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await request.json();

        // Action: Create group from selected unclassified photos
        if (data.action === 'create_from_unclassified' && Array.isArray(data.unclassifiedIds)) {
            const unclassifiedDocs = await JewelleryItem.find({ _id: { $in: data.unclassifiedIds } }).lean();
            if (unclassifiedDocs.length === 0) {
                return NextResponse.json({ error: 'No unclassified photos found' }, { status: 400 });
            }

            const images = unclassifiedDocs.map((doc, idx) => ({
                url: doc.coverImage,
                order: idx + 1,
                isCover: idx === 0
            }));

            const slug = `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const newGroup = await JewelleryItem.create({
                slug,
                title: data.title || 'New Grouped Jewellery Design',
                category: (data.category || 'JEWELLERY').toUpperCase(),
                coverImage: images[0].url,
                images,
                isUnclassified: false,
                isPublished: true,
                order: await JewelleryItem.countDocuments({ isUnclassified: { $ne: true } }) + 1,
                notes: data.notes || `Created from ${images.length} unclassified photos`
            });

            // Delete the unclassified records since they are now part of the new group
            await JewelleryItem.deleteMany({ _id: { $in: data.unclassifiedIds } });

            return NextResponse.json({ success: true, item: newGroup });
        }

        if (!data.coverImage && (!data.images || data.images.length === 0)) {
            return NextResponse.json({ error: 'Cover image is required' }, { status: 400 });
        }

        const slug = data.slug || `jewel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const images = (data.images && data.images.length > 0)
            ? data.images.map((img, idx) => ({
                url: typeof img === 'string' ? img : img.url,
                order: idx + 1,
                isCover: (typeof img === 'string' ? img : img.url) === data.coverImage
            }))
            : [{ url: data.coverImage, order: 1, isCover: true }];

        const newItem = await JewelleryItem.create({
            slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: data.title || 'New Jewellery Design',
            category: (data.category || 'JEWELLERY').toUpperCase(),
            coverImage: data.coverImage || images[0].url,
            images,
            order: data.order !== undefined ? Number(data.order) : 0,
            isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
            isUnclassified: Boolean(data.isUnclassified),
            notes: data.notes || ''
        });

        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (error) {
        return safeErrorResponse(error, 'Failed to create jewellery item');
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await request.json();

        // Action 1: Change main thumbnail cover
        if (data.action === 'change_cover') {
            const { id, coverImage } = data;
            const item = await JewelleryItem.findById(id);
            if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

            item.coverImage = coverImage;
            item.images = item.images.map(img => ({
                ...img,
                isCover: img.url === coverImage
            }));
            await item.save();
            return NextResponse.json({ success: true, message: 'Main thumbnail changed', coverImage });
        }

        // Action 2: Move photograph between groups
        if (data.action === 'move_photo') {
            const { sourceGroupId, targetGroupId, photoUrl } = data;
            const [source, target] = await Promise.all([
                JewelleryItem.findById(sourceGroupId),
                JewelleryItem.findById(targetGroupId)
            ]);

            if (!source || !target) return NextResponse.json({ error: 'Source or target group not found' }, { status: 404 });

            // Remove from source
            source.images = source.images.filter(img => img.url !== photoUrl);
            if (source.coverImage === photoUrl) {
                source.coverImage = source.images[0]?.url || '';
            }
            await source.save();

            // Add to target
            target.images.push({
                url: photoUrl,
                order: target.images.length + 1,
                isCover: false
            });
            await target.save();

            return NextResponse.json({ success: true, message: 'Photo moved successfully' });
        }

        // Action 3: Remove photo from group to unclassified
        if (data.action === 'remove_photo_to_unclassified') {
            const { groupId, photoUrl } = data;
            const group = await JewelleryItem.findById(groupId);
            if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

            // Remove photo from group
            group.images = group.images.filter(img => img.url !== photoUrl);
            if (group.coverImage === photoUrl) {
                group.coverImage = group.images[0]?.url || '';
            }
            await group.save();

            // Create unclassified item
            const unclassifiedSlug = `unclassified-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            await JewelleryItem.create({
                slug: unclassifiedSlug,
                title: `Unclassified Photograph (removed from ${group.title})`,
                category: 'UNCLASSIFIED',
                coverImage: photoUrl,
                images: [{ url: photoUrl, order: 1, isCover: true }],
                isUnclassified: true,
                isPublished: false,
                notes: `Removed from ${group.title} for manual review`
            });

            return NextResponse.json({ success: true, message: 'Photo moved to unclassified review' });
        }

        // Action 4: Assign unclassified photo to existing group
        if (data.action === 'assign_unclassified') {
            const { unclassifiedId, targetGroupId } = data;
            const unclassDoc = await JewelleryItem.findById(unclassifiedId);
            const target = await JewelleryItem.findById(targetGroupId);

            if (!unclassDoc || !target) {
                return NextResponse.json({ error: 'Photo or target group not found' }, { status: 404 });
            }

            const photoUrl = unclassDoc.coverImage;
            target.images.push({
                url: photoUrl,
                order: target.images.length + 1,
                isCover: false
            });
            await target.save();

            // Remove unclassified document
            await JewelleryItem.findByIdAndDelete(unclassifiedId);

            return NextResponse.json({ success: true, message: 'Photo assigned to group successfully' });
        }

        // Action 5: Batch reorder
        if (data.action === 'reorder' && Array.isArray(data.orders)) {
            const bulkOps = data.orders.map(o => ({
                updateOne: {
                    filter: { _id: o.id },
                    update: { $set: { order: Number(o.order) } }
                }
            }));
            await JewelleryItem.bulkWrite(bulkOps);
            return NextResponse.json({ success: true, message: 'Reordered successfully' });
        }

        // General update
        const { id, ...updateData } = data;
        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = updateData.images.map((img, idx) => ({
                url: typeof img === 'string' ? img : img.url,
                order: idx + 1,
                isCover: (typeof img === 'string' ? img : img.url) === updateData.coverImage
            }));
        }

        const updated = await JewelleryItem.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, item: updated });
    } catch (error) {
        return safeErrorResponse(error, 'Failed to update jewellery item');
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const item = await JewelleryItem.findById(id);
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // Delete group record from database safely without removing original image files from disk
        await JewelleryItem.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Jewellery group removed from database' });
    } catch (error) {
        return safeErrorResponse(error, 'Failed to delete jewellery item');
    }
}
