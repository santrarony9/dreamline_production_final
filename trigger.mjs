import https from 'https';

https.get('https://dreamlineproduction.com/api/admin/automation/daily-sync?secret=dreamline_auto_2026', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(JSON.stringify(JSON.parse(data), null, 2)));
}).on('error', (err) => {
    console.error(err);
});
