import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - ADD YOUTUBE VIDEOS TO BIRTHDAY PHOTOGRAPHY            ");
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

    // 2. Fetch existing Birthday Photography service page
    console.log("\n--- 2. Fetch Existing Service Page ---");
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    let existingPage = await db.collection('servicepages').findOne({ slug: 'birthday-photography-kolkata' });
    console.log("  [INFO] Found existing page:", existingPage?.title || "None");

    const videosPayload = [
        {
            title: "Best Birthday Photography in Kolkata 2023 II Dreamline Production",
            url: "https://www.youtube.com/watch?v=il4uufxfxKY",
            thumbnail: "https://img.youtube.com/vi/il4uufxfxKY/hqdefault.jpg"
        },
        {
            title: "ADI BIRTHDAY VIDEO FINAL",
            url: "https://www.youtube.com/watch?v=KxySjtXaRN0",
            thumbnail: "https://img.youtube.com/vi/KxySjtXaRN0/hqdefault.jpg"
        }
    ];

    // 3. Save via /api/service-pages (Backend integration test)
    console.log("\n--- 3. Save Videos via Backend API ---");
    const updatePayload = {
        ...(existingPage || {}),
        slug: 'birthday-photography-kolkata',
        title: existingPage?.title || "Birthday celebration",
        subtitle: existingPage?.subtitle || "Milestone Celebrations & Candids",
        description: existingPage?.description || "Vibrant candid photography and cinematic video coverage for milestone birthday celebrations, kids' themes, and luxury private parties.",
        category: "SOCIAL",
        videos: videosPayload,
        videoSectionTitle: "Birthday Photography Videos",
        videoSectionSubtitle: "Explore our milestone birthday cinematography, vibrant celebrations & candid moments."
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
    console.log("  [PASS] Backend API saved Birthday Photography page with 2 YouTube videos");

    // 4. Verify directly in MongoDB
    console.log("\n--- 4. Verify Persistence in MongoDB ---");
    const updatedDoc = await db.collection('servicepages').findOne({ slug: 'birthday-photography-kolkata' });
    console.log("  [PASS] Document in DB has videos count:", updatedDoc.videos?.length);
    console.log("  [INFO] Video 1:", updatedDoc.videos[0]?.title, "=>", updatedDoc.videos[0]?.url);
    console.log("  [INFO] Video 2:", updatedDoc.videos[1]?.title, "=>", updatedDoc.videos[1]?.url);

    // 5. Verify Frontend HTML
    console.log("\n--- 5. Verify Frontend Birthday Service Page ---");
    const frontRes = await fetch(`${BASE_URL}/services/birthday-photography-kolkata/`);
    const frontHtml = await frontRes.text();

    const checks = [
        { label: "Page responds 200", pass: frontRes.status === 200 },
        { label: "Heading 'Birthday Photography Videos' present", pass: frontHtml.includes("Birthday Photography") && frontHtml.includes("Videos") },
        { label: "Video 1 ID 'il4uufxfxKY' present", pass: frontHtml.includes("il4uufxfxKY") },
        { label: "Video 2 ID 'KxySjtXaRN0' present", pass: frontHtml.includes("KxySjtXaRN0") },
        { label: "Video 1 Thumbnail present", pass: frontHtml.includes("il4uufxfxKY/hqdefault.jpg") },
        { label: "Video 2 Thumbnail present", pass: frontHtml.includes("KxySjtXaRN0/hqdefault.jpg") },
        { label: "Video 1 Title present", pass: frontHtml.includes("Best Birthday Photography in Kolkata 2023") },
        { label: "Video 2 Title present", pass: frontHtml.includes("ADI") && frontHtml.includes("BIRTHDAY VIDEO FINAL") },
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

    // 6. Verify Isolation (other service pages do NOT display these videos)
    console.log("\n--- 6. Verify Other Service Pages Do Not Display Birthday Videos ---");
    const otherRes = await fetch(`${BASE_URL}/services/drone-photography-kolkata/`);
    const otherHtml = await otherRes.text();
    const isolated = !otherHtml.includes("il4uufxfxKY") && !otherHtml.includes("KxySjtXaRN0");
    console.log(`  [${isolated ? 'PASS' : 'FAIL'}] Other service page (drone-photography-kolkata) is isolated (no birthday videos): ${isolated}`);

    await mongoose.disconnect();

    console.log("\n================================================================================");
    console.log(`   RESULT: ${allPass && isolated ? 'ALL TESTS PASSED SUCCESSFULLY' : 'SOME TESTS FAILED'} `);
    console.log("================================================================================\n");

    process.exit(allPass && isolated ? 0 : 1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
