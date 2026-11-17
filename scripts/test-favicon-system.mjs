import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const BASE_URL = 'http://localhost:3000';

console.log("================================================================================");
console.log("   DREAMLINE PRODUCTION - OFFICIAL LOGO FAVICON VERIFICATION TEST               ");
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
    // 1. Check Physical Asset Files
    // -------------------------------------------------------------------------
    console.log("--- 1. Verifying Generated Physical Favicon & Icon Files ---");

    const expectedFiles = [
        { path: 'public/logo.png', expectedW: 1000, expectedH: 1000 },
        { path: 'public/favicon.png', expectedW: 512, expectedH: 512 },
        { path: 'public/icon.png', expectedW: 512, expectedH: 512 },
        { path: 'public/icon-512.png', expectedW: 512, expectedH: 512 },
        { path: 'public/icon-192.png', expectedW: 192, expectedH: 192 },
        { path: 'public/apple-icon.png', expectedW: 180, expectedH: 180 },
        { path: 'public/favicon-48.png', expectedW: 48, expectedH: 48 },
        { path: 'public/favicon-32.png', expectedW: 32, expectedH: 32 },
        { path: 'public/favicon-16.png', expectedW: 16, expectedH: 16 }
    ];

    for (const f of expectedFiles) {
        const fullPath = path.join(ROOT_DIR, f.path);
        assert(fs.existsSync(fullPath), `File exists: ${f.path}`);
        if (fs.existsSync(fullPath)) {
            const meta = await sharp(fullPath).metadata();
            assert(
                meta.width === f.expectedW && meta.height === f.expectedH,
                `${f.path} matches required dimensions (${meta.width}x${meta.height})`
            );
        }
    }

    // Check ICO files
    const publicIco = path.join(ROOT_DIR, 'public', 'favicon.ico');
    assert(fs.existsSync(publicIco) && fs.statSync(publicIco).size >= 8000, `public/favicon.ico valid multi-res icon (${fs.statSync(publicIco).size} bytes)`);
    assert(!fs.existsSync(path.join(ROOT_DIR, 'src', 'app', 'favicon.ico')), "No conflicting src/app/favicon.ico (prevents Next.js 500 error)");

    // -------------------------------------------------------------------------
    // 2. Metadata & Manifest Configuration
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Verifying Metadata & Web App Manifest Configuration ---");

    const manifestCode = fs.readFileSync(path.join(ROOT_DIR, 'src/app/manifest.js'), 'utf8');
    assert(manifestCode.includes('/favicon.png'), "Manifest includes /favicon.png");
    assert(manifestCode.includes('/icon-192.png'), "Manifest includes /icon-192.png");
    assert(manifestCode.includes('/icon-512.png'), "Manifest includes /icon-512.png");

    const layoutCode = fs.readFileSync(path.join(ROOT_DIR, 'src/app/layout.js'), 'utf8');
    assert(layoutCode.includes('/favicon.ico'), "layout.js metadata defines /favicon.ico");
    assert(layoutCode.includes('/favicon-32.png'), "layout.js metadata defines /favicon-32.png");
    assert(layoutCode.includes('/favicon-48.png'), "layout.js metadata defines /favicon-48.png");
    assert(layoutCode.includes('/apple-icon.png'), "layout.js metadata defines /apple-icon.png");

    // -------------------------------------------------------------------------
    // 3. HTTP Localhost Delivery & Content Types
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Localhost Browser Tab Delivery ---");

    try {
        const res = await fetch(`${BASE_URL}/favicon.ico`);
        assert(res.status === 200, `GET /favicon.ico (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /favicon.ico", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/favicon.png`);
        assert(res.status === 200, `GET /favicon.png (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /favicon.png", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/apple-icon.png`);
        assert(res.status === 200, `GET /apple-icon.png (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /apple-icon.png", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/manifest.webmanifest`);
        const data = await res.json();
        assert(res.status === 200 && Array.isArray(data.icons) && data.icons.length >= 3, `GET /manifest.webmanifest (Status: 200, Icons: ${data.icons?.length})`);
    } catch (e) {
        assert(false, "GET /manifest.webmanifest", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/`);
        const html = await res.text();
        assert(html.includes('rel="icon"'), "Homepage HTML links to favicon icon");
        assert(html.includes('rel="apple-touch-icon"'), "Homepage HTML links to apple-touch-icon");
    } catch (e) {
        assert(false, "Homepage HTML link checks", e.message);
    }

    console.log("\n================================================================================");
    console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("================================================================================");

    if (failedTests > 0) process.exit(1);
    else process.exit(0);
}

runTests().catch(err => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
