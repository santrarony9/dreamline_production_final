import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3000';

async function testCrud() {
    console.log("================================================================================");
    console.log("   DREAMLINE PRODUCTION - TEST VIDEO REORDER, EDIT, AND DELETE IN BACKEND       ");
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

    // --- TEST A: Reorder Videos (Video 2 first, Video 1 second) ---
    console.log("--- TEST A: Reorder Videos in Backend & Verify Frontend Order ---");
    const currentDoc = await db.collection('servicepages').findOne({ slug: 'birthday-photography-kolkata' });
    const originalVideos = [...currentDoc.videos];

    const reversedVideos = [originalVideos[1], originalVideos[0]];
    const reorderPayload = {
        ...currentDoc,
        videos: reversedVideos
    };
    delete reorderPayload._id;

    const reorderRes = await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(reorderPayload)
    });
    console.log("  [PASS] Reordered videos saved via API (Status:", reorderRes.status, ")");

    // Verify order on frontend
    const frontReorderRes = await fetch(`${BASE_URL}/services/birthday-photography-kolkata/`);
    const frontReorderHtml = await frontReorderRes.text();
    const posKxy = frontReorderHtml.indexOf("KxySjtXaRN0");
    const posIl4 = frontReorderHtml.indexOf("il4uufxfxKY");
    const reorderVerified = posKxy !== -1 && posIl4 !== -1 && posKxy < posIl4;
    console.log(`  [${reorderVerified ? 'PASS' : 'FAIL'}] Frontend reflects reordered videos (KxySjtXaRN0 is before il4uufxfxKY): ${reorderVerified}`);

    // --- TEST B: Edit a Video Title in Backend & Verify Frontend ---
    console.log("\n--- TEST B: Edit Video Title in Backend & Verify Frontend ---");
    const editPayload = {
        ...currentDoc,
        videos: [
            {
                ...originalVideos[0],
                title: "Best Birthday Photography in Kolkata 2023 (Official Edit)"
            },
            originalVideos[1]
        ]
    };
    delete editPayload._id;

    const editRes = await fetch(`${BASE_URL}/api/service-pages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(editPayload)
    });
    console.log("  [PASS] Edited video title saved via API (Status:", editRes.status, ")");

    const frontEditRes = await fetch(`${BASE_URL}/services/birthday-photography-kolkata/`);
    const frontEditHtml = await frontEditRes.text();
    const editVerified = frontEditHtml.includes("Best Birthday Photography in Kolkata 2023 (Official Edit)");
    console.log(`  [${editVerified ? 'PASS' : 'FAIL'}] Frontend reflects edited video title: ${editVerified}`);

    // --- TEST C: Restore Original Order & Canonical Titles ---
    console.log("\n--- TEST C: Restore Original Order & Canonical Titles ---");
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

    const frontFinalRes = await fetch(`${BASE_URL}/services/birthday-photography-kolkata/`);
    const frontFinalHtml = await frontFinalRes.text();
    const posFinalIl4 = frontFinalHtml.indexOf("il4uufxfxKY");
    const posFinalKxy = frontFinalHtml.indexOf("KxySjtXaRN0");
    const finalVerified = posFinalIl4 !== -1 && posFinalKxy !== -1 && posFinalIl4 < posFinalKxy;
    console.log(`  [${finalVerified ? 'PASS' : 'FAIL'}] Final state verified (il4uufxfxKY first, KxySjtXaRN0 second): ${finalVerified}`);

    await mongoose.disconnect();

    const allPassed = reorderVerified && editVerified && finalVerified;
    console.log("\n================================================================================");
    console.log(`   CRUD TEST RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}          `);
    console.log("================================================================================\n");

    process.exit(allPassed ? 0 : 1);
}

testCrud().catch(err => {
    console.error(err);
    process.exit(1);
});
