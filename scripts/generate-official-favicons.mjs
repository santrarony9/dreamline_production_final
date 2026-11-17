import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

console.log("================================================================================");
console.log("   DREAMLINE PRODUCTION - OFFICIAL LOGO FAVICON GENERATION SCRIPT              ");
console.log("================================================================================\n");

const SOURCE_LOGO = path.join(ROOT_DIR, 'public', 'logo.png');

if (!fs.existsSync(SOURCE_LOGO)) {
    console.error("ERROR: Source logo not found at:", SOURCE_LOGO);
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

async function generateFavicons() {
    console.log(`[Source Logo] Reading ${SOURCE_LOGO}...`);
    const meta = await sharp(SOURCE_LOGO).metadata();
    console.log(`[Source Logo] Dimensions: ${meta.width}x${meta.height}, Format: ${meta.format}\n`);

    // 1. Generate PNG Variants
    const targets = [
        { file: 'public/favicon-16.png', size: 16 },
        { file: 'public/favicon-32.png', size: 32 },
        { file: 'public/favicon-48.png', size: 48 },
        { file: 'public/apple-icon.png', size: 180 },
        { file: 'public/icon-192.png', size: 192 },
        { file: 'public/icon-512.png', size: 512 },
        { file: 'public/favicon.png', size: 512 },
        { file: 'public/icon.png', size: 512 }
    ];

    for (const target of targets) {
        const targetPath = path.join(ROOT_DIR, target.file);
        await sharp(SOURCE_LOGO)
            .resize(target.size, target.size, { fit: 'contain' })
            .png({ quality: 100, compressionLevel: 9 })
            .toFile(targetPath);
        console.log(`  [OK] Generated ${target.file} (${target.size}x${target.size})`);
    }

    // 2. Generate Multi-Resolution ICO (16x16, 32x32, 48x48)
    const [png16, png32, png48] = await Promise.all([
        sharp(SOURCE_LOGO).resize(16, 16, { fit: 'contain' }).png().toBuffer(),
        sharp(SOURCE_LOGO).resize(32, 32, { fit: 'contain' }).png().toBuffer(),
        sharp(SOURCE_LOGO).resize(48, 48, { fit: 'contain' }).png().toBuffer()
    ]);

    const icoBuffer = buildIcoBuffer([png16, png32, png48], [16, 32, 48]);

    const publicIcoPath = path.join(ROOT_DIR, 'public', 'favicon.ico');
    const appIcoPath = path.join(ROOT_DIR, 'src', 'app', 'favicon.ico');

    fs.writeFileSync(publicIcoPath, icoBuffer);
    console.log(`  [OK] Generated public/favicon.ico (Multi-res: 16, 32, 48) - Size: ${icoBuffer.length} bytes`);

    fs.writeFileSync(appIcoPath, icoBuffer);
    console.log(`  [OK] Generated src/app/favicon.ico (Multi-res: 16, 32, 48) - Size: ${icoBuffer.length} bytes`);

    console.log("\n================================================================================");
    console.log("   ALL OFFICIAL DREAMLINE FAVICONS GENERATED SUCCESSFULLY                      ");
    console.log("================================================================================");
}

generateFavicons().catch(err => {
    console.error("Generation failed:", err);
    process.exit(1);
});
