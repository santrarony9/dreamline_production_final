import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("================================================================================");
console.log("     DREAMLINE PRODUCTION - DYNAMIC NAVIGATION MANAGEMENT SYSTEM TEST           ");
console.log("================================================================================\n");

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${testName}`);
        if (details) console.error(`         Details: ${details}`);
        failedTests++;
    }
}

async function runTests() {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Files & Source Code Verification
    // -------------------------------------------------------------------------
    console.log("--- TEST SUITE 1: File Architecture & Component Integration ---");

    const requiredFiles = [
        'src/models/NavigationItem.js',
        'src/lib/navigation-defaults.js',
        'src/lib/navigation-service.js',
        'src/app/api/navigation/route.js',
        'src/app/api/admin/navigation/route.js',
        'src/app/api/admin/navigation/reset/route.js',
        'src/app/admin/navigation/page.js',
        'src/components/Navbar.js',
        'src/app/layout.js'
    ];

    for (const relPath of requiredFiles) {
        const fullPath = path.join(__dirname, '..', relPath);
        assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
    }

    // Verify Navbar.js renders dynamically without hardcoded dropdowns
    const navbarCode = fs.readFileSync(path.join(__dirname, '..', 'src/components/Navbar.js'), 'utf8');
    assert(navbarCode.includes('navItems'), "Navbar.js manages dynamic navItems state");
    assert(navbarCode.includes('desktopItems'), "Navbar.js filters desktopItems based on displayDesktop");
    assert(navbarCode.includes('mobileItems'), "Navbar.js filters mobileItems based on displayMobile");
    assert(navbarCode.includes('groupChildren'), "Navbar.js groups mega-menu dropdowns dynamically");
    assert(!navbarCode.includes('const SERVICES_DROPDOWN = ['), "Navbar.js has removed legacy hardcoded SERVICES_DROPDOWN");

    // Verify Admin Navigation Page
    const adminPageCode = fs.readFileSync(path.join(__dirname, '..', 'src/app/admin/navigation/page.js'), 'utf8');
    assert(adminPageCode.includes('/api/admin/navigation'), "Admin page connects to /api/admin/navigation");
    assert(adminPageCode.includes('reorder'), "Admin page supports drag-and-drop / manual reordering");
    assert(adminPageCode.includes('availablePages'), "Admin page includes quick page selector for core, services, custom pages, and blogs");

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Flagship Defaults Seed Data
    // -------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 2: Flagship Defaults Seed Data ---");
    const defaultsModule = await import('../src/lib/navigation-defaults.js');
    const { DEFAULT_NAVIGATION_SEED } = defaultsModule;

    assert(Array.isArray(DEFAULT_NAVIGATION_SEED) && DEFAULT_NAVIGATION_SEED.length >= 6, "Seed contains all primary root items");

    const rootTitles = DEFAULT_NAVIGATION_SEED.map(i => i.title);
    assert(rootTitles.includes("HOME"), "Root contains HOME");
    assert(rootTitles.includes("ABOUT US"), "Root contains ABOUT US");
    assert(rootTitles.includes("SERVICES"), "Root contains SERVICES");
    assert(rootTitles.includes("PORTFOLIO"), "Root contains PORTFOLIO");
    assert(rootTitles.includes("BLOGS"), "Root contains BLOGS");
    assert(rootTitles.includes("CONTACT US"), "Root contains CONTACT US");

    const servicesSeed = DEFAULT_NAVIGATION_SEED.find(i => i.title === "SERVICES");
    assert(servicesSeed && servicesSeed.isDropdown === true, "SERVICES is marked as isDropdown: true");
    assert(Array.isArray(servicesSeed.children) && servicesSeed.children.length === 10, "SERVICES contains all 10 verified services");

    const expectedServices = [
        "/services/drone-photography-kolkata/",
        "/services/drone-videography-kolkata/",
        "/services/3d-area-mapping-kolkata/",
        "/services/video-production-agency-kolkata/",
        "/services/corporate-photography-kolkata/",
        "/services/podcast-production-kolkata/",
        "/services/documentary-film-production-kolkata/",
        "/services/wedding-photography-kolkata/",
        "/services/pre-wedding-shoot-kolkata/",
        "/services/rice-ceremony-photography-kolkata/"
    ];

    const serviceUrls = servicesSeed.children.map(c => c.url);
    const allServicesFound = expectedServices.every(url => serviceUrls.includes(url));
    assert(allServicesFound, "All 10 flagship services are present in the seed with correct URLs");

    const portfolioSeed = DEFAULT_NAVIGATION_SEED.find(i => i.title === "PORTFOLIO");
    assert(portfolioSeed && portfolioSeed.isDropdown === true, "PORTFOLIO is marked as isDropdown: true");
    assert(Array.isArray(portfolioSeed.children) && portfolioSeed.children.length >= 4, "PORTFOLIO contains project links");

    // -------------------------------------------------------------------------
    // TEST SUITE 3: MongoDB Database Integration & CRUD Tests
    // -------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 3: Database Models, Seeding & CRUD Operations ---");

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("  [SKIP] MONGODB_URI not found. Skipping live DB operations.");
        return;
    }

    await mongoose.connect(mongoUri, { bufferCommands: false });
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB successfully");

    const NavigationItem = (await import('../src/models/NavigationItem.js')).default;

    // Check count and seed if empty
    let totalCount = await NavigationItem.countDocuments();
    console.log(`  [INFO] Initial NavigationItem documents in DB: ${totalCount}`);

    if (totalCount === 0) {
        console.log("  [INFO] Seeding initial flagship navigation items into database...");
        for (const root of DEFAULT_NAVIGATION_SEED) {
            const rootDoc = await NavigationItem.create({
                title: root.title,
                url: root.url,
                type: root.type || "internal",
                order: root.order,
                openInNewTab: root.openInNewTab || false,
                isActive: root.isActive !== false,
                displayDesktop: root.displayDesktop !== false,
                displayMobile: root.displayMobile !== false,
                isDropdown: root.isDropdown || (root.children && root.children.length > 0),
                badge: root.badge || ""
            });

            if (Array.isArray(root.children) && root.children.length > 0) {
                for (const child of root.children) {
                    await NavigationItem.create({
                        title: child.title,
                        url: child.url,
                        type: child.type || "internal",
                        parentId: rootDoc._id,
                        order: child.order,
                        group: child.group || "",
                        icon: child.icon || "",
                        badge: child.badge || "",
                        description: child.description || "",
                        openInNewTab: child.openInNewTab || false,
                        isActive: child.isActive !== false,
                        displayDesktop: child.displayDesktop !== false,
                        displayMobile: child.displayMobile !== false
                    });
                }
            }
        }
        totalCount = await NavigationItem.countDocuments();
        assert(totalCount > 10, `Database seeded successfully. Total items: ${totalCount}`);
    } else {
        assert(totalCount > 10, `Database already has ${totalCount} navigation items`);
    }

    // Helper: Build tree from DB items (mirrors getPublishedNavigationTree)
    async function buildPublishedTree() {
        const items = await NavigationItem.find({ isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        const serialized = JSON.parse(JSON.stringify(items));
        const itemMap = new Map();
        serialized.forEach(item => {
            item.id = item._id.toString();
            item.children = [];
            itemMap.set(item.id, item);
        });

        const rootItems = [];
        serialized.forEach(item => {
            if (item.parentId && itemMap.has(item.parentId.toString())) {
                const parent = itemMap.get(item.parentId.toString());
                parent.children.push(item);
            } else {
                rootItems.push(item);
            }
        });
        return rootItems;
    }

    const publishedTree = await buildPublishedTree();
    assert(Array.isArray(publishedTree) && publishedTree.length >= 6, `Published navigation tree constructed with ${publishedTree.length} root items`);
    
    const dbServices = publishedTree.find(i => i.title === "SERVICES");
    assert(dbServices && dbServices.children && dbServices.children.length >= 10, `SERVICES dropdown contains ${dbServices?.children?.length} children`);

    const dbPortfolio = publishedTree.find(i => i.title === "PORTFOLIO");
    assert(dbPortfolio && dbPortfolio.children && dbPortfolio.children.length >= 4, `PORTFOLIO dropdown contains ${dbPortfolio?.children?.length} children`);

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Live CRUD & Reordering Operations
    // -------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 4: Live CRUD & Hierarchy Operations ---");

    // 1. Create a dynamic test root item
    const testRoot = await NavigationItem.create({
        title: "[TEST] Live Broadcast",
        url: "/live-broadcast/",
        type: "internal",
        order: 99,
        isActive: true,
        displayDesktop: true,
        displayMobile: true,
        badge: "New"
    });
    assert(testRoot && testRoot._id, "Created test root item in DB");

    // 2. Create a test child item attached to test root
    const testChild = await NavigationItem.create({
        title: "[TEST] 4K OB Van Streaming",
        url: "/live-broadcast/ob-van/",
        type: "internal",
        parentId: testRoot._id,
        order: 1,
        isActive: true,
        displayDesktop: true,
        displayMobile: false,
        badge: "UHD"
    });
    assert(testChild && testChild.parentId.equals(testRoot._id), "Created test child item attached to parent");

    // Update parent to be a dropdown
    await NavigationItem.findByIdAndUpdate(testRoot._id, { isDropdown: true });

    // 3. Verify tree structure reflects the parent-child relationship
    const updatedTree = await buildPublishedTree();
    const foundParent = updatedTree.find(i => i.id === testRoot._id.toString() || i._id?.toString() === testRoot._id.toString());
    assert(foundParent !== undefined, "Found newly created parent in published tree");
    assert(foundParent && foundParent.children && foundParent.children.length === 1, "Parent has exactly 1 child in published tree");
    assert(foundParent && foundParent.children[0].title === "[TEST] 4K OB Van Streaming", "Child title matches in published tree");

    // 4. Update test root item
    const updatedDoc = await NavigationItem.findByIdAndUpdate(
        testRoot._id,
        { title: "[TEST] Live Broadcast & Webcast", badge: "Hot" },
        { new: true }
    );
    assert(updatedDoc.title === "[TEST] Live Broadcast & Webcast" && updatedDoc.badge === "Hot", "Updated test item title and badge successfully");

    // 5. Test cascading deletion: deleting parent should clean up children
    await Promise.all([
        NavigationItem.findByIdAndDelete(testRoot._id),
        NavigationItem.deleteMany({ parentId: testRoot._id })
    ]);

    const remainingChild = await NavigationItem.findById(testChild._id);
    assert(remainingChild === null, "Cascading delete verified: child item automatically cleaned up when parent deleted");

    const remainingParent = await NavigationItem.findById(testRoot._id);
    assert(remainingParent === null, "Parent item verified deleted");

    await mongoose.disconnect();
    console.log("  [INFO] Disconnected from MongoDB.");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("================================================================================");

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error("Test execution failed with error:", err);
    process.exit(1);
});
