async function testPartnerLogos() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - PARTNER & CLIENT LOGO VERIFICATION SUITE           ");
    console.log("================================================================================\n");

    const BASE_URL = "http://localhost:3000";

    // 1. Fetch homepage and check Partners section
    console.log("[Homepage Check] Checking homepage Partners section...");
    const homeRes = await fetch(BASE_URL);
    if (!homeRes.ok) {
        console.error(`Failed to fetch homepage: HTTP ${homeRes.status}`);
        process.exit(1);
    }
    const homeHtml = await homeRes.text();
    const hasHeader = homeHtml.includes("Trusted By Industry Leaders");
    console.log(`  Section header 'Trusted By Industry Leaders' present: ${hasHeader ? 'YES' : 'NO'}`);

    // Check brand names in HTML
    const brandsToCheck = ["BOOK MY SHOW", "CARLSBERG", "CONNEQT", "TATA TRUST", "aljazeera", "ABP NETWORK", "l  & t"];
    for (const b of brandsToCheck) {
        const found = homeHtml.includes(b);
        console.log(`  Brand '${b}' in HTML: ${found ? 'FOUND' : 'MISSING'}`);
    }

    // 2. Test local static files in /uploads/
    console.log("\n[Local Asset Check] Checking static assets in /uploads/ on localhost...");
    const localFiles = [
        "1790077406495-7.webp", // BookMyShow
        "1790077395219-8.webp", // Carlsberg
        "1790077355259-6.webp", // Conneqt
        "1790076897320-2.webp", // Tata Trust
        "1790077460780-3.webp", // Chandra Udyog
        "1790863603917-Untitled_design__16_.jpg", // Al Jazeera
        "1790863595400-Untitled_design__15_.jpg", // ABP Network
        "1790863240896-Untitled_design__14_.jpg", // L&T
        "1790863248954-Untitled_design__13_.jpg", // TV Today
        "1790863272355-Untitled_design__11_.jpg"  // Insta Image
    ];

    let passed = 0;
    let failed = 0;

    for (const f of localFiles) {
        const url = `${BASE_URL}/uploads/${f}`;
        try {
            const res = await fetch(url);
            const cType = res.headers.get("content-type");
            const buf = await res.arrayBuffer();
            if (res.status === 200 && buf.byteLength > 1000 && (cType.includes("image") || cType.includes("webp") || cType.includes("jpeg"))) {
                console.log(`  [PASS] /uploads/${f.padEnd(45)} -> HTTP 200 OK | Content-Type: ${cType} | Size: ${buf.byteLength} bytes`);
                passed++;
            } else {
                console.error(`  [FAIL] /uploads/${f.padEnd(45)} -> HTTP ${res.status} | Content-Type: ${cType} | Size: ${buf.byteLength}`);
                failed++;
            }
        } catch (err) {
            console.error(`  [ERROR] /uploads/${f.padEnd(45)} -> ${err.message}`);
            failed++;
        }
    }

    // 3. Test Next.js Image Optimization on all local assets
    console.log("\n[Next.js Image Optimizer] Testing _next/image optimization endpoint...");
    for (const f of localFiles) {
        const imgPath = `/uploads/${f}`;
        const optUrl = `${BASE_URL}/_next/image?url=${encodeURIComponent(imgPath)}&w=256&q=75`;
        try {
            const res = await fetch(optUrl);
            const cType = res.headers.get("content-type");
            const buf = await res.arrayBuffer();
            if (res.status === 200 && buf.byteLength > 0 && cType.includes("image")) {
                console.log(`  [PASS] _next/image for ${f.padEnd(40)} -> HTTP 200 OK | ${cType} | ${buf.byteLength} bytes`);
                passed++;
            } else {
                const errText = await res.text().catch(() => "");
                console.error(`  [FAIL] _next/image for ${f.padEnd(40)} -> HTTP ${res.status} | ${errText}`);
                failed++;
            }
        } catch (err) {
            console.error(`  [ERROR] _next/image for ${f.padEnd(40)} -> ${err.message}`);
            failed++;
        }
    }

    console.log("\n================================================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("================================================================================");

    if (failed > 0) process.exit(1);
}

testPartnerLogos();
