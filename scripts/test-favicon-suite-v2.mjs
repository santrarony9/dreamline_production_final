async function testFaviconSuite() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - FAVICON ENDPOINT & RENDERING TEST SUITE             ");
    console.log("================================================================================\n");

    const BASE_URL = "http://localhost:3000";
    const endpoints = [
        { path: "/favicon.ico", contentType: "image/x-icon" },
        { path: "/favicon.ico?v=2", contentType: "image/x-icon" },
        { path: "/favicon-16x16.png", contentType: "image/png" },
        { path: "/favicon-16x16.png?v=2", contentType: "image/png" },
        { path: "/favicon-32x32.png", contentType: "image/png" },
        { path: "/favicon-32x32.png?v=2", contentType: "image/png" },
        { path: "/favicon-48x48.png", contentType: "image/png" },
        { path: "/favicon-48x48.png?v=2", contentType: "image/png" },
        { path: "/favicon.png", contentType: "image/png" },
        { path: "/favicon.png?v=2", contentType: "image/png" },
        { path: "/favicon.svg", contentType: "image/svg+xml" },
        { path: "/favicon.svg?v=2", contentType: "image/svg+xml" },
        { path: "/apple-touch-icon.png", contentType: "image/png" },
        { path: "/apple-touch-icon.png?v=2", contentType: "image/png" },
        { path: "/apple-touch-icon-precomposed.png", contentType: "image/png" },
        { path: "/apple-icon.png", contentType: "image/png" },
        { path: "/site.webmanifest", contentType: "application/manifest+json" },
        { path: "/manifest.webmanifest", contentType: "application/manifest+json" }
    ];

    let passed = 0;
    let failed = 0;

    for (const ep of endpoints) {
        const url = `${BASE_URL}${ep.path}`;
        try {
            const res = await fetch(url);
            const status = res.status;
            const cType = res.headers.get("content-type") || "";
            const contentLength = res.headers.get("content-length") || (await res.arrayBuffer()).byteLength;

            if (status === 200 && contentLength > 0) {
                console.log(`  [PASS] ${ep.path.padEnd(35)} -> HTTP 200 OK | Content-Type: ${cType} | Size: ${contentLength} bytes`);
                passed++;
            } else {
                console.error(`  [FAIL] ${ep.path.padEnd(35)} -> HTTP ${status} | Content-Type: ${cType} | Size: ${contentLength}`);
                failed++;
            }
        } catch (err) {
            console.error(`  [ERROR] ${ep.path.padEnd(35)} -> Network/Fetch error: ${err.message}`);
            failed++;
        }
    }

    // Inspect rendered HTML link tags
    console.log("\n[HTML Inspection] Checking <head> link tags on homepage...");
    try {
        const homeRes = await fetch(BASE_URL);
        const html = await homeRes.text();
        const iconTags = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi) || [];

        console.log(`  Found ${iconTags.length} icon link tags:`);
        iconTags.forEach(tag => console.log(`    ${tag}`));

        const hasV2 = iconTags.every(tag => tag.includes("?v=2"));
        if (hasV2 && iconTags.length >= 6) {
            console.log("\n  [PASS] All icon tags in rendered HTML include the ?v=2 cache buster parameter!");
            passed++;
        } else {
            console.warn("\n  [WARN] Some icon tags may not include ?v=2 or count is unexpected.");
        }
    } catch (err) {
        console.error("  [ERROR] Failed to fetch homepage HTML:", err.message);
        failed++;
    }

    console.log("\n================================================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("================================================================================");

    if (failed > 0) process.exit(1);
}

testFaviconSuite();
