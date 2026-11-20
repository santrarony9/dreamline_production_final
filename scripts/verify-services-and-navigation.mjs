// scripts/verify-services-and-navigation.mjs
import http from 'http';

const URLS = [
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
    '/tech/',
    '/services/live-stream-broadcast-kolkata/',
    '/api/navigation',
    '/api/admin/services/categories'
];

async function checkUrl(path) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ path, statusCode: res.statusCode, length: data.length });
            });
        });
        req.on('error', (err) => {
            resolve({ path, statusCode: 0, error: err.message });
        });
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({ path, statusCode: 0, error: 'TIMEOUT' });
        });
    });
}

async function run() {
    console.log(`Starting verification of ${URLS.length} endpoints...`);
    let passCount = 0;
    let failCount = 0;

    for (const url of URLS) {
        const res = await checkUrl(url);
        // 200 OK or 308 redirect or 200 from API
        const pass = (res.statusCode >= 200 && res.statusCode < 400);
        if (pass) {
            passCount++;
            console.log(`✓ [${res.statusCode}] ${res.path} (${res.length} bytes)`);
        } else {
            failCount++;
            console.error(`✗ [${res.statusCode}] ${res.path} - ${res.error || 'Failed'}`);
        }
    }

    console.log(`\nResults: ${passCount} Passed, ${failCount} Failed out of ${URLS.length} total.`);
    if (failCount > 0) process.exit(1);
}

run();
