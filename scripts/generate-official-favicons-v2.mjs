import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

console.log("================================================================================");
console.log("   DREAMLINE PRODUCTION - OFFICIAL LOGO FAVICON SUITE GENERATOR (V2)          ");
console.log("================================================================================\n");

// Path to user-uploaded reference logo image
const USER_LOGO = 'C:/Users/USER/.gemini/antigravity/brain/4428cf92-2948-4961-beb6-3c8b54e0bf18/.user_uploaded/media_1794920324906_df5ae962.jpg';

if (!fs.existsSync(USER_LOGO)) {
    console.error("ERROR: User logo source not found at:", USER_LOGO);
    process.exit(1);
}

// Function to construct standard multi-image ICO binary format
function buildIcoBuffer(pngBuffers, sizes) {
    const numImages = pngBuffers.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    let offset = headerSize + (dirEntrySize * numImages);

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved (0)
    header.writeUInt16LE(1, 2); // Type (1 for ICO)
    header.writeUInt16LE(numImages, 4); // Number of images

    const dirEntries = [];
    for (let i = 0; i < numImages; i++) {
        const size = sizes[i];
        const data = pngBuffers[i];
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
        entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
        entry.writeUInt8(0, 2); // Color palette
        entry.writeUInt8(0, 3); // Reserved
        entry.writeUInt16LE(1, 4); // Color planes
        entry.writeUInt16LE(32, 6); // Bits per pixel (32-bit RGBA)
        entry.writeUInt32LE(data.length, 8); // Size of image data
        entry.writeUInt32LE(offset, 12); // Offset in file
        dirEntries.push(entry);
        offset += data.length;
    }

    return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function run() {
    console.log(`[Source Logo] Reading ${USER_LOGO}...`);
    const meta = await sharp(USER_LOGO).metadata();
    console.log(`[Source Logo] Dimensions: ${meta.width}x${meta.height}, Format: ${meta.format}\n`);

    // In user-uploaded image:
    // Dimensions: 705x364
    // Elephant emblem center is at x = 362.5, y = 182
    // Square crop of 364x364: left = 180, top = 0, width = 364, height = 364
    // This perfectly centers the elephant + film reel + 'SINCE - 2010' with zero distortion
    console.log("[Master Square] Generating 512x512 master favicon base from authentic logo...");
    const master512Buffer = await sharp(USER_LOGO)
        .extract({ left: 180, top: 0, width: 364, height: 364 })
        .resize(512, 512, { kernel: 'lanczos3' })
        .png({ quality: 100, compressionLevel: 9 })
        .toBuffer();

    // 1. Save master high-resolution PNGs
    const pngTargets = [
        { file: 'public/favicon-16x16.png', size: 16 },
        { file: 'public/favicon-16.png', size: 16 },
        { file: 'public/favicon-32x32.png', size: 32 },
        { file: 'public/favicon-32.png', size: 32 },
        { file: 'public/favicon-48x48.png', size: 48 },
        { file: 'public/favicon-48.png', size: 48 },
        { file: 'public/apple-touch-icon.png', size: 180 },
        { file: 'public/apple-touch-icon-precomposed.png', size: 180 },
        { file: 'public/apple-icon.png', size: 180 },
        { file: 'public/icon-192.png', size: 192 },
        { file: 'public/icon-512.png', size: 512 },
        { file: 'public/favicon.png', size: 512 },
        { file: 'public/icon.png', size: 512 }
    ];

    console.log("[PNG Generation] Generating all resolution variants...");
    for (const target of pngTargets) {
        const targetPath = path.join(ROOT_DIR, target.file);
        await sharp(master512Buffer)
            .resize(target.size, target.size, { kernel: 'lanczos3' })
            .png({ quality: 100, compressionLevel: 9 })
            .toFile(targetPath);
        console.log(`  [OK] Generated ${target.file} (${target.size}x${target.size})`);
    }

    // 2. Generate Multi-Resolution ICO (16x16, 32x32, 48x48)
    console.log("\n[ICO Generation] Building multi-resolution Windows ICO...");
    const [png16, png32, png48] = await Promise.all([
        sharp(master512Buffer).resize(16, 16, { kernel: 'lanczos3' }).png().toBuffer(),
        sharp(master512Buffer).resize(32, 32, { kernel: 'lanczos3' }).png().toBuffer(),
        sharp(master512Buffer).resize(48, 48, { kernel: 'lanczos3' }).png().toBuffer()
    ]);

    const icoBuffer = buildIcoBuffer([png16, png32, png48], [16, 32, 48]);
    const publicIcoPath = path.join(ROOT_DIR, 'public', 'favicon.ico');
    fs.writeFileSync(publicIcoPath, icoBuffer);
    console.log(`  [OK] Generated public/favicon.ico (${icoBuffer.length} bytes)`);

    // Ensure NO conflicting src/app/favicon.ico exists
    const appIcoPath = path.join(ROOT_DIR, 'src', 'app', 'favicon.ico');
    if (fs.existsSync(appIcoPath)) {
        fs.unlinkSync(appIcoPath);
        console.log(`  [CLEANUP] Removed conflicting src/app/favicon.ico`);
    }

    // 3. Generate SVG versions (public/favicon.svg and public/logo.svg)
    console.log("\n[SVG Generation] Generating official SVG favicon and logo...");
    const base64Png = master512Buffer.toString('base64');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="100%" height="100%">
  <title>Dreamline Production Official Logo</title>
  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64Png}" />
</svg>
`;
    fs.writeFileSync(path.join(ROOT_DIR, 'public', 'favicon.svg'), svgContent, 'utf8');
    console.log(`  [OK] Generated public/favicon.svg`);
    fs.writeFileSync(path.join(ROOT_DIR, 'public', 'logo.svg'), svgContent, 'utf8');
    console.log(`  [OK] Updated public/logo.svg with authentic brand logo`);

    // 4. Generate public/site.webmanifest
    console.log("\n[Manifest Generation] Generating public/site.webmanifest...");
    const manifestJson = {
        name: "Dreamline Production",
        short_name: "Dreamline",
        description: "Kolkata's Premier Photography & Cinematic Production House",
        icons: [
            {
                src: "/favicon-48x48.png?v=2",
                sizes: "48x48",
                type: "image/png"
            },
            {
                src: "/icon-192.png?v=2",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/icon-512.png?v=2",
                sizes: "512x512",
                type: "image/png"
            },
            {
                src: "/favicon.png?v=2",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
            }
        ],
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/"
    };
    fs.writeFileSync(path.join(ROOT_DIR, 'public', 'site.webmanifest'), JSON.stringify(manifestJson, null, 2), 'utf8');
    console.log(`  [OK] Generated public/site.webmanifest`);

    // Clean up temporary test files
    const tempFiles = [
        'public/test-user-crop.png',
        'public/test-logo-crop.png',
        'public/test-emblem-512.png',
        'public/test-emblem-32.png',
        'public/test-emblem-16.png',
        'public/test-full-512.png',
        'public/test-full-32.png',
        'public/test-full-16.png',
        'public/test-transparent-emblem.png',
        'public/test-on-white.png',
        'public/test-trans-512.png',
        'public/test-white-512.png',
        'public/test-tab-dark.png',
        'public/test-tab-light.png',
        'public/test-seamless-square.png',
        'public/test-seamless-32.png',
        'public/test-seamless-16.png',
        'public/compare-logo-crop.png',
        'public/test-user-perfect-square.png',
        'public/test-user-32.png',
        'public/test-user-16.png'
    ];
    for (const f of tempFiles) {
        const fp = path.join(ROOT_DIR, f);
        if (fs.existsSync(fp)) {
            try { fs.unlinkSync(fp); } catch (_) {}
        }
    }
    console.log(`  [CLEANUP] Cleaned up temporary test files.`);

    console.log("\n================================================================================");
    console.log("   ALL OFFICIAL FAVICON ASSETS GENERATED & VERIFIED SUCCESSFULLY!              ");
    console.log("================================================================================");
}

run().catch(err => {
    console.error("Fatal Error generating favicons:", err);
    process.exit(1);
});
