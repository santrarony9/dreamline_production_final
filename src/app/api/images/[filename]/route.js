import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');
        
        if (!imageUrl) {
            return new NextResponse('Missing url parameter', { status: 400 });
        }
        
        // Domain allowlist
        const ALLOWED_DOMAINS = [
            "dreamlinepro.s3.ap-south-2.amazonaws.com",
            "dreamlinepro.s3.amazonaws.com",
            "images.unsplash.com",
            "lh3.googleusercontent.com",
            "maps.googleapis.com",
        ];

        try {
            const parsedUrl = new URL(imageUrl);

            // Block non-HTTPS
            if (parsedUrl.protocol !== "https:") {
                return new NextResponse("Only HTTPS URLs allowed", { status: 400 });
            }

            // Check domain allowlist
            const isAllowed = ALLOWED_DOMAINS.some(
                (domain) =>
                    parsedUrl.hostname === domain ||
                    parsedUrl.hostname.endsWith("." + domain)
            );

            if (!isAllowed) {
                return new NextResponse("Domain not allowed", { status: 403 });
            }

            // Block private IPs
            const blockedPatterns = [
                /^localhost$/i,
                /^127\./,
                /^10\./,
                /^172\.(1[6-9]|2\d|3[01])\./,
                /^192\.168\./,
                /^169\.254\./,
                /^0\./,
                /^\[::1\]/,
            ];
            if (blockedPatterns.some((p) => p.test(parsedUrl.hostname))) {
                return new NextResponse("Blocked", { status: 403 });
            }
        } catch (e) {
            return new NextResponse("Invalid URL", { status: 400 });
        }
        
        console.log(`[ImageProxy] Fetching image: ${imageUrl}`);
        
        // Fetch the raw image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return new NextResponse('Failed to fetch source image', { status: response.status });
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Compress and resize using sharp to keep size under 2MB and format as a standard JPG
        const optimizedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
            
        console.log(`[ImageProxy] Optimization complete. Size: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`);
            
        return new NextResponse(optimizedBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=604800, must-revalidate',
                'Content-Length': optimizedBuffer.length.toString()
            }
        });
    } catch (error) {
        console.error('[ImageProxy] Error:', error.message);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
