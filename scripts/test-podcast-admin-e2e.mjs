const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - PODCAST ADMIN & FRONTEND E2E TEST SUITE              ");
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

    // --- STEP 1: AUTHENTICATION ---
    console.log("--- 1. Admin Authentication ---");
    let sessionCookie = '';
    try {
        const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf/`);
        const csrfData = await csrfRes.json();
        const csrfCookies = csrfRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');

        const signinRes = await fetch(`${BASE_URL}/api/auth/callback/credentials/`, {
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

    // --- STEP 2: VERIFY INITIAL STATE ---
    console.log("\n--- 2. Verify Initial 6 Podcast Videos in Admin ---");
    let initialVideos = [];
    try {
        const res = await fetch(`${BASE_URL}/api/admin/podcasts/`, { headers: authHeaders });
        assert(res.status === 200, "GET /api/admin/podcasts/ returns 200 OK");
        const data = await res.json();
        assert(data.success === true, "Admin API response success is true");
        assert(data.total >= 6, `Found ${data.total} podcast videos (expected at least 6)`);
        initialVideos = data.items || [];
    } catch (e) {
        assert(false, "Fetch initial videos", e.message);
        return;
    }

    // --- STEP 3: CREATE A NEW VIDEO ---
    console.log("\n--- 3. Testing Add New Video via Admin API ---");
    let createdVideoId = null;
    const testVideoPayload = {
        title: "Test Special Episode - Behind The Lens in Kolkata",
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
        description: "An exclusive behind the scenes conversation on cinematography techniques.",
        category: "Behind The Scenes",
        videoType: "standard",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        displayOrder: 99,
        status: "published"
    };

    try {
        const createRes = await fetch(`${BASE_URL}/api/admin/podcasts/`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(testVideoPayload)
        });
        assert(createRes.status === 201, "POST /api/admin/podcasts/ returns 201 Created");
        const createData = await createRes.json();
        assert(createData.success === true && createData.item?._id, "Created video item returned with valid _id");
        createdVideoId = createData.item?._id;
        assert(createData.item?.youtubeId === 'dQw4w9WgXcQ', "YouTube ID auto-extracted correctly (dQw4w9WgXcQ)");
    } catch (e) {
        assert(false, "Create video", e.message);
    }

    // --- STEP 4: VERIFY FRONTEND REFLECTS NEWLY ADDED VIDEO ---
    console.log("\n--- 4. Verify Public Frontend Automatically Displays New Video ---");
    try {
        const publicRes = await fetch(`${BASE_URL}/api/podcasts/`);
        const publicData = await publicRes.json();
        const foundInPublicApi = publicData.items.some(v => v._id === createdVideoId || v.youtubeId === 'dQw4w9WgXcQ');
        assert(foundInPublicApi, "New video is included in public /api/podcasts endpoint");

        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        assert(pageHtml.includes("dQw4w9WgXcQ"), "New video ID 'dQw4w9WgXcQ' renders in public service page HTML");
        assert(pageHtml.includes("Test Special Episode - Behind The Lens in Kolkata"), "New video Title renders on public page");
    } catch (e) {
        assert(false, "Verify public frontend reflection", e.message);
    }

    // --- STEP 5: EDIT VIDEO TITLE, DESCRIPTION & THUMBNAIL ---
    console.log("\n--- 5. Testing Edit Video ---");
    const updatedTitle = "Edited Title: Masterclass In Podcast Audio Engineering";
    const updatedDesc = "Edited description detailing multi-track audio gear.";
    try {
        const editRes = await fetch(`${BASE_URL}/api/admin/podcasts/${createdVideoId}/`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                title: updatedTitle,
                description: updatedDesc,
                thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
            })
        });
        assert(editRes.status === 200, "PUT /api/admin/podcasts/[id]/ returns 200 OK");
        const editData = await editRes.json();
        assert(editData.item?.title === updatedTitle, "Video title updated in DB");

        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        assert(pageHtml.includes(updatedTitle), "Edited title is immediately reflected on live service page");
    } catch (e) {
        assert(false, "Edit video", e.message);
    }

    // --- STEP 6: UNPUBLISH VIDEO (DRAFT) ---
    console.log("\n--- 6. Testing Unpublish (Draft Status) & Frontend Removal ---");
    try {
        const draftRes = await fetch(`${BASE_URL}/api/admin/podcasts/${createdVideoId}/`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ status: "draft" })
        });
        assert(draftRes.status === 200, "Status changed to 'draft'");

        const publicRes = await fetch(`${BASE_URL}/api/podcasts/`);
        const publicData = await publicRes.json();
        const foundInPublicApi = publicData.items.some(v => v._id === createdVideoId);
        assert(!foundInPublicApi, "Draft video is automatically EXCLUDED from public /api/podcasts");

        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        assert(!pageHtml.includes("dQw4w9WgXcQ"), "Draft video is completely removed from live service page");
    } catch (e) {
        assert(false, "Unpublish video", e.message);
    }

    // --- STEP 7: RE-PUBLISH VIDEO ---
    console.log("\n--- 7. Testing Re-Publish Video ---");
    try {
        const pubRes = await fetch(`${BASE_URL}/api/admin/podcasts/${createdVideoId}/`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ status: "published" })
        });
        assert(pubRes.status === 200, "Status restored to 'published'");

        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        assert(pageHtml.includes("dQw4w9WgXcQ"), "Published video reappears on live service page");
    } catch (e) {
        assert(false, "Re-publish video", e.message);
    }

    // --- STEP 8: TEST REORDERING ---
    console.log("\n--- 8. Testing Video Reordering ---");
    try {
        const reorderRes = await fetch(`${BASE_URL}/api/admin/podcasts/`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                action: 'reorder',
                items: [
                    { _id: createdVideoId, displayOrder: 1 },
                    ...initialVideos.slice(0, 3).map((v, i) => ({ _id: v._id, displayOrder: i + 2 }))
                ]
            })
        });
        assert(reorderRes.status === 200, "Reorder bulk action returns 200 OK");
    } catch (e) {
        assert(false, "Reordering", e.message);
    }

    // --- STEP 9: DELETE TEST VIDEO ---
    console.log("\n--- 9. Testing Delete Video ---");
    try {
        const deleteRes = await fetch(`${BASE_URL}/api/admin/podcasts/${createdVideoId}/`, {
            method: 'DELETE',
            headers: authHeaders
        });
        assert(deleteRes.status === 200, "DELETE /api/admin/podcasts/[id]/ returns 200 OK");

        const verifyRes = await fetch(`${BASE_URL}/api/admin/podcasts/${createdVideoId}/`, { headers: authHeaders });
        assert(verifyRes.status === 404, "Deleted video returns 404 Not Found");

        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        assert(!pageHtml.includes("dQw4w9WgXcQ"), "Deleted video is removed from live service page");
    } catch (e) {
        assert(false, "Delete video", e.message);
    }

    // --- STEP 10: VERIFY ORIGINAL 6 VIDEOS ARE LIVE & HEALTHY ---
    console.log("\n--- 10. Verify Authentic 6 Podcast Videos Are Live ---");
    const requiredIds = ['rGCNP3nWC9Y', 'hRnCf_evOZs', 't4YqQvedLkE', 'qtp9vJ0xzFY', 'fLturgnZcMw', 'p-AOOftRg_E'];
    try {
        const pageRes = await fetch(`${BASE_URL}/services/podcast-production-kolkata/`);
        const pageHtml = await pageRes.text();
        for (const id of requiredIds) {
            assert(pageHtml.includes(id), `Original video [${id}] is present and intact`);
        }
    } catch (e) {
        assert(false, "Verify original videos", e.message);
    }

    // --- STEP 11: VERIFY ADMIN DASHBOARD ROUTE ---
    console.log("\n--- 11. Testing Admin Dashboard Route (/admin/podcasts/) ---");
    try {
        const adminPageRes = await fetch(`${BASE_URL}/admin/podcasts/`, { headers: authHeaders });
        assert(adminPageRes.status === 200, "GET /admin/podcasts/ returns 200 OK");
        const adminPageHtml = await adminPageRes.text();
        assert(adminPageHtml.includes("Podcast Video"), "Admin page contains Podcast Video Management header");
        assert(adminPageHtml.includes("Add New Video"), "Admin page contains Add New Video button");
    } catch (e) {
        assert(false, "Verify admin page", e.message);
    }

    console.log("\n================================================================================");
    console.log(`TOTAL E2E TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

runE2ETests();
