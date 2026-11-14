const legacyUrls = [
  { from: 'http://localhost:3000/services/drone-videography/', to: '/services/drone-videography-kolkata/' },
  { from: 'http://localhost:3000/services/corporate-films/', to: '/services/corporate-photography-kolkata/' },
  { from: 'http://localhost:3000/services/corporate-photography/', to: '/services/corporate-photography-kolkata/' },
  { from: 'http://localhost:3000/services/wedding-photography/', to: '/services/wedding-photography-kolkata/' },
  { from: 'http://localhost:3000/services/pre-wedding/', to: '/services/pre-wedding-shoot-kolkata/' },
  { from: 'http://localhost:3000/services/pre-wedding-shoot/', to: '/services/pre-wedding-shoot-kolkata/' },
  { from: 'http://localhost:3000/services/podcast/', to: '/services/podcast-production-kolkata/' },
  { from: 'http://localhost:3000/services/documentary/', to: '/services/documentary-film-production-kolkata/' },
  { from: 'http://localhost:3000/services/brand-promotion/', to: '/services/brand-promotion-kolkata/' },
  { from: 'http://localhost:3000/services/ad-films/', to: '/services/commercial-ad-films-kolkata/' },
];

const standardizedPages = [
  'http://localhost:3000/services/',
  'http://localhost:3000/services/drone-photography-kolkata/',
  'http://localhost:3000/services/drone-videography-kolkata/',
  'http://localhost:3000/services/wedding-photography-kolkata/',
  'http://localhost:3000/services/corporate-photography-kolkata/',
  'http://localhost:3000/services/pre-wedding-shoot-kolkata/',
  'http://localhost:3000/services/rice-ceremony-photography-kolkata/',
  'http://localhost:3000/services/video-production-agency-kolkata/',
];

async function run() {
  console.log('=== TEST 1: Direct 301/308 Redirects for Legacy URLs (with trailing slash) ===');
  let passed = 0;
  let failed = 0;

  for (const item of legacyUrls) {
    try {
      const res = await fetch(item.from, { redirect: 'manual' });
      const location = res.headers.get('location');
      const locPath = location ? (location.startsWith('http') ? new URL(location).pathname : location) : '';

      if ((res.status === 301 || res.status === 308) && locPath === item.to) {
        console.log(`[PASS] ${item.from} -> ${res.status} redirect to ${location}`);
        passed++;
      } else {
        console.log(`[FAIL] ${item.from} -> status ${res.status}, location: ${location} (expected ${item.to})`);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${item.from} -> ${err.message}`);
      failed++;
    }
  }

  console.log('\n=== TEST 2: End-to-end follow redirects (without slash & with slash) ===');
  for (const item of legacyUrls) {
    const rawNoSlash = item.from.replace(/\/$/, '');
    try {
      const res = await fetch(rawNoSlash, { redirect: 'follow' });
      const finalUrl = new URL(res.url).pathname;
      if (res.status === 200 && finalUrl === item.to) {
        console.log(`[PASS] Follow ${rawNoSlash} -> ended at ${finalUrl} (200 OK)`);
        passed++;
      } else {
        console.log(`[FAIL] Follow ${rawNoSlash} -> ended at ${finalUrl} (status ${res.status}, expected ${item.to})`);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${rawNoSlash} -> ${err.message}`);
      failed++;
    }
  }

  console.log('\n=== TEST 3: Standardized Service Pages HTTP 200 ===');
  for (const pageUrl of standardizedPages) {
    try {
      const res = await fetch(pageUrl);
      if (res.status === 200) {
        console.log(`[PASS] ${pageUrl} -> 200 OK`);
        passed++;
      } else {
        console.log(`[FAIL] ${pageUrl} -> status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${pageUrl} -> ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Total tests passed: ${passed}, failed: ${failed}`);
}

run();
