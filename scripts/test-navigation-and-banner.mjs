import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("================================================================================");
console.log("   DREAMLINE PRODUCTION - NAVIGATION & BANNER MANAGEMENT DIAGNOSTIC TEST        ");
console.log("================================================================================\n");

const BASE_URL = 'http://localhost:3000';
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

async function runDiagnostics() {
    // -------------------------------------------------------------------------
    // 1. AST Static Analysis for Undeclared Variables
    // -------------------------------------------------------------------------
    console.log("--- 1. Static AST Analysis for Scope & Undeclared References ---");
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const parser = require('next/dist/compiled/babel/parser');
    const traverse = require('next/dist/compiled/babel/traverse').default;

    const navCode = fs.readFileSync(path.join(__dirname, '..', 'src/app/admin/navigation/page.js'), 'utf8');
    const ast = parser.parse(navCode, { sourceType: 'module', plugins: ['jsx'] });
    const undeclared = new Set();
    const builtins = new Set(['console', 'setTimeout', 'clearTimeout', 'confirm', 'alert', 'window', 'document', 'Array', 'Boolean', 'Number', 'String', 'JSON', 'Promise', 'URLSearchParams', 'encodeURIComponent', 'fetch', 'FormData', 'Date', 'Math', 'Object', 'Set', 'Map', 'React', 'process', 'global']);

    traverse(ast, {
        Identifier(p) {
            if (p.isReferencedIdentifier()) {
                const name = p.node.name;
                if (!p.scope.hasBinding(name) && !builtins.has(name)) {
                    undeclared.add(name);
                }
            }
        }
    });

    assert(undeclared.size === 0, "No undeclared variables in src/app/admin/navigation/page.js", Array.from(undeclared).join(', '));
    assert(!navCode.includes('{contact.phone || "+91 82400 54002"}') || navCode.includes('const [contact, setContact]'), "contact state variable properly scoped for live preview");
    assert(fs.existsSync(path.join(__dirname, '..', 'src/app/admin/error.js')), "Admin error boundary exists at src/app/admin/error.js");

    // -------------------------------------------------------------------------
    // 2. HTTP Status & Page Compilation Tests
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Live Localhost Route Status & Compilation ---");

    try {
        const res = await fetch(`${BASE_URL}/admin/navigation/`);
        assert(res.status === 200, `GET /admin/navigation/ compiled cleanly (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /admin/navigation/", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/home/?tab=BANNER`);
        assert(res.status === 200, `GET /admin/home/?tab=BANNER compiled cleanly (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /admin/home/?tab=BANNER", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/api/admin/navigation/`);
        assert(res.status === 200 || res.status === 401, `GET /api/admin/navigation/ responds cleanly (Status: ${res.status})`);
    } catch (e) {
        assert(false, "GET /api/admin/navigation/", e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/api/content/`);
        const data = await res.json();
        assert(res.status === 200, `GET /api/content/ responds with valid JSON (Status: ${res.status})`);
        assert(data.home?.hero !== undefined, "Content API returns home.hero banner data");
    } catch (e) {
        assert(false, "GET /api/content/", e.message);
    }

    // -------------------------------------------------------------------------
    // 3. Database Persistence Tests for Hero and Promotional Banners
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Database Schema & Banner Persistence ---");
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("  [SKIP] MONGODB_URI not found. Skipping live DB operations.");
        return;
    }

    await mongoose.connect(mongoUri, { bufferCommands: false });
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB successfully");

    const db = mongoose.connection.db;
    const contentDoc = await db.collection('contents').findOne();
    assert(contentDoc !== null, "Content collection document found in MongoDB");

    // Test Hero Banner Persistence
    const originalHero = contentDoc.home?.hero || {};
    const testHeroUpdate = {
        ...originalHero,
        titleLine1: originalHero.titleLine1 || "Visionary",
        titleLine2: originalHero.titleLine2 || "Cinema.",
        subtitle: originalHero.subtitle || "EST. 2010 • DREAMLINE PRODUCTION",
        cta1Text: "Explore Weddings",
        cta1Link: "/luxury",
        cta2Text: "Commercial Works",
        cta2Link: "/commercial"
    };

    await db.collection('contents').updateOne(
        { _id: contentDoc._id },
        { $set: { "home.hero": testHeroUpdate } }
    );

    const verifiedHeroDoc = await db.collection('contents').findOne({ _id: contentDoc._id });
    assert(verifiedHeroDoc.home?.hero?.cta1Text === "Explore Weddings", "Hero Banner CTA buttons persisted in MongoDB");
    assert(verifiedHeroDoc.home?.hero?.titleLine1 !== "", "Hero Banner title persisted in MongoDB");

    // Test Promotional Banners Array Persistence
    const testBanner = {
        title: "[TEST] Wedding Season Promo 2026",
        subtitle: "Exclusive 15% Off Early Bookings",
        description: "Capture your dream luxury wedding film in Kolkata.",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        ctaText: "Claim Offer",
        ctaLink: "/contact",
        badge: "Limited Offer",
        order: 1,
        isActive: true
    };

    await db.collection('contents').updateOne(
        { _id: contentDoc._id },
        { $set: { banners: [testBanner] } }
    );

    const verifiedBannersDoc = await db.collection('contents').findOne({ _id: contentDoc._id });
    assert(Array.isArray(verifiedBannersDoc.banners) && verifiedBannersDoc.banners.length >= 1, "Promotional banner created & persisted in MongoDB");
    assert(verifiedBannersDoc.banners[0].title === "[TEST] Wedding Season Promo 2026", "Banner title and attributes match exactly");

    // Clean up test banner
    await db.collection('contents').updateOne(
        { _id: contentDoc._id },
        { $set: { banners: [] } }
    );

    const postCleanupDoc = await db.collection('contents').findOne({ _id: contentDoc._id });
    assert(Array.isArray(postCleanupDoc.banners) && postCleanupDoc.banners.length === 0, "Test banner cleanup verified");

    await mongoose.disconnect();
    console.log("  [INFO] Disconnected from MongoDB.");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`DIAGNOSTIC RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("================================================================================");

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runDiagnostics().catch(err => {
    console.error("Diagnostic execution error:", err);
    process.exit(1);
});
