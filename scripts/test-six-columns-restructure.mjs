import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI not found.');
    process.exit(1);
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  [PASS] ${message}`);
    } else {
        failedTests++;
        console.error(`  [FAIL] ${message}`);
    }
}

async function runTests() {
    console.log('==================================================================');
    console.log('    DREAMLINE PRODUCTION - 6-COLUMN SERVICES MEGA MENU TEST       ');
    console.log('==================================================================\n');

    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const navCol = db.collection('navigationitems');

    // 1. Root SERVICES Item
    console.log('--- TEST 1: Root SERVICES Navigation Item in DB ---');
    const root = await navCol.findOne({ title: 'SERVICES', parentId: null });
    assert(!!root, 'Root SERVICES item exists in navigationitems');
    assert(root?.isDropdown === true, 'Root SERVICES is marked as isDropdown');
    assert(root?.isActive === true, 'Root SERVICES is active');
    assert(!root?.badge || root?.badge === '', `Root SERVICES badge is removed (Actual: "${root?.badge || ''}")`);

    // 2. Fetch all child items
    const children = await navCol.find({ parentId: root._id }).sort({ order: 1 }).toArray();
    console.log(`\n--- TEST 2: Exactly 6 Independent Columns in DB ---`);
    assert(children.length === 20, `Total children count is 20 (Actual: ${children.length})`);

    const distinctGroups = [];
    children.forEach(c => {
        if (!distinctGroups.includes(c.group)) {
            distinctGroups.push(c.group);
        }
    });

    console.log('  Detected Independent Columns in Order:', distinctGroups);
    assert(distinctGroups.length === 6, `Exactly 6 distinct independent columns present (Found: ${distinctGroups.length})`);
    assert(distinctGroups[0] === 'WEDDING', `Column 1 is WEDDING (Actual: ${distinctGroups[0]})`);
    assert(distinctGroups[1] === 'CORPORATE', `Column 2 is CORPORATE (Actual: ${distinctGroups[1]})`);
    assert(distinctGroups[2] === 'DRONE & AERIAL', `Column 3 is DRONE & AERIAL (Actual: ${distinctGroups[2]})`);
    assert(distinctGroups[3] === 'SOCIAL', `Column 4 is SOCIAL (Actual: ${distinctGroups[3]})`);
    assert(distinctGroups[4] === 'TECH', `Column 5 is TECH (Actual: ${distinctGroups[4]})`);
    assert(distinctGroups[5] === 'EVENT MANAGEMENT', `Column 6 is EVENT MANAGEMENT (Actual: ${distinctGroups[5]})`);

    // 3. Column 1: WEDDING
    console.log('\n--- TEST 3: Column 1 - WEDDING Verification ---');
    const weddingItems = children.filter(c => c.group === 'WEDDING');
    assert(weddingItems.length === 3, `WEDDING has exactly 3 items (Found: ${weddingItems.length})`);
    assert(weddingItems[0].title === 'Pre Wedding', `Wedding #1 is "Pre Wedding" (Found: "${weddingItems[0].title}")`);
    assert(weddingItems[0].url === '/services/pre-wedding-shoot-kolkata/', `Pre Wedding points to /services/pre-wedding-shoot-kolkata/`);
    assert(weddingItems[1].title === 'Wedding', `Wedding #2 is "Wedding"`);
    assert(weddingItems[1].url === '/services/wedding-photography-kolkata/', `Wedding points to /services/wedding-photography-kolkata/`);
    assert(weddingItems[2].title === 'Post Wedding', `Wedding #3 is "Post Wedding"`);
    assert(weddingItems[2].url === '/services/post-wedding-photography-kolkata/', `Post Wedding points to /services/post-wedding-photography-kolkata/`);

    // 4. Column 2: CORPORATE (Commercial & Films - 9 items)
    console.log('\n--- TEST 4: Column 2 - CORPORATE (Commercial & Films - 9 items) ---');
    const corpItems = children.filter(c => c.group === 'CORPORATE');
    assert(corpItems.length === 9, `CORPORATE has exactly 9 items (Found: ${corpItems.length})`);

    const expectedCorp = [
        { title: 'Commercial Ad', url: '/services/commercial-ad-films-kolkata/' },
        { title: 'Brand Promotion', url: '/services/brand-promotion-kolkata/' },
        { title: 'Corporate Film', url: '/services/corporate-photography-kolkata/' },
        { title: 'Short Film', url: '/services/short-film-production-kolkata/' },
        { title: '3D Visualization', url: '/services/3d-visualization-kolkata/' },
        { title: 'Live Stream & Broadcast', url: '/services/live-stream-broadcast-kolkata/' },
        { title: 'Fashion Photography', url: '/services/fashion-photography-kolkata/' },
        { title: 'Podcast', url: '/services/podcast-production-kolkata/' },
        { title: 'Documentary Film', url: '/services/documentary-film-production-kolkata/' }
    ];

    expectedCorp.forEach((exp, idx) => {
        const item = corpItems[idx];
        assert(item?.title === exp.title, `Corporate #${idx+1} is "${exp.title}" (Actual: "${item?.title}")`);
        assert(item?.url === exp.url, `Corporate #${idx+1} URL matches "${exp.url}" (Actual: "${item?.url}")`);
    });

    // 5. Column 3: DRONE & AERIAL (Independent 3rd Column - 3 items)
    console.log('\n--- TEST 5: Column 3 - DRONE & AERIAL (Independent 3rd Column) ---');
    const droneItems = children.filter(c => c.group === 'DRONE & AERIAL');
    assert(droneItems.length === 3, `DRONE & AERIAL has exactly 3 items (Found: ${droneItems.length})`);

    const drone1 = droneItems[0];
    assert(drone1.title.toUpperCase().includes('DRONE PHOTOGRAPHY'), `Drone #1 is DRONE PHOTOGRAPHY (Found: "${drone1.title}")`);
    assert(drone1.url === '/services/drone-photography-kolkata/', `Drone #1 points to /services/drone-photography-kolkata/`);
    assert(drone1.badge === 'CERTIFIED', `Drone #1 has badge "CERTIFIED" (Actual: "${drone1.badge}")`);
    assert(drone1.icon === '🛸', `Drone #1 has icon "🛸" (Actual: "${drone1.icon}")`);

    const drone2 = droneItems[1];
    assert(drone2.title.toUpperCase().includes('DRONE VIDEOGRAPHY'), `Drone #2 is DRONE VIDEOGRAPHY (Found: "${drone2.title}")`);
    assert(drone2.url === '/services/drone-videography-kolkata/', `Drone #2 points to /services/drone-videography-kolkata/`);
    assert(drone2.badge === 'POPULAR', `Drone #2 has badge "POPULAR" (Actual: "${drone2.badge}")`);

    const drone3 = droneItems[2];
    assert(drone3.title.toUpperCase().includes('3D AREA AND MAPPING'), `Drone #3 is 3D AREA AND MAPPING (Found: "${drone3.title}")`);
    assert(drone3.url === '/services/3d-area-mapping-kolkata/', `Drone #3 points to /services/3d-area-mapping-kolkata/`);

    // Verify Drone & Aerial is NOT inside Corporate
    const droneInsideCorp = corpItems.filter(it => it.title.toLowerCase().includes('drone') || it.title.toLowerCase().includes('3d area'));
    assert(droneInsideCorp.length === 0, `No Drone items leaked inside Corporate (Found: ${droneInsideCorp.length})`);

    // 6. Column 4: SOCIAL
    console.log('\n--- TEST 6: Column 4 - SOCIAL (3 items) ---');
    const socialItems = children.filter(c => c.group === 'SOCIAL');
    assert(socialItems.length === 3, `SOCIAL has exactly 3 items (Found: ${socialItems.length})`);
    assert(socialItems[0].title === 'Birthday Photography', `Social #1 is Birthday Photography`);
    assert(socialItems[1].title === 'Rice Ceremony', `Social #2 is Rice Ceremony`);
    assert(socialItems[2].title === 'Other Social Events', `Social #3 is Other Social Events`);

    // 7. Column 5: TECH
    console.log('\n--- TEST 7: Column 5 - TECH (1 item) ---');
    const techItems = children.filter(c => c.group === 'TECH');
    assert(techItems.length === 1, `TECH has exactly 1 item (Found: ${techItems.length})`);
    assert(techItems[0].title === 'Website', `Tech item is Website`);
    assert(techItems[0].url === '/tech', `Website points to /tech`);

    // 8. Column 6: EVENT MANAGEMENT
    console.log('\n--- TEST 8: Column 6 - EVENT MANAGEMENT (1 item) ---');
    const eventItems = children.filter(c => c.group === 'EVENT MANAGEMENT');
    assert(eventItems.length === 1, `EVENT MANAGEMENT has exactly 1 item (Found: ${eventItems.length})`);
    assert(eventItems[0].badge === 'COMING SOON', `Event Management has badge "COMING SOON"`);
    assert(eventItems[0].url === '#', `Event Management has safe URL "#"`);

    // 9. Podcast Videos & Database Preservation
    console.log('\n--- TEST 9: Podcast Videos & Backend Preservation ---');
    const podcastVideos = await db.collection('podcastvideos').find({}).toArray();
    assert(podcastVideos.length >= 11, `Database has ${podcastVideos.length} podcast videos (>= 11 required)`);

    await mongoose.disconnect();

    // 10. Live HTTP Status Checks on Localhost
    console.log('\n--- TEST 10: Live HTTP Status Checks on Localhost ---');
    const routesToTest = [
        { name: 'Homepage', url: 'http://localhost:3000/' },
        { name: 'Services Index', url: 'http://localhost:3000/services/' },
        { name: 'Drone Photography', url: 'http://localhost:3000/services/drone-photography-kolkata/' },
        { name: 'Drone Videography', url: 'http://localhost:3000/services/drone-videography-kolkata/' },
        { name: '3D Area Mapping', url: 'http://localhost:3000/services/3d-area-mapping-kolkata/' },
        { name: 'Commercial Ad Films', url: 'http://localhost:3000/services/commercial-ad-films-kolkata/' },
        { name: 'Brand Promotion', url: 'http://localhost:3000/services/brand-promotion-kolkata/' },
        { name: 'Corporate Film', url: 'http://localhost:3000/services/corporate-photography-kolkata/' },
        { name: 'Short Film', url: 'http://localhost:3000/services/short-film-production-kolkata/' },
        { name: '3D Visualization', url: 'http://localhost:3000/services/3d-visualization-kolkata/' },
        { name: 'Live Stream Broadcast', url: 'http://localhost:3000/services/live-stream-broadcast-kolkata/' },
        { name: 'Fashion Photography', url: 'http://localhost:3000/services/fashion-photography-kolkata/' },
        { name: 'Podcast Production', url: 'http://localhost:3000/services/podcast-production-kolkata/' },
        { name: 'Documentary Films', url: 'http://localhost:3000/services/documentary-film-production-kolkata/' },
        { name: 'Wedding Photography', url: 'http://localhost:3000/services/wedding-photography-kolkata/' },
        { name: 'Pre Wedding Shoot', url: 'http://localhost:3000/services/pre-wedding-shoot-kolkata/' },
        { name: 'Post Wedding', url: 'http://localhost:3000/services/post-wedding-photography-kolkata/' },
        { name: 'Birthday Photography', url: 'http://localhost:3000/services/birthday-photography-kolkata/' },
        { name: 'Rice Ceremony', url: 'http://localhost:3000/services/rice-ceremony-photography-kolkata/' },
        { name: 'Other Social Events', url: 'http://localhost:3000/services/other-social-events-kolkata/' },
        { name: 'Tech / Website', url: 'http://localhost:3000/tech' },
        { name: 'Admin Services Page', url: 'http://localhost:3000/admin/services' },
        { name: 'Admin Navigation API', url: 'http://localhost:3000/api/navigation' }
    ];

    for (const route of routesToTest) {
        try {
            const res = await fetch(route.url, { method: 'GET' });
            assert(res.status === 200, `${route.name} (${route.url}) returned HTTP ${res.status}`);
        } catch (e) {
            assert(false, `${route.name} (${route.url}) failed with error: ${e.message}`);
        }
    }

    console.log('\n==================================================================');
    console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log('==================================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
});
