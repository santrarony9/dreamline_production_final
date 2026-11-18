import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runBackendVerification() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - COMPLETE BACKEND & FRONTEND REPAIR TEST SUITE         ");
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

    // Connect to MongoDB to backup and verify direct persistence
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Clean up any leftovers from previous test runs
    await db.collection('navigationitems').deleteMany({ title: /SPECIAL OFFER|VIRTUAL CINEMA/i });

    async function safeFetch(url, options = {}, retries = 4) {
        for (let i = 0; i < retries; i++) {
            try {
                return await globalThis.fetch(url, options);
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    // --- STEP 1: ADMIN AUTHENTICATION ---
    console.log("--- 1. Admin Authentication ---");
    let sessionCookie = '';
    try {
        const csrfRes = await safeFetch(`${BASE_URL}/api/auth/csrf/`);
        const csrfData = await csrfRes.json();
        const csrfCookies = csrfRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');

        const signinRes = await safeFetch(`${BASE_URL}/api/auth/callback/credentials/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': csrfCookies
            },
            body: new URLSearchParams({
                username: 'info.dreamline@gmail.com',
                password: 'Dreamline2026',
                csrfToken: csrfData.csrfToken,
                redirect: 'false'
            }),
            redirect: 'manual'
        });

        const setCookies = signinRes.headers.getSetCookie();
        const sessionTokenCookie = setCookies.find(c => c.startsWith('next-auth.session-token='));
        assert(sessionTokenCookie, "Admin Login successful and session token obtained");
        sessionCookie = sessionTokenCookie.split(';')[0];
    } catch (e) {
        assert(false, "Authentication Failed", e.message);
        return;
    }

    const authHeaders = {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
    };

    // --- TEST 1: Change an existing page heading in backend & verify frontend ---
    console.log("\n--- TEST 1: Change existing page heading in backend & verify frontend ---");
    const origContent = await db.collection('contents').findOne();
    const origTitleLine1 = origContent?.home?.hero?.titleLine1 || "Visionary";
    const testTitleLine1 = "CINEMATIC MASTER";

    try {
        // Update via /api/content
        const updateRes = await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    hero: {
                        ...origContent?.home?.hero,
                        titleLine1: testTitleLine1
                    }
                }
            })
        });
        const updateJson = await updateRes.json();
        assert(updateRes.ok && updateJson.success, "API saved updated page heading to database");

        // Verify direct DB persistence
        const dbDoc = await db.collection('contents').findOne();
        assert(dbDoc?.home?.hero?.titleLine1 === testTitleLine1, `Database holds updated heading "${testTitleLine1}"`);

        // Verify Frontend reflection
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(testTitleLine1), `Frontend HTML immediately reflects new heading "${testTitleLine1}"`);

        // Restore original
        await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    hero: {
                        ...origContent?.home?.hero,
                        titleLine1: origTitleLine1
                    }
                }
            })
        });
        const revertDoc = await db.collection('contents').findOne();
        assert(revertDoc?.home?.hero?.titleLine1 === origTitleLine1, "Original heading cleanly restored");
    } catch (e) {
        assert(false, "Test 1 Failed", e.message);
    }

    // --- TEST 2: Change existing description & verify frontend ---
    console.log("\n--- TEST 2: Change existing description & verify frontend ---");
    const origDesc = origContent?.home?.expertise?.description || "Dreamline Production moves away from standard shots.";
    const testDesc = "VERIFIED_DYNAMIC_DESCRIPTION_TEST_2026";

    try {
        const updateRes = await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    expertise: {
                        ...origContent?.home?.expertise,
                        description: testDesc
                    }
                }
            })
        });
        const updateJson = await updateRes.json();
        assert(updateRes.ok && updateJson.success, "API saved updated description to database");

        // Verify Frontend reflection
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(testDesc), `Frontend HTML immediately reflects updated description "${testDesc}"`);

        // Restore original
        await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    expertise: {
                        ...origContent?.home?.expertise,
                        description: origDesc
                    }
                }
            })
        });
        const revertDoc = await db.collection('contents').findOne();
        assert(revertDoc?.home?.expertise?.description === origDesc, "Original description cleanly restored");
    } catch (e) {
        assert(false, "Test 2 Failed", e.message);
    }

    // --- TEST 3: Upload a new image & verify URL generation ---
    console.log("\n--- TEST 3: Upload a new image & verify URL generation ---");
    let uploadedImageUrl = '';
    try {
        // 1. Get presigned upload token
        const presignRes = await safeFetch(`${BASE_URL}/api/upload/presigned`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ fileName: 'test-backend-upload.png', fileType: 'image/png' })
        });
        const presignData = await presignRes.json();
        assert(presignRes.ok && presignData.token, "Obtained secure upload token from /api/upload/presigned");

        // 2. Perform multipart upload
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const pngBuffer = Buffer.from(pngBase64, 'base64');
        const partHeader = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-backend-upload.png"\r\nContent-Type: image/png\r\n\r\n`,
            'utf8'
        );
        const partFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
        const fullBody = Buffer.concat([partHeader, pngBuffer, partFooter]);

        const uploadRes = await safeFetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Cookie': sessionCookie,
                'Authorization': `Bearer ${presignData.token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: fullBody
        });

        const uploadJson = await uploadRes.json();
        assert(uploadRes.ok && uploadJson.success && uploadJson.url, `Image uploaded successfully: ${uploadJson.url}`);
        uploadedImageUrl = uploadJson.url;

        // Verify file exists on disk
        const localPath = path.join(process.cwd(), 'public', uploadedImageUrl.replace(/^\//, ''));
        assert(fs.existsSync(localPath), `Uploaded image file exists on disk: ${localPath}`);
    } catch (e) {
        assert(false, "Test 3 Failed", e.message);
    }

    // --- TEST 4: Replace an existing image and verify frontend reflection ---
    console.log("\n--- TEST 4: Replace existing image and verify frontend reflection ---");
    const origHeroBg = origContent?.home?.hero?.backgroundImage;
    try {
        // Set hero background image to uploadedImageUrl
        const updateRes = await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    hero: {
                        ...origContent?.home?.hero,
                        backgroundImage: uploadedImageUrl
                    }
                }
            })
        });
        assert(updateRes.ok, "Hero image updated to newly uploaded image in database");

        // Verify on frontend
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(encodeURIComponent(uploadedImageUrl)) || frontHtml.includes(uploadedImageUrl), 
            "Frontend HTML contains newly replaced image URL");

        // Restore original image
        await safeFetch(`${BASE_URL}/api/content`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                home: {
                    hero: {
                        ...origContent?.home?.hero,
                        backgroundImage: origHeroBg
                    }
                }
            })
        });
        console.log("  [INFO] Original hero background image restored");

        // Cleanup test image file
        if (uploadedImageUrl) {
            const localPath = path.join(process.cwd(), 'public', uploadedImageUrl.replace(/^\//, ''));
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
    } catch (e) {
        assert(false, "Test 4 Failed", e.message);
    }

    // --- TEST 5: Add a new service & verify Services mega menu ---
    console.log("\n--- TEST 5: Add a new service & verify Services mega menu ---");
    const testServiceName = "VIRTUAL CINEMA EXPERIENCE";
    const testServiceDesc = "Cutting-edge immersive VR production & 360 degree video capture";
    const testServiceUrl = "/services/virtual-cinema-test/";
    let createdServiceId = null;

    try {
        const navRes = await safeFetch(`${BASE_URL}/api/admin/navigation`, {
            headers: authHeaders
        });
        const navData = await navRes.json();
        const rootItems = navData.rootItems || [];
        const servicesRoot = rootItems.find(r => r.title === "SERVICES");
        assert(servicesRoot, "Located SERVICES root navigation item in database");

        // Create new child item under SERVICES in TECH group
        const createRes = await safeFetch(`${BASE_URL}/api/admin/navigation`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: testServiceName,
                url: testServiceUrl,
                type: "internal",
                parentId: servicesRoot.id || servicesRoot._id,
                group: "TECH",
                badge: "NEW",
                description: testServiceDesc,
                order: 99,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            })
        });
        const createJson = await createRes.json();
        assert(createRes.ok && createJson.success, `Successfully created new service: "${testServiceName}"`);
        createdServiceId = createJson.item?.id || createJson.item?._id;
        assert(createdServiceId, `Created service ID: ${createdServiceId}`);

        // Verify mega menu API
        const pubNavRes = await safeFetch(`${BASE_URL}/api/navigation`);
        const pubNavData = await pubNavRes.json();
        const pubServices = pubNavData.items.find(r => r.title === "SERVICES");
        const foundItem = pubServices?.children?.find(c => c.title === testServiceName);
        assert(foundItem, `New service "${testServiceName}" appears in public navigation tree API`);

        // Verify Frontend SSR HTML renders the new service
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(testServiceName), `Frontend mega menu HTML immediately renders "${testServiceName}"`);
    } catch (e) {
        assert(false, "Test 5 Failed", e.message);
    }

    // --- TEST 6: Edit a service & verify updated information ---
    console.log("\n--- TEST 6: Edit a service & verify updated information ---");
    const editedServiceName = "VIRTUAL CINEMA EXPERIENCE (UPDATED)";
    const editedServiceDesc = "Updated description for immersive cinematic experience";
    try {
        const editRes = await safeFetch(`${BASE_URL}/api/admin/navigation`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                id: createdServiceId,
                title: editedServiceName,
                url: testServiceUrl,
                badge: "PREMIUM",
                description: editedServiceDesc,
                group: "TECH",
                isActive: true
            })
        });
        const editJson = await editRes.json();
        assert(editRes.ok && editJson.success, `Service updated to "${editedServiceName}"`);

        // Verify on frontend
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(editedServiceName), `Frontend mega menu HTML displays updated title "${editedServiceName}"`);
        assert(frontHtml.includes(editedServiceDesc), `Frontend mega menu HTML displays updated description`);
    } catch (e) {
        assert(false, "Test 6 Failed", e.message);
    }

    // --- TEST 7: Delete a test service & verify it disappears ---
    console.log("\n--- TEST 7: Delete a test service & verify it disappears ---");
    try {
        const delRes = await safeFetch(`${BASE_URL}/api/admin/navigation?id=${createdServiceId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        const delJson = await delRes.json();
        assert(delRes.ok && delJson.success, `Test service deleted from database`);

        // Verify it disappeared from public navigation
        const pubNavRes = await safeFetch(`${BASE_URL}/api/navigation`);
        const pubNavData = await pubNavRes.json();
        const pubServices = pubNavData.items.find(r => r.title === "SERVICES");
        const stillFound = pubServices?.children?.some(c => c.id === createdServiceId || c.title === editedServiceName);
        assert(!stillFound, `Deleted service no longer in public navigation tree`);

        // Verify Frontend SSR HTML no longer has the deleted service
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(!frontHtml.includes(editedServiceName), `Deleted service completely disappeared from frontend HTML`);
    } catch (e) {
        assert(false, "Test 7 Failed", e.message);
    }

    // --- TEST 8: Change navigation menu & verify frontend ---
    console.log("\n--- TEST 8: Change navigation menu & verify frontend ---");
    let testNavRootId = null;
    const testNavTitle = "SPECIAL OFFER";
    try {
        // Add a new root navigation item
        const addNavRes = await safeFetch(`${BASE_URL}/api/admin/navigation`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: testNavTitle,
                url: "/contact",
                type: "internal",
                order: 10,
                isActive: true,
                displayDesktop: true,
                displayMobile: true
            })
        });
        const addNavJson = await addNavRes.json();
        assert(addNavRes.ok && addNavJson.success, `Created test navigation item "${testNavTitle}"`);
        testNavRootId = addNavJson.item?.id || addNavJson.item?._id;

        // Verify on frontend
        const frontRes = await safeFetch(`${BASE_URL}/`);
        const frontHtml = await frontRes.text();
        assert(frontHtml.includes(testNavTitle), `Frontend navigation immediately renders "${testNavTitle}"`);

        // Delete test navigation item
        await safeFetch(`${BASE_URL}/api/admin/navigation?id=${testNavRootId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        const revertFront = await safeFetch(`${BASE_URL}/`);
        const revertHtml = await revertFront.text();
        assert(!revertHtml.includes(testNavTitle), `Deleted navigation item removed from frontend HTML`);
    } catch (e) {
        assert(false, "Test 8 Failed", e.message);
    }

    // --- TEST 9: Refresh both frontend and backend & verify persistence ---
    console.log("\n--- TEST 9: Refresh both frontend and backend & verify persistence ---");
    try {
        const [freshNavRes, freshContentRes, freshFrontRes] = await Promise.all([
            safeFetch(`${BASE_URL}/api/navigation`),
            safeFetch(`${BASE_URL}/api/content`),
            safeFetch(`${BASE_URL}/`)
        ]);

        assert(freshNavRes.ok, "Navigation API refreshed and persistent");
        assert(freshContentRes.ok, "Content API refreshed and persistent");
        assert(freshFrontRes.ok, "Frontend refreshed and persistent");

        const navJson = await freshNavRes.json();
        const contentJson = await freshContentRes.json();
        assert(navJson.items?.length > 0, `Navigation holds ${navJson.items?.length} root categories`);
        assert(contentJson.home?.hero?.titleLine1, `Content holds hero title: ${contentJson.home?.hero?.titleLine1}`);
    } catch (e) {
        assert(false, "Test 9 Failed", e.message);
    }

    // --- TEST 10: Check all existing pages for errors and broken functionality ---
    console.log("\n--- TEST 10: Check all existing pages for errors ---");
    const testPages = [
        '/',
        '/about/',
        '/services/',
        '/services/documentary-film-production-kolkata/',
        '/services/podcast-production-kolkata/',
        '/services/wedding-photography-kolkata/',
        '/services/drone-videography-kolkata/',
        '/services/corporate-photography-kolkata/',
        '/luxury',
        '/commercial',
        '/tech',
        '/portfolio/',
        '/blogs/',
        '/contact/',
        '/faq/',
        '/admin',
        '/admin/services',
        '/admin/navigation',
        '/admin/home',
        '/admin/about',
        '/admin/luxury',
        '/admin/commercial',
        '/admin/tech',
        '/admin/podcasts',
        '/admin/journal',
        '/admin/gallery',
        '/admin/seo',
        '/admin/global'
    ];

    for (const page of testPages) {
        try {
            const res = await safeFetch(`${BASE_URL}${page}`, {
                headers: page.startsWith('/admin') ? authHeaders : {}
            });
            assert(res.status === 200 || res.status === 307 || res.status === 308, 
                `Page ${page} responds with HTTP ${res.status}`);
        } catch (e) {
            assert(false, `Page ${page} failed to load`, e.message);
        }
    }

    await mongoose.disconnect();

    console.log("\n================================================================================");
    console.log(`   FINAL RESULTS: ${passed} PASSED | ${failed} FAILED                          `);
    console.log("================================================================================");

    process.exit(failed > 0 ? 1 : 0);
}

runBackendVerification();
