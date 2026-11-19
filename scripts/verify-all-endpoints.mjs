const endpoints = [
    '/services/wedding-photography-kolkata/',
    '/services/pre-wedding-shoot-kolkata/',
    '/services/corporate-photography-kolkata/',
    '/services/drone-videography-kolkata/',
    '/services/drone-photography-kolkata/',
    '/services/rice-ceremony-photography-kolkata/',
    '/services/video-production-agency-kolkata/',
    '/services/birthday-photography-kolkata/',
    '/services/other-social-events-kolkata/',
    '/services/post-wedding-photography-kolkata/',
    '/services/commercial-ad-films-kolkata/',
    '/services/brand-promotion-kolkata/',
    '/services/short-film-production-kolkata/',
    '/services/3d-visualization-kolkata/',
    '/services/3d-area-mapping-kolkata/',
    '/services/fashion-photography-kolkata/',
    '/services/podcast-production-kolkata/'
];

console.log('Testing ' + endpoints.length + ' service endpoints on http://localhost:3000 ...\n');

let allSuccess = true;

for (const path of endpoints) {
    const url = `http://localhost:3000${path}`;
    try {
        const start = Date.now();
        const res = await fetch(url);
        const duration = Date.now() - start;
        const html = await res.text();

        const hasVideoShowcase = html.includes('id="service-video-showcase"') || 
                                 html.includes('id="birthday-photography-videos"') || 
                                 html.includes('id="other-social-events-videos"') || 
                                 html.includes('id="podcast-productions"');
        const has2ColGrid = html.includes('grid-cols-1 md:grid-cols-2');
        const hasOddCentering = html.includes('md:col-span-2 flex justify-center');
        const videoCount = (html.match(/Play cinema film:|Play short:/g) || []).length;

        if (res.status === 200) {
            console.log(`✓ [${res.status}] ${path} (${duration}ms)`);
            console.log(`   └─ Showcase: ${hasVideoShowcase ? 'YES' : 'NO'}, 2-Col Grid: ${has2ColGrid ? 'YES' : 'NO'}, Videos rendered: ${videoCount}, Odd Centering: ${hasOddCentering ? 'ACTIVE' : 'EVEN/NONE'}`);
        } else {
            allSuccess = false;
            console.error(`✗ [${res.status}] ${path}`);
        }
    } catch (e) {
        allSuccess = false;
        console.error(`✗ ERROR ${path}:`, e.message);
    }
}

if (allSuccess) {
    console.log('\n========================================');
    console.log('ALL SERVICE ENDPOINTS VERIFIED & PASSING!');
    console.log('========================================');
} else {
    console.error('\nSOME ENDPOINTS FAILED.');
    process.exit(1);
}
