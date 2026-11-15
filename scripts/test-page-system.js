const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local if MONGODB_URI not set
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match) process.env.MONGODB_URI = match[1].trim();
    }
  } catch (e) {}
}

async function runTests() {
    console.log("==================================================");
    console.log("   DREAMLINE PRODUCTION - CUSTOM PAGE SYSTEM TEST  ");
    console.log("==================================================");
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  [PASS] ${message}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${message}`);
            failed++;
        }
    }

    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.\n");

        // Load modules
        const {
            normalizePageSlug,
            isValidPageSlug
        } = require('../src/lib/slug-utils');

        const {
            checkPageSlugAvailability,
            handlePageSlugChange,
            resolvePageDestination
        } = require('../src/lib/page-redirects');

        const CustomPage = require('../src/models/CustomPage').default || mongoose.model('CustomPage');
        const PageRedirect = require('../src/models/PageRedirect').default || mongoose.model('PageRedirect');

        // Cleanup any previous test data
        await CustomPage.deleteMany({ slug: { $regex: /^test-auto-page/ } });
        await PageRedirect.deleteMany({ fromSlug: { $regex: /^test-auto-page/ } });

        // -----------------------------------------------------------------
        // TEST 1: Slug Normalization & Validation
        // -----------------------------------------------------------------
        console.log("TEST 1: Slug Normalization & Validation");
        const norm1 = normalizePageSlug("Drone Photography in Kolkata! 2026");
        assert(norm1 === "drone-photography-in-kolkata-2026", `normalizePageSlug produced: "${norm1}"`);

        const normNested = normalizePageSlug("/Services/Aerial-Cinematography//");
        assert(normNested === "services/aerial-cinematography", `normalizePageSlug nested: "${normNested}"`);

        assert(isValidPageSlug("drone-photography-kolkata") === true, "Valid slug passes isValidPageSlug");
        assert(isValidPageSlug("services/aerial-cinematography") === true, "Valid nested slug passes isValidPageSlug");
        assert(isValidPageSlug("admin/users") === false, "Reserved root 'admin' rejected");
        assert(isValidPageSlug("api/pages") === false, "Reserved root 'api' rejected");
        assert(isValidPageSlug("blogs/my-post") === false, "Reserved root 'blogs' rejected");
        assert(isValidPageSlug("invalid--slug") === false, "Consecutive hyphens rejected");
        assert(isValidPageSlug("-invalid-") === false, "Leading/trailing hyphens rejected");

        // -----------------------------------------------------------------
        // TEST 2: Real-time Availability & Duplicate Checking
        // -----------------------------------------------------------------
        console.log("\nTEST 2: Real-time Availability Checking");
        const testSlug1 = "test-auto-page-initial";
        const availInitial = await checkPageSlugAvailability({ slug: testSlug1 });
        assert(availInitial.available === true, "Initial test slug is reported available");

        const availReserved = await checkPageSlugAvailability({ slug: "admin" });
        assert(availReserved.available === false, "Reserved slug 'admin' is unavailable");

        // -----------------------------------------------------------------
        // TEST 3: Create Custom Page in Database
        // -----------------------------------------------------------------
        console.log("\nTEST 3: Create Custom Page & Section Structure");
        const createdPage = await CustomPage.create({
            title: "Test Drone Cinematography Page",
            slug: testSlug1,
            description: "A dynamic custom page built with visual section builder.",
            template: "landing",
            status: "published",
            publishDate: "2026-01-01",
            author: "Dreamline Studio",
            design: {
                backgroundColor: "#050505",
                accentColor: "#c5a059",
                fontFamily: "Instrument Sans",
                headingFont: "Unbounded"
            },
            sections: [
                {
                    id: "sec-hero-1",
                    type: "hero",
                    order: 0,
                    visible: true,
                    settings: {
                        heading: "Elevate Your Cinematic Perspective",
                        subheading: "DGCA Certified Aerial Filmmakers",
                        badge: "AERIAL 4K",
                        buttons: [
                            { label: "Book Drone Shoot", url: "/contact/", style: "gold" }
                        ]
                    }
                },
                {
                    id: "sec-faq-1",
                    type: "faq",
                    order: 1,
                    visible: true,
                    settings: {
                        heading: "Frequently Asked Questions",
                        faqs: [
                            { q: "Is Dreamline DGCA certified?", a: "Yes, fully licensed commercial UAV pilots." }
                        ]
                    }
                }
            ],
            seo: {
                title: "Drone Cinematography Kolkata | Dreamline Production",
                description: "Award-winning aerial filmmaking in Kolkata.",
                canonicalUrl: `https://dreamlineproduction.com/${testSlug1}/`,
                noIndex: false
            },
            navigation: {
                inNavbar: true,
                inFooter: true,
                navLabel: "DRONE FILMS",
                navOrder: 10
            }
        });

        assert(createdPage._id != null, "Custom page created with Mongo _id");
        assert(createdPage.sections.length === 2, "Page holds 2 configurable sections");

        // Slug should now be unavailable
        const availAfterCreate = await checkPageSlugAvailability({ slug: testSlug1 });
        assert(availAfterCreate.available === false, "Created slug is now unavailable to other pages");

        // But available when excluding self
        const availSelf = await checkPageSlugAvailability({ slug: testSlug1, excludeId: createdPage._id });
        assert(availSelf.available === true, "Slug is available when excluding own page ID during edits");

        // -----------------------------------------------------------------
        // TEST 4: Destination Resolution for Public Catch-All
        // -----------------------------------------------------------------
        console.log("\nTEST 4: Destination Resolution");
        const dest1 = await resolvePageDestination(testSlug1);
        assert(dest1 !== null && dest1.type === "page", `Resolved direct page for slug "${testSlug1}"`);
        assert(dest1.page?.title === "Test Drone Cinematography Page", "Page data matches created page");

        // -----------------------------------------------------------------
        // TEST 5: Automatic 301 Redirect Engine & Chain Resolution
        // -----------------------------------------------------------------
        console.log("\nTEST 5: Automatic 301 Redirects & Loop Prevention");
        const testSlug2 = "test-auto-page-renamed";

        // Rename slug: testSlug1 -> testSlug2
        await handlePageSlugChange({
            pageId: createdPage._id,
            oldSlug: testSlug1,
            newSlug: testSlug2
        });
        await CustomPage.findByIdAndUpdate(createdPage._id, { slug: testSlug2 });

        // Verify old slug redirects to new slug
        const redirectDest1 = await resolvePageDestination(testSlug1);
        assert(
            redirectDest1 !== null && redirectDest1.type === "redirect" && redirectDest1.targetSlug === testSlug2,
            `Old slug "${testSlug1}" correctly redirects to "${testSlug2}"`
        );

        // Rename again: testSlug2 -> testSlug3 (Chain test)
        const testSlug3 = "test-auto-page-final";
        await handlePageSlugChange({
            pageId: createdPage._id,
            oldSlug: testSlug2,
            newSlug: testSlug3
        });
        await CustomPage.findByIdAndUpdate(createdPage._id, { slug: testSlug3 });

        // Verify testSlug1 now directly redirects to testSlug3 (no 2-step chain)
        const chainDest = await resolvePageDestination(testSlug1);
        assert(
            chainDest !== null && chainDest.type === "redirect" && chainDest.targetSlug === testSlug3,
            `Direct resolution: "${testSlug1}" -> "${testSlug3}" with zero redirect chain`
        );

        const dest3 = await resolvePageDestination(testSlug3);
        assert(dest3 !== null && dest3.type === "page", `Final slug "${testSlug3}" resolves to active page`);

        // -----------------------------------------------------------------
        // TEST 6: Page Duplication
        // -----------------------------------------------------------------
        console.log("\nTEST 6: Page Duplication");
        const copySlug = `${testSlug3}-copy`;
        const duplicatePage = await CustomPage.create({
            ...createdPage.toObject(),
            _id: undefined,
            title: `${createdPage.title} (Copy)`,
            slug: copySlug,
            status: "draft",
            aliases: [],
            redirectHistory: []
        });

        assert(duplicatePage.slug === copySlug, `Duplicated page created with slug: "${duplicatePage.slug}"`);
        assert(duplicatePage.status === "draft", "Duplicated page starts safely in draft status");
        assert(duplicatePage.sections.length === 2, "Duplicated page preserved all visual sections");

        // -----------------------------------------------------------------
        // TEST 7: Sitemap Query Logic Verification
        // -----------------------------------------------------------------
        console.log("\nTEST 7: Sitemap Query Logic Verification");
        const now = new Date();
        const publishedPages = await CustomPage.find({
            status: 'published',
            'seo.noIndex': { $ne: true }
        }, 'slug updatedAt').lean();

        const publishedInSitemap = publishedPages.some(p => p.slug === testSlug3);
        const draftInSitemap = publishedPages.some(p => p.slug === copySlug);

        assert(publishedInSitemap === true, `Published page "${testSlug3}" matches sitemap query filter`);
        assert(draftInSitemap === false, `Draft page "${copySlug}" excluded from sitemap query filter`);

        // -----------------------------------------------------------------
        // TEST 8: Cleanup Test Data
        // -----------------------------------------------------------------
        console.log("\nTEST 8: Cleanup Test Pages & Redirects");
        await CustomPage.deleteMany({ slug: { $regex: /^test-auto-page/ } });
        await PageRedirect.deleteMany({
            $or: [
                { fromSlug: { $regex: /^test-auto-page/ } },
                { toSlug: { $regex: /^test-auto-page/ } }
            ]
        });
        const remainingTestPages = await CustomPage.countDocuments({ slug: { $regex: /^test-auto-page/ } });
        assert(remainingTestPages === 0, "All test artifacts safely cleaned up from MongoDB");

        console.log("\n==================================================");
        console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log("==================================================");

        await mongoose.disconnect();
        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error("Test execution error:", err);
        process.exit(1);
    }
}

runTests();
