import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

const REQUIRED_11_VIDEOS = [
    { id: 'yleEJrCNEf0', type: 'shorts', title: "কেন টেলিভিশন ইন্ডাস্ট্রিকে 'Soulless Job' বললেন অভিনেতা বরুণ চন্দ?" },
    { id: 'KSivcLWbdnA', type: 'shorts', title: "সঙ্গীতে সফলতার টিপস" },
    { id: 'gV2eKL_RTrc', type: 'shorts', title: "সুন্দর বাংলা গান" },
    { id: '9nrOL-qhBf0', type: 'shorts', title: "শতরূপে মা দুর্গা" },
    { id: 'n1-LSS_uzJQ', type: 'shorts', title: "Calcutta's Mini Lucknow" },
    { id: '5bINCVdismM', type: 'shorts', title: "Get Healed Through Recitation by Sangita Saha" },
    { id: 'JV_yYXVIgjo', type: 'shorts', title: "ডায়মন্ড কি শুধুই হাই-সোসাইটির জন্য?" },
    { id: 'vTQLIoqQPGU', type: 'standard', title: "ভবানীপুর কী deciding factor?" },
    { id: 'TU6KUw_55ic', type: 'standard', title: "অল্প বয়সেও হতে পারে Prostate Problem!" },
    { id: 'J_s5AIP-hFY', type: 'shorts', title: "ভারতীয় মেয়েদের বিশ্বজয়" },
    { id: 'f2_paHV562A', type: 'shorts', title: "রাজনীতিতে কে থাকবে, আর কে যাবে" }
];

async function runTests() {
    console.log("================================================================================");
    console.log("     DREAMLINE PRODUCTION - 11 PODCAST VIDEOS VERIFICATION SUITE               ");
    console.log("================================================================================\n");

    let passed = 0;
    let failed = 0;

    function assert(cond, name, details = '') {
        if (cond) {
            console.log(`  [PASS] ${name}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${name} ${details ? `(${details})` : ''}`);
            failed++;
        }
    }

    // 1. Check Public API
    console.log("--- 1. Testing /api/podcasts/ Endpoint ---");
    let apiData = null;
    try {
        const res = await fetch(`${BASE_URL}/api/podcasts/`);
        assert(res.status === 200, "GET /api/podcasts/ status 200 OK");
        apiData = await res.json();
        assert(apiData.success === true, "API response success is true");
        assert(apiData.total >= 11, `API returns ${apiData.total} published videos (>= 11)`);
    } catch (e) {
        assert(false, "Fetch /api/podcasts/", e.message);
        return;
    }

    // 2. Verify all 11 videos in API with correct types
    console.log("\n--- 2. Verifying All 11 Videos & Video Formats in API ---");
    const apiVideosMap = new Map(apiData.items.map(v => [v.youtubeId, v]));
    for (const v of REQUIRED_11_VIDEOS) {
        const item = apiVideosMap.get(v.id);
        assert(item !== undefined, `Video [${v.id}] found in API`);
        if (item) {
            assert(item.videoType === v.type, `Video [${v.id}] format detected as '${item.videoType}' (expected '${v.type}')`);
            assert(item.status === 'published', `Video [${v.id}] is published`);
        }
    }

    // 3. Check Live Public Service Page HTML
    console.log("\n--- 3. Testing Public Service Page (/services/podcast-production-kolkata/) ---");
    let pageHtml = '';
    try {
        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        assert(pageRes.status === 200, "Service page status 200 OK");
        pageHtml = await pageRes.text();
    } catch (e) {
        assert(false, "Fetch service page", e.message);
        return;
    }

    // 4. Verify all 11 IDs rendered in Service Page HTML
    console.log("\n--- 4. Verifying All 11 Video IDs rendered on Public Page ---");
    for (const v of REQUIRED_11_VIDEOS) {
        assert(pageHtml.includes(v.id), `Video [${v.id}] rendered in HTML markup`);
    }

    // 5. Verify aspect ratio styles & layout
    console.log("\n--- 5. Verifying Responsive Layout & Aspect Ratios ---");
    assert(pageHtml.includes("aspect-video"), "16:9 Landscape aspect ratio (aspect-video) present for regular videos");
    assert(pageHtml.includes("aspect-[9/16]"), "9:16 Vertical aspect ratio (aspect-[9/16]) present for shorts");
    assert(pageHtml.includes("All Productions"), "Filter tab 'All Productions' present");
    assert(pageHtml.includes("Full Episodes"), "Filter tab 'Full Episodes' present");
    assert(pageHtml.includes("Podcast Shorts"), "Filter tab 'Podcast Shorts' present");

    // 6. Verify Optimized YouTube Thumbnails (https://img.youtube.com/vi/ID/hqdefault.jpg)
    console.log("\n--- 6. Verifying Actual YouTube Thumbnails ---");
    for (const v of REQUIRED_11_VIDEOS) {
        const thumbUrl = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
        try {
            const tr = await fetch(thumbUrl);
            assert(tr.status === 200, `Optimized Thumbnail (hqdefault.jpg) for [${v.id}] returns HTTP 200`);
        } catch (e) {
            assert(false, `Thumbnail check for [${v.id}]`, e.message);
        }
    }
    assert(pageHtml.includes("img.youtube.com") && pageHtml.includes("hqdefault.jpg"), "Page uses img.youtube.com/vi/ID/hqdefault.jpg thumbnails");

    // 7. Verify Embed Functionality
    console.log("\n--- 7. Verifying Embed Player Markup & Lazy Loading ---");
    // Check that click-to-play play button is present in SSR HTML
    assert(pageHtml.includes("Play video:") || pageHtml.includes("group-hover:scale-110"), "Click-to-play video triggers present in HTML");
    // Verify iframe embed configuration exists in the client component
    const showcaseCode = await fs.readFile(path.join(process.cwd(), 'src/components/global/ServiceVideoShowcase.js'), 'utf8');
    assert(showcaseCode.includes("embed/${video.ytId}"), "YouTube embed iframe markup configured in ServiceVideoShowcase");
    assert(showcaseCode.includes('loading="lazy"'), "Lazy loading enabled on video embed frames");
    assert(!pageHtml.includes("autoplay=1&"), "No auto-playing videos on initial SSR load");

    // 8. Verify Admin Navigation & Dashboard
    console.log("\n--- 8. Verifying Admin Backend & Drag-and-Drop Capability ---");
    try {
        const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf/`);
        const csrfData = await csrfRes.json();
        const csrfCookies = csrfRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');

        const signinRes = await fetch(`${BASE_URL}/api/auth/callback/credentials/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': csrfCookies
            },
            body: new URLSearchParams({
                username: 'admin',
                password: 'Dreamline2026',
                csrfToken: csrfData.csrfToken,
                redirect: 'false'
            }),
            redirect: 'manual'
        });

        const setCookies = signinRes.headers.getSetCookie();
        const sessionTokenCookie = setCookies.find(c => c.startsWith('next-auth.session-token='));
        assert(sessionTokenCookie, "Admin Login successful");
        const sessionCookie = sessionTokenCookie.split(';')[0];

        const adminRes = await fetch(`${BASE_URL}/admin/podcasts/`, {
            headers: { 'Cookie': sessionCookie }
        });
        assert(adminRes.status === 200, "GET /admin/podcasts/ status 200 OK");
        const adminHtml = await adminRes.text();
        assert(adminHtml.includes("Podcast Video"), "Admin has Podcast Video Management title");
        
        const adminCode = await fs.readFile(path.join(process.cwd(), 'src/app/admin/podcasts/page.js'), 'utf8');
        assert(adminCode.includes("draggable") && adminCode.includes("handleDragStart"), "Drag and drop enabled (draggable attribute & handlers present on cards)");
    } catch (e) {
        assert(false, "Admin verification", e.message);
    }

    // 9. Verify Other Service Pages Unchanged
    console.log("\n--- 9. Verifying Other Service Pages Intact ---");
    const otherPages = [
        `${BASE_URL}/services/wedding-photography-kolkata/`,
        `${BASE_URL}/services/corporate-photography-kolkata/`,
        `${BASE_URL}/services/drone-videography-kolkata/`,
        `${BASE_URL}/services/video-production-agency-kolkata/`
    ];
    for (const url of otherPages) {
        try {
            const res = await fetch(url);
            assert(res.status === 200, `${url} returns 200 OK`);
        } catch (e) {
            assert(false, `Page ${url}`, e.message);
        }
    }

    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) process.exit(1);
}

runTests();
