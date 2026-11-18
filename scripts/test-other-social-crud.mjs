import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3000';

async function testCrud() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - TEST OTHER SOCIAL CRUD & REORDER IN BACKEND           ");
    console.log("================================================================================\n");

    // 1. Admin login
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

    const sessionCookies = signinRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    const authHeaders = {
        'Cookie': `${csrfCookies}; ${sessionCookies}`,
        'Content-Type': 'application/json'
    };

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const currentDoc = await db.collection('servicepages').findOne({ slug: 'other-social-events-kolkata' });
    const originalVideos = [...currentDoc.videos];

    // TEST 1: Edit Title
    console.log("--- TEST 1: Edit Video Title in Backend & Verify Frontend ---");
    const editPayload = {
        ...currentDoc,
        videos: [
            {
                ...originalVideos[0],
                title: "mist &magic PUJAN VIDEO FINAL (Official Edit)"
            }
        ]
    };
    delete editPayload._id;

    await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(editPayload)
    });

    const frontEditRes = await fetch(`${BASE_URL}/services/other-social-events-kolkata/`);
    const frontEditHtml = await frontEditRes.text();
    const editVerified = frontEditHtml.includes("mist &amp;magic PUJAN VIDEO FINAL (Official Edit)") || frontEditHtml.includes("mist &magic PUJAN VIDEO FINAL (Official Edit)");
    console.log(`  [${editVerified ? 'PASS' : 'FAIL'}] Frontend reflects edited video title: ${editVerified}`);

    // TEST 2: Add 2nd video, verify side-by-side layout
    console.log("\n--- TEST 2: Add 2nd Video in Backend & Verify Responsive 2-Card Layout ---");
    const twoVideosPayload = {
        ...currentDoc,
        videos: [
            originalVideos[0],
            {
                title: "Cultural Festival Highlight",
                url: "https://www.youtube.com/watch?v=TU6KUw_55ic",
                thumbnail: "https://img.youtube.com/vi/TU6KUw_55ic/hqdefault.jpg"
            }
        ]
    };
    delete twoVideosPayload._id;

    await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(twoVideosPayload)
    });

    const frontTwoRes = await fetch(`${BASE_URL}/services/other-social-events-kolkata/`);
    const frontTwoHtml = await frontTwoRes.text();
    const twoVideosVerified = frontTwoHtml.includes("fduCdqVPOfY") && frontTwoHtml.includes("TU6KUw_55ic");
    console.log(`  [${twoVideosVerified ? 'PASS' : 'FAIL'}] Frontend renders both videos: ${twoVideosVerified}`);

    // TEST 3: Restore to original single video
    console.log("\n--- TEST 3: Restore Original Single Video in Backend ---");
    const restorePayload = {
        ...currentDoc,
        videos: originalVideos
    };
    delete restorePayload._id;

    await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(restorePayload)
    });

    const frontFinalRes = await fetch(`${BASE_URL}/services/other-social-events-kolkata/`);
    const frontFinalHtml = await frontFinalRes.text();
    const finalVerified = frontFinalHtml.includes("fduCdqVPOfY") && !frontFinalHtml.includes("TU6KUw_55ic");
    console.log(`  [${finalVerified ? 'PASS' : 'FAIL'}] Frontend accurately restored to single video: ${finalVerified}`);

    await mongoose.disconnect();

    const allPassed = editVerified && twoVideosVerified && finalVerified;
    console.log("\n================================================================================");
    console.log(`   CRUD TEST RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}          `);
    console.log("================================================================================\n");

    process.exit(allPassed ? 0 : 1);
}

testCrud().catch(err => {
    console.error(err);
    process.exit(1);
});
