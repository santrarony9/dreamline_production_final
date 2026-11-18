async function verifyProduction() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - LIVE PRODUCTION DEPLOYMENT VERIFICATION              ");
    console.log("================================================================================\n");

    const PROD_URL = "https://dreamlineproduction.com";
    const routes = [
        { path: "/", desc: "Homepage" },
        { path: "/about/", desc: "About Us Page" },
        { path: "/services/", desc: "Services Overview Page" },
        { path: "/services/wedding-photography-kolkata/", desc: "Wedding Photography Kolkata Service" },
        { path: "/services/corporate-photography-kolkata/", desc: "Corporate Photography Kolkata Service" },
        { path: "/services/drone-videography-kolkata/", desc: "Drone Videography Kolkata Service" },
        { path: "/portfolio/", desc: "Portfolio Hub" },
        { path: "/blogs/", desc: "Blogs & Journals Archive" },
        { path: "/contact/", desc: "Contact Page" },
        { path: "/robots.txt", desc: "SEO robots.txt" },
        { path: "/sitemap.xml", desc: "SEO sitemap.xml" },
        { path: "/manifest.webmanifest", desc: "Web App Manifest" },
        { path: "/favicon.ico?v=2", desc: "Official Brand Favicon (.ico)" },
        { path: "/favicon-32x32.png?v=2", desc: "Official Brand Favicon (32x32)" },
        { path: "/favicon-16x16.png?v=2", desc: "Official Brand Favicon (16x16)" },
        { path: "/apple-touch-icon.png?v=2", desc: "Apple Touch Icon" },
        { path: "/favicon.svg?v=2", desc: "Official SVG Logo Favicon" },
        { path: "/uploads/1790077406495-7.webp", desc: "BookMyShow Partner Logo" },
        { path: "/uploads/1790077395219-8.webp", desc: "Carlsberg Partner Logo" },
        { path: "/uploads/1790077355259-6.webp", desc: "Conneqt Partner Logo" }
    ];

    let passed = 0;
    let failed = 0;

    for (const r of routes) {
        const url = `${PROD_URL}${r.path}`;
        try {
            const res = await fetch(url, { redirect: "follow" });
            const status = res.status;
            const cType = res.headers.get("content-type") || "";
            const buf = await res.arrayBuffer();

            if (status === 200 && buf.byteLength > 0) {
                console.log(`  [PASS] ${r.desc.padEnd(45)} -> HTTP 200 OK | Content-Type: ${cType.split(';')[0]} | Size: ${buf.byteLength} bytes`);
                passed++;
            } else {
                console.error(`  [FAIL] ${r.desc.padEnd(45)} -> HTTP ${status} | Content-Type: ${cType}`);
                failed++;
            }
        } catch (err) {
            console.error(`  [ERROR] ${r.desc.padEnd(45)} -> ${err.message}`);
            failed++;
        }
    }

    // Inspect live HTML for navigation items and brand logos
    console.log("\n[Production HTML Inspection] Verifying critical elements on live homepage...");
    try {
        const homeRes = await fetch(PROD_URL);
        const html = await homeRes.text();

        const checks = [
            { name: "Brand Favicon v2 in <head>", test: html.includes("/favicon.ico?v=2") },
            { name: "Brand Favicon 32x32 in <head>", test: html.includes("/favicon-32x32.png?v=2") },
            { name: "Top HQ Address Bar", test: html.includes("Tilottama Plaza") },
            { name: "Trusted By Industry Leaders Section", test: html.includes("Trusted By Industry Leaders") },
            { name: "BookMyShow Alt Text", test: html.includes("BOOK MY SHOW brand client logo") },
            { name: "Carlsberg Alt Text", test: html.includes("CARLSBERG brand client logo") },
            { name: "Conneqt Alt Text", test: html.includes("CONNEQT brand client logo") },
            { name: "Navigation Menu: HOME", test: html.includes("HOME") || html.includes("Home") },
            { name: "Navigation Menu: SERVICES", test: html.includes("SERVICES") || html.includes("Services") },
            { name: "Navigation Menu: PORTFOLIO", test: html.includes("PORTFOLIO") || html.includes("Portfolio") },
            { name: "Navigation Menu: BLOGS", test: html.includes("BLOGS") || html.includes("Blogs") },
            { name: "Navigation Menu: CONTACT US", test: html.includes("CONTACT US") || html.includes("Contact Us") }
        ];

        checks.forEach(c => {
            console.log(`  ${c.name.padEnd(45)}: ${c.test ? '[VERIFIED]' : '[NOT FOUND]'}`);
            if (c.test) passed++; else failed++;
        });
    } catch (err) {
        console.error("  [ERROR] Failed to fetch live homepage HTML:", err.message);
        failed++;
    }

    console.log("\n================================================================================");
    console.log(`   PRODUCTION VERIFICATION: ${passed} PASSED | ${failed} FAILED`);
    console.log("================================================================================");

    if (failed > 0) process.exit(1);
}

verifyProduction();
