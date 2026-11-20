// scripts/verify-live-production.mjs
import https from 'https';

const BASE_URL = 'https://dreamlineproduction.com';

const PATHS = [
    '/',
    '/services/',
    '/services/fashion/',
    '/services/product/',
    '/services/post-production/',
    '/services/pre-wedding-shoot-kolkata/',
    '/services/wedding-photography-kolkata/',
    '/services/post-wedding-photography-kolkata/',
    '/services/commercial-ad-films-kolkata/',
    '/services/brand-promotion-kolkata/',
    '/services/corporate-photography-kolkata/',
    '/services/short-film-production-kolkata/',
    '/services/3d-visualization-kolkata/',
    '/services/documentary-film-production-kolkata/',
    '/services/podcast-production-kolkata/',
    '/services/drone-photography-kolkata/',
    '/services/drone-videography-kolkata/',
    '/services/3d-area-mapping-kolkata/',
    '/services/birthday-photography-kolkata/',
    '/services/rice-ceremony-photography-kolkata/',
    '/services/other-social-events-kolkata/',
    '/services/fashion-photography-kolkata/',
    '/services/fashion-videography-kolkata/',
    '/services/fashion-films-kolkata/',
    '/services/product-photography-kolkata/',
    '/services/product-videography-kolkata/',
    '/services/product-commercials-kolkata/',
    '/services/video-editing-kolkata/',
    '/services/cinematic-editing-kolkata/',
    '/services/colour-grading-kolkata/',
    '/services/vfx-and-motion-graphics-kolkata/',
    '/services/photo-retouching-kolkata/',
    '/tech',
    '/services/live-stream-broadcast-kolkata/',
    '/api/navigation',
    '/api/admin/services/categories'
];

async function checkEndpoint(path) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${path}`;
        const startTime = Date.now();
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const latency = Date.now() - startTime;
                resolve({ path, statusCode: res.statusCode, latency, length: data.length });
            });
        });
        req.on('error', (err) => {
            resolve({ path, statusCode: 0, error: err.message });
        });
        req.setTimeout(15000, () => {
            req.destroy();
            resolve({ path, statusCode: 0, error: 'TIMEOUT' });
        });
    });
}

async function run() {
    console.log(`Starting live production verification on ${BASE_URL}...`);
    let passCount = 0;
    let failCount = 0;

    for (const p of PATHS) {
        const res = await checkEndpoint(p);
        const pass = (res.statusCode >= 200 && res.statusCode < 400);
        if (pass) {
            passCount++;
            console.log(`✓ [${res.statusCode}] ${p} (${res.latency}ms, ${res.length} bytes)`);
        } else {
            failCount++;
            console.error(`✗ [${res.statusCode}] ${p} (${res.error || 'Failed'})`);
        }
    }

    console.log(`\nLive Verification Summary: ${passCount} Passed, ${failCount} Failed out of ${PATHS.length} total.`);
    if (failCount > 0) process.exit(1);
}

run();
