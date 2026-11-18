import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

const REQUIRED_11_VIDEOS = [
    { id: 'yleEJrCNEf0', type: 'shorts' },
    { id: 'KSivcLWbdnA', type: 'shorts' },
    { id: 'gV2eKL_RTrc', type: 'shorts' },
    { id: '9nrOL-qhBf0', type: 'shorts' },
    { id: 'n1-LSS_uzJQ', type: 'shorts' },
    { id: '5bINCVdismM', type: 'shorts' },
    { id: 'JV_yYXVIgjo', type: 'shorts' },
    { id: 'vTQLIoqQPGU', type: 'standard' },
    { id: 'TU6KUw_55ic', type: 'standard' },
    { id: 'J_s5AIP-hFY', type: 'shorts' },
    { id: 'f2_paHV562A', type: 'shorts' }
];

async function runDiagnosis() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - YOUTUBE EMBED & CSP DIAGNOSTIC TEST SUITE            ");
    console.log("================================================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(cond, name, details = '') {
        if (cond) {
            console.log(`  [PASS] ${name}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${name} ${details ? '- ' + details : ''}`);
            failed++;
        }
    }

    // 1. Diagnose CSP Headers on Live Server
    console.log("--- 1. Testing Live Content Security Policy (CSP) Headers ---");
    const res = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
    assert(res.status === 200, "Service page returns 200 OK");
    const csp = res.headers.get("content-security-policy") || "";
    
    assert(csp.includes("frame-src"), "CSP contains frame-src directive");
    assert(csp.includes("https://www.youtube.com"), "CSP frame-src allows https://www.youtube.com");
    assert(csp.includes("https://youtube.com"), "CSP frame-src allows https://youtube.com");
    assert(csp.includes("https://www.youtube-nocookie.com"), "CSP frame-src allows https://www.youtube-nocookie.com");
    assert(csp.includes("https://*.googlevideo.com"), "CSP connect-src/media-src allows https://*.googlevideo.com");
    assert(csp.includes("https://img.youtube.com"), "CSP img-src allows https://img.youtube.com");

    // 2. Test All 11 YouTube Embed URLs & oEmbed API
    console.log("\n--- 2. Verifying All 11 YouTube Embed URLs & Permissions ---");
    for (const v of REQUIRED_11_VIDEOS) {
        const embedUrl = `https://www.youtube.com/embed/${v.id}`;
        const embedRes = await fetch(embedUrl);
        assert(embedRes.status === 200, `Embed player URL [${v.id}] returns HTTP 200`);

        const watchUrl = `https://www.youtube.com/watch?v=${v.id}`;
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        assert(oembedRes.status === 200, `oEmbed confirms embedding allowed by creator for [${v.id}]`);
    }

    // 3. Verify Iframe Configuration in ServiceVideoShowcase.js
    console.log("\n--- 3. Verifying Iframe Configuration in ServiceVideoShowcase.js ---");
    const showcaseCode = await fs.readFile(path.join(process.cwd(), 'src/components/global/ServiceVideoShowcase.js'), 'utf8');
    assert(showcaseCode.includes("youtube.com/embed/${video.ytId}"), "Embed format is https://www.youtube.com/embed/VIDEO_ID");
    assert(showcaseCode.includes('allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"'), "Iframe has complete permissions in allow attribute");
    assert(showcaseCode.includes("allowFullScreen"), "allowFullScreen enabled on iframe");
    assert(showcaseCode.includes('referrerPolicy="strict-origin-when-cross-origin"'), "Iframe sets strict-origin-when-cross-origin referrerPolicy");
    assert(showcaseCode.includes('loading="lazy"'), "Lazy loading enabled on iframe");
    assert(showcaseCode.includes("originalWatchUrl"), "Direct Watch on YouTube external link enabled as fail-safe fallback");

    // 4. Verify Backend URL Parsing in Admin API
    console.log("\n--- 4. Verifying Backend YouTube URL Parsing & Validation ---");
    const adminCode = await fs.readFile(path.join(process.cwd(), 'src/app/api/admin/podcasts/route.js'), 'utf8');
    assert(adminCode.includes("extractYouTubeId"), "Backend has extractYouTubeId parser");
    assert(adminCode.includes("detectVideoType"), "Backend has detectVideoType parser");

    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) process.exit(1);
}

runDiagnosis().catch(e => {
    console.error(e);
    process.exit(1);
});
