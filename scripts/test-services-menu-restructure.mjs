import mongoose from 'mongoose';

const LOCALHOST_BASE = "http://localhost:3000";

async function runTests() {
    console.log("==================================================================");
    console.log("       DREAMLINE PRODUCTION - SERVICES MENU RESTRUCTURING TEST    ");
    console.log("==================================================================\n");

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    let passed = 0;
    let failed = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log(`  [PASS] ${msg}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${msg}`);
            failed++;
        }
    }

    // TEST 1: Check root SERVICES item in DB
    console.log("\n--- TEST 1: Root SERVICES Navigation Item in DB ---");
    const servicesRoot = await db.collection('navigationitems').findOne({ title: "SERVICES", parentId: null });
    assert(servicesRoot !== null, "Root SERVICES item exists in navigationitems");
    assert(servicesRoot?.isDropdown === true, "Root SERVICES item is marked as isDropdown");
    assert(servicesRoot?.isActive === true, "Root SERVICES item is active");

    // TEST 2: Check 5 categories under SERVICES
    console.log("\n--- TEST 2: Five Main Categories under SERVICES ---");
    const servicesChildren = await db.collection('navigationitems')
        .find({ parentId: servicesRoot._id })
        .sort({ order: 1 })
        .toArray();

    const distinctGroups = [...new Set(servicesChildren.map(c => c.group))];
    console.log("  Detected Groups in DB:", distinctGroups);
    assert(distinctGroups.length === 5, `Exactly 5 distinct category groups present (Found: ${distinctGroups.length})`);
    
    const EXPECTED_GROUPS = ["WEDDING", "CORPORATE", "SOCIAL", "TECH", "EVENT MANAGEMENT"];
    EXPECTED_GROUPS.forEach(grp => {
        assert(distinctGroups.includes(grp), `Category "${grp}" is present`);
    });

    // Check no other groups exist
    const unauthorizedGroups = distinctGroups.filter(g => !EXPECTED_GROUPS.includes(g));
    assert(unauthorizedGroups.length === 0, `No unauthorized categories outside the 5 main categories (Found: ${unauthorizedGroups.join(', ') || 'None'})`);

    // TEST 3: WEDDING Category Verification
    console.log("\n--- TEST 3: WEDDING Category & Subcategories ---");
    const weddingItems = servicesChildren.filter(c => c.group === "WEDDING");
    assert(weddingItems.length === 3, `WEDDING has exactly 3 subcategories (Found: ${weddingItems.length})`);
    const weddingTitles = weddingItems.map(i => i.title);
    assert(weddingTitles[0] === "Pre Wedding", `WEDDING item 1 is "Pre Wedding" (Found: "${weddingTitles[0]}")`);
    assert(weddingTitles[1] === "Wedding", `WEDDING item 2 is "Wedding" (Found: "${weddingTitles[1]}")`);
    assert(weddingTitles[2] === "Post Wedding", `WEDDING item 3 is "Post Wedding" (Found: "${weddingTitles[2]}")`);

    // TEST 4: CORPORATE Category & Exact 12 Services in Exact Order
    console.log("\n--- TEST 4: CORPORATE Category & Exact Order of 12 Services ---");
    const corporateItems = servicesChildren.filter(c => c.group === "CORPORATE");
    assert(corporateItems.length === 12, `CORPORATE has exactly 12 services (Found: ${corporateItems.length})`);

    const EXPECTED_CORPORATE_ORDER = [
        "Commercial Ad",
        "Brand Promotion",
        "Corporate Film",
        "Short Film",
        "Drone Photography",
        "Drone Videography",
        "3D Area and Mapping",
        "3D Visualization",
        "Live Stream & Broadcast",
        "Fashion Photography",
        "Podcast",
        "Documentary Film"
    ];

    EXPECTED_CORPORATE_ORDER.forEach((expectedTitle, idx) => {
        const actualItem = corporateItems[idx];
        assert(
            actualItem?.title === expectedTitle,
            `Corporate #${idx + 1} is "${expectedTitle}" (Actual: "${actualItem?.title}")`
        );
    });

    // TEST 5: Drone & Aerial Exact Reference Section Verification
    console.log("\n--- TEST 5: Drone & Aerial Exact Reference Section ---");
    const dronePhoto = corporateItems.find(i => i.title === "Drone Photography");
    assert(dronePhoto !== undefined, 'Drone Photography is inside Corporate');
    assert(
        dronePhoto?.url === "/services/drone-photography-kolkata/",
        `Drone Photography preserves exact slug "/services/drone-photography-kolkata/" (Actual: "${dronePhoto?.url}")`
    );
    assert(
        dronePhoto?.badge === "CERTIFIED",
        `Drone Photography has badge "CERTIFIED" (Actual: "${dronePhoto?.badge}")`
    );
    assert(
        dronePhoto?.subGroup === "DRONE & AERIAL",
        `Drone Photography belongs to subGroup "DRONE & AERIAL"`
    );
    assert(
        dronePhoto?.icon === "🛸",
        `Drone Photography has icon "🛸"`
    );

    const droneVideo = corporateItems.find(i => i.title === "Drone Videography");
    assert(droneVideo !== undefined, 'Drone Videography is inside Corporate');
    assert(
        droneVideo?.url === "/services/drone-videography-kolkata/",
        `Drone Videography has separate slug "/services/drone-videography-kolkata/" (Actual: "${droneVideo?.url}")`
    );
    assert(
        droneVideo?.badge === "POPULAR",
        `Drone Videography has badge "POPULAR" (Actual: "${droneVideo?.badge}")`
    );
    assert(
        droneVideo?.subGroup === "DRONE & AERIAL",
        `Drone Videography belongs to subGroup "DRONE & AERIAL"`
    );

    const areaMapping = corporateItems.find(i => i.title === "3D Area and Mapping");
    assert(areaMapping !== undefined, '3D Area and Mapping is inside Corporate');
    assert(
        areaMapping?.url === "/services/3d-area-mapping-kolkata/",
        `3D Area and Mapping points to "/services/3d-area-mapping-kolkata/" (Actual: "${areaMapping?.url}")`
    );
    assert(
        areaMapping?.subGroup === "DRONE & AERIAL",
        `3D Area and Mapping belongs to subGroup "DRONE & AERIAL"`
    );

    // TEST 6: Fashion Photography, Podcast, Documentary Film inside Corporate
    console.log("\n--- TEST 6: Fashion, Podcast, Documentary inside Corporate ---");
    const fashion = corporateItems.find(i => i.title === "Fashion Photography");
    assert(fashion !== undefined && fashion.group === "CORPORATE", 'Fashion Photography is INSIDE Corporate');

    const podcast = corporateItems.find(i => i.title === "Podcast");
    assert(podcast !== undefined && podcast.group === "CORPORATE", 'Podcast is INSIDE Corporate');
    assert(podcast?.url === "/services/podcast-production-kolkata/", 'Podcast points to /services/podcast-production-kolkata/');

    const docFilm = corporateItems.find(i => i.title === "Documentary Film");
    assert(docFilm !== undefined && docFilm.group === "CORPORATE", 'Documentary Film is INSIDE Corporate');
    assert(docFilm?.url === "/services/documentary-film-production-kolkata/", 'Documentary Film points to /services/documentary-film-production-kolkata/');

    // Check that none of these 3 appear outside Corporate
    const nonCorpServices = servicesChildren.filter(c => c.group !== "CORPORATE");
    const leaks = nonCorpServices.filter(c => ["Fashion Photography", "Podcast", "Documentary Film"].includes(c.title));
    assert(leaks.length === 0, `No leaks of Fashion, Podcast or Documentary outside Corporate (Leaks: ${leaks.length})`);

    // TEST 7: SOCIAL Category
    console.log("\n--- TEST 7: SOCIAL Category Verification ---");
    const socialItems = servicesChildren.filter(c => c.group === "SOCIAL");
    assert(socialItems.length === 3, `SOCIAL has exactly 3 items (Found: ${socialItems.length})`);
    const socialTitles = socialItems.map(i => i.title);
    assert(socialTitles.includes("Birthday Photography"), 'Birthday Photography is in SOCIAL');
    assert(socialTitles.includes("Rice Ceremony"), 'Rice Ceremony is in SOCIAL');
    assert(socialTitles.includes("Other Social Events"), 'Other Social Events is in SOCIAL');

    // TEST 8: TECH Category
    console.log("\n--- TEST 8: TECH Category Verification ---");
    const techItems = servicesChildren.filter(c => c.group === "TECH");
    assert(techItems.length === 1, `TECH has exactly 1 item (Found: ${techItems.length})`);
    assert(techItems[0]?.title === "Website", `TECH item is "Website" (Actual: "${techItems[0]?.title}")`);
    assert(techItems[0]?.url === "/tech", `Website points to "/tech" (Actual: "${techItems[0]?.url}")`);

    // TEST 9: EVENT MANAGEMENT Category
    console.log("\n--- TEST 9: EVENT MANAGEMENT Category Verification ---");
    const eventItems = servicesChildren.filter(c => c.group === "EVENT MANAGEMENT");
    assert(eventItems.length === 1, `EVENT MANAGEMENT has exactly 1 placeholder item`);
    assert(
        eventItems[0]?.badge === "COMING SOON",
        `EVENT MANAGEMENT displays COMING SOON badge (Actual: "${eventItems[0]?.badge}")`
    );
    assert(eventItems[0]?.url === "#", `EVENT MANAGEMENT has safe non-fake URL "#"`);

    // TEST 10: Podcast Videos Preservation (11 videos)
    console.log("\n--- TEST 10: Podcast Videos & Backend Preservation ---");
    const podcastVideos = await db.collection('podcastvideos').find({}).toArray();
    assert(podcastVideos.length >= 11, `Database has ${podcastVideos.length} podcast videos (>= 11 required)`);

    const podcastServicePage = await db.collection('servicepages').findOne({ slug: "podcast-production-kolkata" });
    assert(podcastServicePage !== null, "podcast-production-kolkata ServicePage exists in DB");

    // TEST 11: HTTP Health & Live Page Statuses on Localhost
    console.log("\n--- TEST 11: HTTP Status Checks on Localhost ---");
    const URLS_TO_TEST = [
        { name: "Homepage", url: `${LOCALHOST_BASE}/` },
        { name: "Services Index", url: `${LOCALHOST_BASE}/services/` },
        { name: "Drone & Aerial (Preserved)", url: `${LOCALHOST_BASE}/services/drone-photography-kolkata/` },
        { name: "Drone Videography", url: `${LOCALHOST_BASE}/services/drone-videography-kolkata/` },
        { name: "Podcast Production", url: `${LOCALHOST_BASE}/services/podcast-production-kolkata/` },
        { name: "Documentary Films", url: `${LOCALHOST_BASE}/services/documentary-film-production-kolkata/` },
        { name: "Wedding Photography", url: `${LOCALHOST_BASE}/services/wedding-photography-kolkata/` },
        { name: "Pre Wedding Shoot", url: `${LOCALHOST_BASE}/services/pre-wedding-shoot-kolkata/` },
        { name: "Post Wedding", url: `${LOCALHOST_BASE}/services/post-wedding-photography-kolkata/` },
        { name: "Commercial Ad Films", url: `${LOCALHOST_BASE}/services/commercial-ad-films-kolkata/` },
        { name: "Brand Promotion", url: `${LOCALHOST_BASE}/services/brand-promotion-kolkata/` },
        { name: "Corporate Photography", url: `${LOCALHOST_BASE}/services/corporate-photography-kolkata/` },
        { name: "Short Film", url: `${LOCALHOST_BASE}/services/short-film-production-kolkata/` },
        { name: "3D Area Mapping", url: `${LOCALHOST_BASE}/services/3d-area-mapping-kolkata/` },
        { name: "3D Visualization", url: `${LOCALHOST_BASE}/services/3d-visualization-kolkata/` },
        { name: "Live Stream Broadcast", url: `${LOCALHOST_BASE}/services/live-stream-broadcast-kolkata/` },
        { name: "Fashion Photography", url: `${LOCALHOST_BASE}/services/fashion-photography-kolkata/` },
        { name: "Birthday Photography", url: `${LOCALHOST_BASE}/services/birthday-photography-kolkata/` },
        { name: "Rice Ceremony", url: `${LOCALHOST_BASE}/services/rice-ceremony-photography-kolkata/` },
        { name: "Other Social Events", url: `${LOCALHOST_BASE}/services/other-social-events-kolkata/` },
        { name: "Tech / Website", url: `${LOCALHOST_BASE}/tech` },
        { name: "Admin Navigation", url: `${LOCALHOST_BASE}/admin/navigation` },
        { name: "Admin Services", url: `${LOCALHOST_BASE}/admin/services` },
        { name: "Admin Podcasts", url: `${LOCALHOST_BASE}/admin/podcasts` }
    ];

    for (const target of URLS_TO_TEST) {
        try {
            const res = await fetch(target.url, { headers: { "User-Agent": "TestRunner/1.0" } });
            assert(
                res.status >= 200 && res.status < 400,
                `${target.name} (${target.url}) returned HTTP ${res.status}`
            );
        } catch (err) {
            assert(false, `${target.name} failed with network error: ${err.message}`);
        }
    }

    console.log("\n==================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==================================================================\n");

    await mongoose.disconnect();
    if (failed > 0) process.exit(1);
}

runTests().catch(err => {
    console.error("Test runner failed:", err);
    process.exit(1);
});
