// Manual trigger script for today's daily sync
// This calls the live production Vercel API to manually fire the sync NOW
const https = require('https');

const SITE_URL = 'https://www.dreamlineproduction.com';
// Use automation secret from env or empty if not set (the API allows if no secret is configured)
const SECRET = process.env.AUTOMATION_SECRET || '';

const url = `${SITE_URL}/api/admin/automation/daily-sync${SECRET ? `?secret=${SECRET}` : ''}`;

console.log("Triggering daily sync on production server...");
console.log("URL:", url.replace(SECRET, '***'));
console.log("Time (IST):", new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString());
console.log("---");

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log("Response:", JSON.stringify(json, null, 2));
        } catch(e) {
            console.log("Raw Response:", data.substring(0, 500));
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e.message);
});
