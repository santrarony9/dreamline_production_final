const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val) acc[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
    return acc;
}, {});

async function getGBPAccessToken() {
    const clientId = env.GBP_CLIENT_ID;
    const clientSecret = env.GBP_CLIENT_SECRET;
    const refreshToken = env.GBP_REFRESH_TOKEN;

    if(!clientId) return null;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });
    const data = await res.json();
    return data.access_token;
}

async function checkPosts() {
    try {
        const token = await getGBPAccessToken();
        if (!token) return console.log('GBP credentials not configured locally. I cannot check Google directly.');
        
        const accountId = env.GBP_ACCOUNT_ID;
        const locationId = env.GBP_LOCATION_ID;
        
        const url = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/localPosts`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.localPosts) {
            console.log('Recent Posts on Google:');
            data.localPosts.slice(0, 5).forEach(p => {
                console.log('-', p.summary ? p.summary.substring(0, 50) + '...' : 'No summary');
                console.log('  Created:', p.createTime);
            });
        } else {
            console.log('No posts found or error:', data);
        }
    } catch (e) {
        console.error(e);
    }
}
checkPosts();
