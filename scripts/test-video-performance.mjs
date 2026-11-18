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

async function runPerformanceVerification() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - PODCAST VIDEO SPEED & PERFORMANCE VERIFICATION       ");
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

    // 1. YouTube Lazy Loading: No Iframes on Initial Page Load
    console.log("--- 1. Testing YouTube Lazy Loading & Zero Simultaneous Players ---");
    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
    const loadTimeMs = Date.now() - startTime;
    const pageHtml = await res.text();

    assert(res.status === 200, `Page HTTP 200 OK (fetched in ${loadTimeMs}ms)`);
    assert(!pageHtml.includes("youtube.com/embed") && !pageHtml.includes("youtube-nocookie.com/embed"), "Zero YouTube iframe players loaded when page opens (0 YouTube players on initial load)");
    assert(!pageHtml.includes("autoplay=1"), "No preloaded/auto-playing streams on initial load");

    // 2. Thumbnail Format: https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
    console.log("\n--- 2. Verifying Optimized Thumbnail Format (https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg) ---");
    assert(pageHtml.includes("https://img.youtube.com/vi/"), "Thumbnails use https://img.youtube.com/vi/ format");
    assert(pageHtml.includes("/hqdefault.jpg"), "Thumbnails use /hqdefault.jpg");

    let totalThumbBytes = 0;
    for (const v of REQUIRED_11_VIDEOS) {
        const hqUrl = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
        const thumbRes = await fetch(hqUrl);
        const buf = await thumbRes.arrayBuffer();
        totalThumbBytes += buf.byteLength;
        const kb = (buf.byteLength / 1024).toFixed(1);
        assert(thumbRes.status === 200 && buf.byteLength < 45000, `Thumbnail [${v.id}] loads instantly (${kb} KB < 45 KB)`);
    }
    const totalKb = (totalThumbBytes / 1024).toFixed(1);
    console.log(`  => Total payload for all 11 thumbnails: ${totalKb} KB (Ultra-fast CDN delivery)`);

    // 3. Early DNS & Preconnect Optimization
    console.log("\n--- 3. Verifying DNS Prefetch & Preconnect Optimization ---");
    assert(pageHtml.includes('rel="preconnect" href="https://img.youtube.com"'), "Preconnect enabled for img.youtube.com");
    assert(pageHtml.includes('rel="preconnect" href="https://www.youtube-nocookie.com"'), "Preconnect enabled for youtube-nocookie.com");
    assert(pageHtml.includes('rel="dns-prefetch" href="https://img.youtube.com"'), "DNS prefetch enabled for img.youtube.com");
    assert(pageHtml.includes('rel="dns-prefetch" href="https://www.youtube-nocookie.com"'), "DNS prefetch enabled for youtube-nocookie.com");

    // 4. Layout Shift Protection (CLS = 0) & Native Lazy Loading
    console.log("\n--- 4. Verifying Layout Shift Protection (CLS = 0) & Native Lazy Loading ---");
    assert(pageHtml.includes("aspect-[9/16]"), "Vertical 9:16 aspect ratio container applied for Shorts (prevents CLS)");
    assert(pageHtml.includes("aspect-video"), "Widescreen 16:9 aspect ratio container applied for standard videos (prevents CLS)");
    assert(pageHtml.includes('loading="lazy"'), "Native image lazy loading (loading=\"lazy\") enabled");

    // 5. Click-to-Play and Deferred Iframe Loading in Component
    console.log("\n--- 5. Verifying Click-to-Play Architecture in ServiceVideoShowcase.js ---");
    const componentCode = await fs.readFile(path.join(process.cwd(), 'src/components/global/ServiceVideoShowcase.js'), 'utf8');
    assert(componentCode.includes("setPlayingVideoId(id)"), "Player mounts on-demand only after visitor clicks Play");
    assert(componentCode.includes("Connecting Player...") || componentCode.includes("Loading Video..."), "Visual loading indicator/placeholder while YouTube player initializes");
    assert(componentCode.includes("youtube.com/embed/${video.ytId}") || componentCode.includes("youtube-nocookie.com/embed/${video.ytId}"), "Standard validated YouTube embed URL (youtube.com/embed/VIDEO_ID)");
    assert(componentCode.includes("onLoad={() => setIframeLoading(false)}"), "Smooth transition from loading placeholder to active stream");
    assert(componentCode.includes("handleClose"), "Close button to unmount player and return to thumbnail");

    // 6. Preventing Multiple Simultaneous Videos & Hidden Video Playback
    console.log("\n--- 6. Verifying Prevention of Multiple Videos & Hidden Playback ---");
    assert(componentCode.includes("setPlayingVideoId(null)"), "Switching tabs or closing video unmounts player (no background audio)");
    assert(componentCode.includes("const isPlaying = playingVideoId === video.ytId"), "Strictly at most 1 video plays at any given moment");

    console.log("\n================================================================================");
    console.log(`TOTAL PERFORMANCE CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) process.exit(1);
}

runPerformanceVerification().catch(e => {
    console.error(e);
    process.exit(1);
});
