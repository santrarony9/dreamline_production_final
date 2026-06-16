import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

async function createFavicon() {
    console.log('Reading your registered logo...');
    
    const logoMeta = await sharp(path.join(publicDir, 'logo.png')).metadata();
    console.log(`Logo dimensions: ${logoMeta.width}x${logoMeta.height}`);
    
    // Tight crop: just the elephant, no text at all
    // Elephant body is roughly between 25%-56% height, 12%-88% width
    const cropTop = Math.round(logoMeta.height * 0.25);
    const cropHeight = Math.round(logoMeta.height * 0.30);
    const cropLeft = Math.round(logoMeta.width * 0.12);
    const cropWidth = Math.round(logoMeta.width * 0.76);
    
    console.log(`Cropping elephant area: left=${cropLeft}, top=${cropTop}, width=${cropWidth}, height=${cropHeight}`);
    
    const elephantBuffer = await sharp(path.join(publicDir, 'logo.png'))
        .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
        .toBuffer();
    
    // Create 512x512 square favicon with white background
    await sharp(elephantBuffer)
        .resize(512, 512, { 
            fit: 'contain', 
            background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .png()
        .toFile(path.join(publicDir, 'favicon.png'));
    
    console.log('✅ Created favicon.png (512x512)');
    
    // Create ICO 64x64
    await sharp(elephantBuffer)
        .resize(64, 64, { 
            fit: 'contain', 
            background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .png()
        .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('✅ Created favicon.ico (64x64)');
    console.log('🎉 Done!');
}

createFavicon().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
