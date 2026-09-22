const mongoose = require('mongoose');
require('./src/lib/mongodb').default().then(async () => {
    const Content = require('./src/models/Content').default;
    const c = await Content.findOne();
    const str = JSON.stringify(c);
    const matches = str.match(/https:\/\/[a-zA-Z0-9.-]*amazonaws\.com[^"]*/g);
    console.log('S3 links count:', matches ? matches.length : 0);
    process.exit(0);
});
