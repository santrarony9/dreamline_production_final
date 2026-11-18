const PROD_URL = "https://dreamlineproduction.com";

const REQUIRED_11_VIDEOS = [
    'yleEJrCNEf0',
    'KSivcLWbdnA',
    'gV2eKL_RTrc',
    '9nrOL-qhBf0',
    'n1-LSS_uzJQ',
    '5bINCVdismM',
    'JV_yYXVIgjo',
    'vTQLIoqQPGU',
    'TU6KUw_55ic',
    'J_s5AIP-hFY',
    'f2_paHV562A'
];

async function verifyLive() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - LIVE PRODUCTION POST-DEPLOYMENT VERIFICATION         ");
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

    // 1. Live Public API Endpoint
    console.log("--- 1. Testing Live Public API Endpoint (/api/podcasts/) ---");
    try {
        const apiRes = await fetch(`${PROD_URL}/api/podcasts/`);
        assert(apiRes.status === 200, "GET /api/podcasts/ returns 200 OK");
        const apiData = await apiRes.json();
        assert(apiData.success === true, "API response success is true");
        assert(Array.isArray(apiData.items) && apiData.items.length >= 11, `API returns ${apiData.items?.length} published podcast videos (>= 11)`);
    } catch (e) {
        assert(false, "API /api/podcasts/", e.message);
    }

    // 2. Live Podcast Service Page
    console.log("\n--- 2. Testing Live Service Page (/services/podcast-production-kolkata/) ---");
    try {
        const pageRes = await fetch(`${PROD_URL}/services/podcast-production-kolkata/`);
        assert(pageRes.status === 200, "Service page returns 200 OK");
        const pageHtml = await pageRes.text();
        const csp = pageRes.headers.get("content-security-policy") || "";

        // Verify CSP Header
        assert(csp.includes("https://www.youtube.com") && csp.includes("https://www.youtube-nocookie.com"), "Live CSP allows both youtube.com and youtube-nocookie.com");

        // Verify All 11 Video IDs rendered
        for (const id of REQUIRED_11_VIDEOS) {
            assert(pageHtml.includes(id), `Video [${id}] rendered in live HTML`);
        }

        // Verify Thumbnails & Aspect ratios
        assert(pageHtml.includes("img.youtube.com") && pageHtml.includes("hqdefault.jpg"), "Optimized hqdefault.jpg thumbnails present");
        assert(pageHtml.includes("aspect-[9/16]"), "Vertical 9:16 aspect ratio container present for Shorts");
        assert(pageHtml.includes("aspect-video"), "Landscape 16:9 aspect ratio container present for standard videos");
        assert(!pageHtml.includes("autoplay=1&"), "Zero auto-playing streams on initial load");
    } catch (e) {
        assert(false, "Service page verification", e.message);
    }

    // 3. Core Pages & Navigation
    console.log("\n--- 3. Testing Core Pages & Navigation ---");
    const routes = [
        { path: "/", desc: "Homepage" },
        { path: "/about/", desc: "About Us Page" },
        { path: "/services/", desc: "Services Overview" },
        { path: "/services/wedding-photography-kolkata/", desc: "Wedding Photography" },
        { path: "/services/corporate-photography-kolkata/", desc: "Corporate Photography" },
        { path: "/services/drone-videography-kolkata/", desc: "Drone Videography" },
        { path: "/portfolio/", desc: "Portfolio Hub" },
        { path: "/blogs/", desc: "Blogs & Journals" },
        { path: "/contact/", desc: "Contact Page" },
        { path: "/admin/login/", desc: "Admin Login Portal" }
    ];

    for (const r of routes) {
        try {
            const res = await fetch(`${PROD_URL}${r.path}`);
            assert(res.status === 200, `${r.desc} (${r.path}) returns 200 OK`);
        } catch (e) {
            assert(false, r.desc, e.message);
        }
    }

    // 4. Brand Favicons and Logos
    console.log("\n--- 4. Testing Brand Assets, Favicons & Manifest ---");
    const assets = [
        { path: "/favicon.ico?v=2", desc: "Official Brand Favicon (.ico)" },
        { path: "/apple-touch-icon.png?v=2", desc: "Apple Touch Icon" },
        { path: "/manifest.webmanifest", desc: "Web Manifest" },
        { path: "/robots.txt", desc: "robots.txt" },
        { path: "/sitemap.xml", desc: "sitemap.xml" }
    ];

    for (const a of assets) {
        try {
            const res = await fetch(`${PROD_URL}${a.path}`);
            assert(res.status === 200, `${a.desc} returns 200 OK`);
        } catch (e) {
            assert(false, a.desc, e.message);
        }
    }

    console.log("\n================================================================================");
    console.log(`TOTAL LIVE TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) process.exit(1);
}

verifyLive().catch(e => {
    console.error(e);
    process.exit(1);
});
