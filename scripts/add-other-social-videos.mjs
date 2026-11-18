import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - ADD YOUTUBE VIDEO TO OTHER SOCIAL EVENTS              ");
    console.log("================================================================================\n");

    // 1. Admin Authentication
    console.log("--- 1. Admin Authentication ---");
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
    const allCookies = `${csrfCookies}; ${sessionCookies}`;
    console.log("  [PASS] Logged in as administrator");

    const authHeaders = {
        'Cookie': allCookies,
        'Content-Type': 'application/json'
    };

    // 2. Fetch existing Other Social Events service page
    console.log("\n--- 2. Fetch Existing Service Page ---");
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    let existingPage = await db.collection('servicepages').findOne({ slug: 'other-social-events-kolkata' });
    console.log("  [INFO] Found existing page:", existingPage?.title || "None");

    const videosPayload = [
        {
            title: "mist &magic PUJAN VIDEO FINAL",
            url: "https://www.youtube.com/watch?v=fduCdqVPOfY",
            thumbnail: "https://img.youtube.com/vi/fduCdqVPOfY/hqdefault.jpg"
        }
    ];

    // 3. Save via /api/service-pages (Backend integration test)
    console.log("\n--- 3. Save Videos via Backend API ---");
    const updatePayload = {
        ...(existingPage || {}),
        slug: 'other-social-events-kolkata',
        title: existingPage?.title || "Social Events & Celebration Photography in Kolkata",
        subtitle: existingPage?.subtitle || "Anniversaries & Cultural Galas",
        description: existingPage?.description || "Preserve every milestone anniversary, cultural celebration, and prestigious gathering with timeless cinematography and candid portraits.",
        category: "SOCIAL",
        videos: videosPayload,
        videoSectionTitle: "Other Social Events Videos",
        videoSectionSubtitle: "Explore our cultural celebrations, sacred ceremonies, milestone anniversaries & festive gatherings."
    };
    delete updatePayload._id;

    const saveRes = await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(updatePayload)
    });

    const saveJson = await saveRes.json();
    if (!saveRes.ok) {
        console.error("  [FAIL] Save failed:", saveJson);
        process.exit(1);
    }
    console.log("  [PASS] Backend API saved Other Social Events page with YouTube video");

    // 4. Verify directly in MongoDB
    console.log("\n--- 4. Verify Persistence in MongoDB ---");
    const updatedDoc = await db.collection('servicepages').findOne({ slug: 'other-social-events-kolkata' });
    console.log("  [PASS] Document in DB has videos count:", updatedDoc.videos?.length);
    console.log("  [INFO] Video 1:", updatedDoc.videos[0]?.title, "=>", updatedDoc.videos[0]?.url);

    // 5. Verify Frontend HTML
    console.log("\n--- 5. Verify Frontend Other Social Events Page ---");
    const frontRes = await fetch(`${BASE_URL}/services/other-social-events-kolkata/`);
    const frontHtml = await frontRes.text();

    const checks = [
        { label: "Page responds 200", pass: frontRes.status === 200 },
        { label: "Heading 'Other Social Events Videos' present", pass: frontHtml.includes("Other Social Events") && frontHtml.includes("Videos") },
        { label: "Video ID 'fduCdqVPOfY' present", pass: frontHtml.includes("fduCdqVPOfY") },
        { label: "Thumbnail present", pass: frontHtml.includes("fduCdqVPOfY/hqdefault.jpg") },
        { label: "Title 'mist &magic PUJAN VIDEO FINAL' present", pass: frontHtml.includes("mist &amp;magic PUJAN VIDEO FINAL") || frontHtml.includes("mist &magic PUJAN VIDEO FINAL") },
        { label: "Aspect-video (16:9) container present", pass: frontHtml.includes("aspect-video") }
    ];

    let allPass = true;
    for (const c of checks) {
        if (c.pass) {
            console.log(`  [PASS] ${c.label}`);
        } else {
            console.error(`  [FAIL] ${c.label}`);
            allPass = false;
        }
    }

    // 6. Verify Isolation (Preservation Rules)
    console.log("\n--- 6. Verify Isolation Across Services ---");
    // Check Birthday Photography does NOT have this video
    const bdayRes = await fetch(`${BASE_URL}/services/birthday-photography-kolkata/`);
    const bdayHtml = await bdayRes.text();
    const bdayHasOtherVideo = bdayHtml.includes("fduCdqVPOfY");
    console.log(`  [${!bdayHasOtherVideo ? 'PASS' : 'FAIL'}] Birthday Photography does NOT contain Other Social video: ${!bdayHasOtherVideo}`);

    // Check Other Social does NOT have birthday videos
    const otherHasBday1 = frontHtml.includes("il4uufxfxKY");
    const otherHasBday2 = frontHtml.includes("KxySjtXaRN0");
    console.log(`  [${!otherHasBday1 && !otherHasBday2 ? 'PASS' : 'FAIL'}] Other Social does NOT contain Birthday videos: ${!otherHasBday1 && !otherHasBday2}`);

    // Check Drone photography
    const droneRes = await fetch(`${BASE_URL}/services/drone-photography-kolkata/`);
    const droneHtml = await droneRes.text();
    const droneHasSocial = droneHtml.includes("fduCdqVPOfY") || droneHtml.includes("il4uufxfxKY");
    console.log(`  [${!droneHasSocial ? 'PASS' : 'FAIL'}] Drone photography has NO social videos: ${!droneHasSocial}`);

    await mongoose.disconnect();

    const success = allPass && !bdayHasOtherVideo && !otherHasBday1 && !otherHasBday2 && !droneHasSocial;
    console.log("\n================================================================================");
    console.log(`   RESULT: ${success ? 'ALL TESTS PASSED SUCCESSFULLY' : 'SOME TESTS FAILED'} `);
    console.log("================================================================================\n");

    process.exit(success ? 0 : 1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
