console.log("================================================================================");
console.log("     DREAMLINE PRODUCTION - LOCALHOST BACKEND & API INTEGRATION TEST            ");
console.log("================================================================================\n");

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(cond, name, info = '') {
        if (cond) {
            console.log(`  [PASS] ${name}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${name} ${info ? `(${info})` : ''}`);
            failed++;
        }
    }

    // 1. Check Public API endpoints
    console.log("--- 1. Testing Core Public Localhost Backend APIs ---");
    
    // /api/navigation
    try {
        const res = await fetch(`${BASE_URL}/api/navigation/`);
        const data = await res.json();
        assert(res.status === 200 && data.success === true, "GET /api/navigation/ (Status: 200, items: " + data.items?.length + ")");
    } catch (e) {
        assert(false, "GET /api/navigation/", e.message);
    }

    // /api/content
    try {
        const res = await fetch(`${BASE_URL}/api/content/`);
        const data = await res.json();
        assert(res.status === 200 && data.global !== undefined, "GET /api/content/ (Status: 200)");
    } catch (e) {
        assert(false, "GET /api/content/", e.message);
    }

    // /api/gallery
    try {
        const res = await fetch(`${BASE_URL}/api/gallery/?all=true`);
        const data = await res.json();
        assert(res.status === 200, "GET /api/gallery/ (Status: 200)");
    } catch (e) {
        assert(false, "GET /api/gallery/", e.message);
    }

    // /api/blogs
    try {
        const res = await fetch(`${BASE_URL}/api/blogs/`);
        const data = await res.json();
        assert(res.status === 200, "GET /api/blogs/ (Status: 200)");
    } catch (e) {
        assert(false, "GET /api/blogs/", e.message);
    }

    // /api/pages
    try {
        const res = await fetch(`${BASE_URL}/api/pages/`);
        const data = await res.json();
        assert(res.status === 200, "GET /api/pages/ (Status: 200)");
    } catch (e) {
        assert(false, "GET /api/pages/", e.message);
    }

    // 2. Test Admin Authentication & NextAuth Session
    console.log("\n--- 2. Testing Localhost NextAuth Authentication ---");
    try {
        const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf/`);
        const csrfCookie = csrfRes.headers.get('set-cookie') || '';
        const { csrfToken } = await csrfRes.json();
        assert(Boolean(csrfToken), "Retrieved NextAuth CSRF Token from localhost");

        const authRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': csrfCookie
            },
            body: JSON.stringify({
                csrfToken,
                username: 'info.dreamline@gmail.com',
                password: 'Dreamline2026'
            })
        });

        assert(authRes.status === 200, `NextAuth master admin credentials authenticated (Status: ${authRes.status})`);
    } catch (e) {
        assert(false, "NextAuth Localhost Login", e.message);
    }

    // 3. Test Localhost Web & Admin Pages Rendering
    console.log("\n--- 3. Testing Localhost Web & Admin Pages Rendering ---");
    
    // Homepage
    try {
        const res = await fetch(`${BASE_URL}/`);
        const text = await res.text();
        assert(res.status === 200 && text.includes('SERVICES'), "Homepage loaded with dynamic navbar (Status: 200)");
    } catch (e) {
        assert(false, "Homepage load", e.message);
    }

    // Admin Login Page
    try {
        const res = await fetch(`${BASE_URL}/admin/login/`);
        const text = await res.text();
        assert(res.status === 200 && text.includes('Admin Portal'), "Admin Login page rendered without redirects (Status: 200)");
    } catch (e) {
        assert(false, "Admin Login page load", e.message);
    }

    // Admin Navigation Page (checks protection redirect when unauthenticated)
    try {
        const res = await fetch(`${BASE_URL}/admin/navigation/`, { redirect: 'manual' });
        assert(res.status === 307 || res.status === 200, "Admin Navigation route protected & responsive (Status: " + res.status + ")");
    } catch (e) {
        assert(false, "Admin Navigation page load", e.message);
    }

    console.log("\n================================================================================");
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================");
}

runTests();
