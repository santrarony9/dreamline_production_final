const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log("================================================================================");
    console.log("       DREAMLINE PRODUCTION - PODCAST PRODUCTION SERVICE PAGE TESTS            ");
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

    // 1. Fetch Podcast Service Page
    console.log("--- 1. Testing Podcast Production in Kolkata Service Page (/services/podcast-production-kolkata/) ---");
    let podcastHtml = '';
    try {
        const res = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        assert(res.status === 200, "HTTP Status 200 OK");
        podcastHtml = await res.text();
    } catch (e) {
        assert(false, "Fetch Podcast Page", e.message);
        return;
    }

    // 2. Heading and Supporting Text Verification
    console.log("\n--- 2. Testing Heading & Supporting Text ---");
    assert(podcastHtml.includes("Our Podcast") && podcastHtml.includes("Productions"), "Section Heading 'Our Podcast Productions' is present");
    assert(podcastHtml.includes("Explore our podcast productions, conversations and creative video projects."), "Supporting text matches exactly");

    // 3. Verify all six videos are present
    console.log("\n--- 3. Testing All 6 YouTube Videos in Gallery ---");
    const requiredVideos = [
        { id: "rGCNP3nWC9Y", type: "Standard 16:9", title: "Banglar gan with versatile singer Pousali Banerjee", show: "Prompt With Paromita" },
        { id: "hRnCf_evOZs", type: "Shorts 9:16", title: "দীপান্বিতা অমাবস্যার নিয়ম", show: "Prompt With Paromita" },
        { id: "t4YqQvedLkE", type: "Standard 16:9", title: "দুর্গাপুজোর বোধন,বিসর্জন,সিঁদুর খেলা", show: "Kholapata ebong Arpita" },
        { id: "qtp9vJ0xzFY", type: "Shorts 9:16", title: "মাত্র ৪৮ মিনিট", show: "Kholapata ebong Arpita" },
        { id: "fLturgnZcMw", type: "Standard 16:9", title: "শান্তিপুরের ঐতিহ্য", show: "ANI In Search For Truth" },
        { id: "p-AOOftRg_E", type: "Shorts 9:16", title: "মারণ ক্রিয়া কি ?", show: "ANI In Search For Truth" }
    ];

    for (const v of requiredVideos) {
        const hasId = podcastHtml.includes(v.id);
        assert(hasId, `Video [${v.id}] (${v.type} - ${v.show}) is present in HTML`);
    }

    // 4. Verify YouTube thumbnails and embed URLs
    console.log("\n--- 4. Testing Thumbnail Sources & Embed Capability ---");
    assert(podcastHtml.includes("i.ytimg.com/vi/rGCNP3nWC9Y"), "Video 1 thumbnail present");
    assert(podcastHtml.includes("i.ytimg.com/vi/hRnCf_evOZs"), "Video 2 thumbnail present");
    assert(podcastHtml.includes("i.ytimg.com/vi/t4YqQvedLkE"), "Video 3 thumbnail present");
    assert(podcastHtml.includes("i.ytimg.com/vi/qtp9vJ0xzFY"), "Video 4 thumbnail present");
    assert(podcastHtml.includes("i.ytimg.com/vi/fLturgnZcMw"), "Video 5 thumbnail present");
    assert(podcastHtml.includes("i.ytimg.com/vi/p-AOOftRg_E"), "Video 6 thumbnail present");

    // 5. Verify aspect ratios and layout support
    console.log("\n--- 5. Testing Aspect Ratios & Responsive Grid Structure ---");
    assert(podcastHtml.includes("aspect-video"), "Standard 16:9 aspect ratio styling (aspect-video) present");
    assert(podcastHtml.includes("aspect-[9/16]") || podcastHtml.includes("9/16"), "Shorts 9:16 vertical aspect ratio styling present");
    assert(podcastHtml.includes("All Productions"), "Filter Tab 'All Productions' present");
    assert(podcastHtml.includes("Full Episodes"), "Filter Tab 'Full Episodes' present");
    assert(podcastHtml.includes("Podcast Shorts"), "Filter Tab 'Podcast Shorts' present");

    // 6. Verify Play buttons and click-to-play functionality
    console.log("\n--- 6. Testing Play Button & Embed Attributes ---");
    assert(podcastHtml.includes("Click to Play"), "Click to Play indicators present");
    assert(podcastHtml.includes("d=\"M8 5v14l11-7z\""), "SVG Play button icons present over thumbnails");

    // 7. Verify SEO, Metadata, and Accessibility
    console.log("\n--- 7. Testing SEO Metadata & Accessibility ---");
    assert(podcastHtml.includes("<title>Podcast Production in Kolkata"), "Page Title intact and correct");
    assert(podcastHtml.includes("canonical") && podcastHtml.includes("/services/podcast-production-kolkata/"), "Canonical URL intact");
    assert(podcastHtml.includes("\"@type\":\"Service\"") || podcastHtml.includes("&quot;@type&quot;:&quot;Service&quot;"), "Structured Data Service schema preserved");

    // 8. Legacy 301/308 URL Redirect test (/services/podcast/ -> /services/podcast-production-kolkata/)
    console.log("\n--- 8. Testing URL Preservation & Legacy Redirects ---");
    try {
        const redirectRes = await fetch(`${BASE_URL}/services/podcast/`, { redirect: 'manual' });
        const location = redirectRes.headers.get('location');
        assert(redirectRes.status === 301 || redirectRes.status === 308, `Redirect from /services/podcast/ status: ${redirectRes.status}`);
        assert(location && location.includes('/services/podcast-production-kolkata/'), `Redirect location points to /services/podcast-production-kolkata/: ${location}`);

        const followedRes = await fetch(`${BASE_URL}/services/podcast`, { redirect: 'follow' });
        assert(followedRes.status === 200 && followedRes.url.includes('/services/podcast-production-kolkata/'), `Follow redirect ends at ${followedRes.url}`);
    } catch (e) {
        assert(false, "Redirect test", e.message);
    }

    // 9. Verify other service pages remain untouched
    console.log("\n--- 9. Testing Other Service Pages Remain Unchanged & Healthy ---");
    const otherPages = [
        { url: `${BASE_URL}/services/`, name: "Services Hub" },
        { url: `${BASE_URL}/services/drone-photography-kolkata/`, name: "Drone Photography" },
        { url: `${BASE_URL}/services/drone-videography-kolkata/`, name: "Drone Videography" },
        { url: `${BASE_URL}/services/wedding-photography-kolkata/`, name: "Wedding Photography" },
        { url: `${BASE_URL}/services/corporate-photography-kolkata/`, name: "Corporate Photography" },
        { url: `${BASE_URL}/services/pre-wedding-shoot-kolkata/`, name: "Pre-Wedding Shoot" },
        { url: `${BASE_URL}/services/video-production-agency-kolkata/`, name: "Video Production Agency" },
        { url: `${BASE_URL}/services/rice-ceremony-photography-kolkata/`, name: "Rice Ceremony Photography" }
    ];

    for (const page of otherPages) {
        try {
            const res = await fetch(page.url);
            assert(res.status === 200, `${page.name} (${page.url}) returns 200 OK`);
        } catch (e) {
            assert(false, `${page.name}`, e.message);
        }
    }

    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
