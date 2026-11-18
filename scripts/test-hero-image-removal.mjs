const BASE_URL = 'http://localhost:3000';

async function verifyHeroImageRemoval() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - PODCAST HERO IMAGE REMOVAL VERIFICATION               ");
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

    // 1. Fetch Podcast Production Service Page
    console.log("--- 1. Testing Podcast Production in Kolkata Page ---");
    const podcastRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
    assert(podcastRes.status === 200, "Podcast service page returns 200 OK");
    const podcastHtml = await podcastRes.text();

    // 2. Verify Microphone Studio Background Image Completely Removed
    console.log("\n--- 2. Verifying Microphone Background Image Completely Removed ---");
    assert(!podcastHtml.includes("1478737270239"), "Microphone image URL (1478737270239) is NOT in podcast page HTML");
    assert(!podcastHtml.includes("aspect-[21/9]"), "Hero image container (aspect-[21/9]) is NOT rendered on podcast page");
    assert(!podcastHtml.includes("bg-gradient-to-t from-black via-transparent to-transparent"), "Hero image dark overlay is completely removed from podcast page");

    // 3. Verify Page Text, Headings and Spacing Intact
    console.log("\n--- 3. Verifying Page Text, Headings & Design Intact ---");
    assert(podcastHtml.includes("Podcast Production in Kolkata"), "Page H1 'Podcast Production in Kolkata' intact");
    assert(podcastHtml.includes("Digital Media"), "Subtitle 'Digital Media' badge intact");
    assert(podcastHtml.includes("Home") && podcastHtml.includes("Services"), "Breadcrumbs navigation intact");
    assert(podcastHtml.includes("High-quality multi-camera podcast setups with professional sound engineering"), "Page description text intact");

    // 4. Verify Podcast Video Showcase Section Intact
    console.log("\n--- 4. Verifying Podcast Video Gallery Intact ---");
    assert(podcastHtml.includes("Our Podcast Productions"), "Section heading 'Our Podcast Productions' intact");
    assert(podcastHtml.includes("Explore our podcast productions, conversations and creative video projects."), "Supporting text intact");
    assert(podcastHtml.includes("yleEJrCNEf0"), "Video [yleEJrCNEf0] present");
    assert(podcastHtml.includes("vTQLIoqQPGU"), "Video [vTQLIoqQPGU] present");
    assert(podcastHtml.includes("TU6KUw_55ic"), "Video [TU6KUw_55ic] present");
    assert(podcastHtml.includes("f2_paHV562A"), "Video [f2_paHV562A] present");

    // 5. Verify Other Service Pages Retain Their Hero Images
    console.log("\n--- 5. Verifying Other Service Pages Unchanged ---");
    const brandRes = await fetch(`${BASE_URL}/services/brand-promotion-kolkata/`);
    assert(brandRes.status === 200, "Brand Promotion service page returns 200 OK");
    const brandHtml = await brandRes.text();
    assert(brandHtml.includes("aspect-[21/9]"), "Dynamic service pages retain hero image container (aspect-[21/9])");
    assert(brandHtml.includes("1542744094"), "Dynamic service pages retain their specific hero image");

    const corpRes = await fetch(`${BASE_URL}/services/corporate-photography-kolkata/`);
    assert(corpRes.status === 200, "Corporate Photography page returns 200 OK");

    const weddingRes = await fetch(`${BASE_URL}/services/wedding-photography-kolkata/`);
    assert(weddingRes.status === 200, "Wedding Photography page returns 200 OK");

    // 6. Verify Homepage Banner Unchanged
    console.log("\n--- 6. Verifying Homepage Banner Unchanged ---");
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Homepage returns 200 OK");

    console.log("\n================================================================================");
    console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) process.exit(1);
}

verifyHeroImageRemoval().catch(e => {
    console.error(e);
    process.exit(1);
});
