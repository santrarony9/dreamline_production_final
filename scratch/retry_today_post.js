const https = require('https');
const { URL } = require('url');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
const WEBHOOK_URL = 'https://hook.eu1.make.com/kqorky35l699m65mla8dzcut3alkczg7';

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();
}

function sendWebhook(payload) {
    return new Promise((resolve) => {
        const payloadStr = JSON.stringify(payload);
        const webhookUrl = new URL(WEBHOOK_URL);
        const options = {
            hostname: webhookUrl.hostname,
            path: webhookUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payloadStr)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });
        req.on('error', (e) => resolve({ status: 0, body: e.message }));
        req.write(payloadStr);
        req.end();
    });
}

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB...\n');
        const db = client.db('dreamline');
        const journals = db.collection('journals');

        const todayStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log('Today (IST):', todayStr);

        const post = await journals.findOne({ date: todayStr });
        if (!post) {
            console.log('ERROR: No post found for today:', todayStr);
            return;
        }

        console.log('Post:', post.title);
        console.log('Current sync status:', post.googleBusinessSync || 'NONE');

        // Reset sync status so we can trigger fresh
        await journals.updateOne(
            { _id: post._id },
            { $set: { googleBusinessSync: 'PENDING' } }
        );
        console.log('Reset status to PENDING\n');

        const rawImage = (post.image && post.image.startsWith('http'))
            ? post.image
            : 'https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG';

        // Use the image proxy to ensure it passes Google's validation
        const imageUrl = (rawImage.includes('dreamlinepro.s3') || rawImage.includes('unsplash'))
            ? 'https://dreamlineproduction.com/api/images/cover.jpg?url=' + encodeURIComponent(rawImage)
            : rawImage;

        const postId = post._id.toString();
        const publicUrl = 'https://dreamlineproduction.com/journal/' + postId;
        const summary = stripHtml(post.excerpt || post.content).substring(0, 1500);
        const excerpt = stripHtml(post.excerpt || post.title).substring(0, 300);

        const payload = {
            type: 'JOURNAL_POST',
            action: 'AUTOMATED_SYNC',
            post: {
                _id: postId,
                title: post.title,
                date: post.date,
                category: post.category || 'Studio',
                image: imageUrl,
                summary: summary || post.title,
                publicUrl: publicUrl,
                excerpt: excerpt || post.title
            }
        };

        console.log('=== PAYLOAD TO MAKE.COM ===');
        console.log('Title:', payload.post.title);
        console.log('Summary (first 200):', (payload.post.summary || '').substring(0, 200));
        console.log('Public URL:', payload.post.publicUrl);
        console.log('Image URL:', payload.post.image.substring(0, 100));
        console.log('===========================\n');

        console.log('Sending to Make.com webhook...');
        const result = await sendWebhook(payload);

        console.log('HTTP Status:', result.status);
        console.log('Response:', result.body);

        if (result.status === 200 || result.status === 202) {
            await journals.updateOne(
                { _id: post._id },
                { $set: { googleBusinessSync: 'SYNCED', lastSyncedAt: new Date() } }
            );
            console.log('\nSUCCESS: DB updated to SYNCED');
            console.log('Today post sent to Google Business Profile!');
            console.log('It should appear on Google in 2-5 minutes.');
        } else {
            console.log('\nFAILED: Make.com returned non-200. The scenario may be OFF.');
            console.log('ACTION NEEDED: Please open https://eu1.make.com and turn the scenario ON manually.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.close();
    }
}

main();
