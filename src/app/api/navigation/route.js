import { NextResponse } from 'next/server';
import { getPublishedNavigationTree } from '@/lib/navigation-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const items = await getPublishedNavigationTree();
        return NextResponse.json({
            success: true,
            items
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('[API /api/navigation] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch navigation items'
        }, { status: 500 });
    }
}
