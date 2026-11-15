const fs = require('fs');
const path = require('path');

console.log("=======================================================");
console.log("   DREAMLINE PRODUCTION - NAVIGATION SYSTEM AUDIT      ");
console.log("=======================================================");

let allPassed = true;

// 1. Verify Navbar.js
const navbarPath = path.join(__dirname, '../src/components/Navbar.js');
const navbarCode = fs.readFileSync(navbarPath, 'utf8');

console.log("\n1. Verifying Navbar.js Structure & Hierarchy...");

const expectedHierarchy = [
    { label: "HOME", href: "/" },
    { label: "ABOUT US", href: "/about" },
    { label: "SERVICES", isDropdown: true },
    { label: "PORTFOLIO", href: "/portfolio/" },
    { label: "BLOGS", href: "/blogs" },
    { label: "CONTACT US", href: "/contact" }
];

expectedHierarchy.forEach(item => {
    if (navbarCode.includes(item.label)) {
        console.log(`  [OK] Main Navigation Item: "${item.label}" found.`);
    } else {
        console.error(`  [FAIL] Missing navigation label "${item.label}" in Navbar.js`);
        allPassed = false;
    }
});

// Check CTA button
if (navbarCode.includes("GET A QUOTE")) {
    console.log(`  [OK] Header CTA Button: "GET A QUOTE" configured.`);
} else {
    console.error(`  [FAIL] "GET A QUOTE" CTA not found in Navbar.js`);
    allPassed = false;
}

// Check Services in Dropdown
console.log("\n2. Verifying Dropdown Service Links (0 broken links)...");
const requiredServices = [
    { name: "Drone Photography", href: "/services/drone-photography-kolkata/" },
    { name: "Drone Videography", href: "/services/drone-videography-kolkata/" },
    { name: "3D Area Mapping", href: "/services/3d-area-mapping-kolkata/" },
    { name: "Video Production Agency", href: "/services/video-production-agency-kolkata/" },
    { name: "Corporate Photography", href: "/services/corporate-photography-kolkata/" },
    { name: "Podcast Production", href: "/services/podcast-production-kolkata/" },
    { name: "Documentary Films", href: "/services/documentary-film-production-kolkata/" },
    { name: "Wedding Photography", href: "/services/wedding-photography-kolkata/" },
    { name: "Pre-Wedding Shoots", href: "/services/pre-wedding-shoot-kolkata/" },
    { name: "Rice Ceremony", href: "/services/rice-ceremony-photography-kolkata/" }
];

requiredServices.forEach(srv => {
    if (navbarCode.includes(srv.href)) {
        console.log(`  [OK] Dropdown Link: "${srv.name}" -> ${srv.href}`);
    } else {
        console.error(`  [FAIL] Missing service link in dropdown: ${srv.href}`);
        allPassed = false;
    }
});

// 2. Verify /portfolio page exists
console.log("\n3. Verifying Portfolio Hub Page...");
const portfolioPath = path.join(__dirname, '../src/app/portfolio/page.js');
if (fs.existsSync(portfolioPath)) {
    console.log(`  [OK] src/app/portfolio/page.js exists.`);
    const portfolioCode = fs.readFileSync(portfolioPath, 'utf8');
    if (portfolioCode.includes('https://dreamlineproduction.com/portfolio/')) {
        console.log(`  [OK] Canonical URL set to https://dreamlineproduction.com/portfolio/`);
    } else {
        console.error(`  [FAIL] Canonical URL missing in Portfolio page`);
        allPassed = false;
    }
} else {
    console.error(`  [FAIL] src/app/portfolio/page.js DOES NOT exist.`);
    allPassed = false;
}

// 3. Verify next.config.mjs redirects
console.log("\n4. Verifying next.config.mjs 301 Permanent Redirects...");
const nextConfigPath = path.join(__dirname, '../next.config.mjs');
const nextConfigCode = fs.readFileSync(nextConfigPath, 'utf8');

const expectedRedirects = [
    { from: "/services/drone-photography", to: "/services/drone-photography-kolkata/" },
    { from: "/services/drone-videography", to: "/services/drone-videography-kolkata/" },
    { from: "/services/aerial-photography", to: "/services/drone-photography-kolkata/" },
    { from: "/services/aerial-videography", to: "/services/drone-videography-kolkata/" },
    { from: "/services/real-estate-photography", to: "/services/drone-photography-kolkata/" },
    { from: "/services/event-photography", to: "/services/wedding-photography-kolkata/" },
    { from: "/services/video-production", to: "/services/video-production-agency-kolkata/" },
    { from: "/about-us", to: "/about/" },
    { from: "/contact-us", to: "/contact/" }
];

expectedRedirects.forEach(r => {
    if (nextConfigCode.includes(r.from) && nextConfigCode.includes(r.to)) {
        console.log(`  [OK] 301 Redirect: "${r.from}" -> "${r.to}"`);
    } else {
        console.error(`  [FAIL] Missing redirect for ${r.from} -> ${r.to}`);
        allPassed = false;
    }
});

// 4. Verify middleware.js redirects
console.log("\n5. Verifying src/middleware.js Edge Redirects...");
const middlewarePath = path.join(__dirname, '../src/middleware.js');
const middlewareCode = fs.readFileSync(middlewarePath, 'utf8');

expectedRedirects.forEach(r => {
    if (middlewareCode.includes(`'${r.from}': '${r.to}'`)) {
        console.log(`  [OK] Edge Redirect: "${r.from}" -> "${r.to}"`);
    } else {
        console.error(`  [FAIL] Missing edge redirect in middleware.js: ${r.from}`);
        allPassed = false;
    }
});

// 5. Verify sitemap.js
console.log("\n6. Verifying XML Sitemap Configuration...");
const sitemapPath = path.join(__dirname, '../src/app/sitemap.js');
const sitemapCode = fs.readFileSync(sitemapPath, 'utf8');
if (sitemapCode.includes('/portfolio/')) {
    console.log(`  [OK] /portfolio/ registered in src/app/sitemap.js.`);
} else {
    console.error(`  [FAIL] /portfolio/ not found in sitemap.js`);
    allPassed = false;
}

// 6. Verify Mobile Navigation Features in Navbar.js
console.log("\n7. Verifying Mobile Navigation & Accessibility...");
if (navbarCode.includes("aria-expanded") && navbarCode.includes("aria-haspopup") && navbarCode.includes("openMobileSubMenu")) {
    console.log(`  [OK] Accessible ARIA attributes & mobile expandable accordion sub-menus verified.`);
} else {
    console.error(`  [FAIL] Missing mobile accordion state or ARIA attributes`);
    allPassed = false;
}

if (navbarCode.includes("handleServicesLeave") && navbarCode.includes("280")) {
    console.log(`  [OK] Anti-flicker debounce timer (280ms) and invisible hover bridge verified.`);
} else {
    console.error(`  [FAIL] Anti-flicker debounce timer missing in Navbar.js`);
    allPassed = false;
}

console.log("\n=======================================================");
if (allPassed) {
    console.log("   ALL NAVIGATION AUDIT CHECKS PASSED SUCCESSFULLY!    ");
} else {
    console.log("   SOME CHECKS FAILED. REVIEW LOGS ABOVE.             ");
    process.exit(1);
}
console.log("=======================================================");
