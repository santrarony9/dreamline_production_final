const https = require('https');
const { URL } = require('url');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
const WEBHOOK_URL = 'https://hook.eu1.make.com/kqorky35l699m65mla8dzcut3alkczg7';

async function triggerDirect() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        const db = client.db('dreamline');
        const journals = db.collection('journals');
        
        const todayStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log('Today (IST):', todayStr);
        
        const post = await journals.findOne({ date: todayStr });
        if (!post) { 
            console.log('No post found for today!'); 
            await client.close();
            return; 
        }
        
        console.log('Post found:', post.title);
        
        const rawImage = post.image && post.image.startsWith('http')
            ? post.image
            : 'https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG';
        
        const imageUrl = rawImage.includes('dreamlinepro.s3') || rawImage.includes('unsplash.com')
            ? 'https://dreamlineproduction.com/api/images/cover.jpg?url=' + encodeURIComponent(rawImage)
            : rawImage;
        
        const postId = post._id ? post._id.toString() : post.id;
        const publicUrl = 'https://dreamlineproduction.com/journal/' + postId;
        
        const stripHtml = (html) => (html || '').replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();
        
        const payload = JSON.stringify({
            type: 'JOURNAL_POST',
            action: 'AUTOMATED_SYNC',
            post: {
                _id: postId,
                title: post.title,
                date: post.date,
                category: post.category || 'Studio',
                image: imageUrl,
                summary: stripHtml(post.excerpt || post.content).substring(0, 1500),
                publicUrl: publicUrl,
                excerpt: stripHtml(post.excerpt || post.title).substring(0, 300)
            }
        });
        
        console.log('\n--- PAYLOAD BEING SENT ---');
        console.log('Title:', post.title);
        console.log('Public URL:', publicUrl);
        console.log('Image URL:', imageUrl.substring(0, 100) + '...');
        console.log('\nSending to Make.com webhook...');
        
        const webhookUrl = new URL(WEBHOOK_URL);
        const options = {
            hostname: webhookUrl.hostname,
            path: webhookUrl.pathname,
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Content-Length': Buffer.byteLength(payload) 
            }
        };
        
        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', async () => {
                    console.log('\nMake.com HTTP Status:', res.statusCode);
                    console.log('Make.com Response:', data);
                    
                    if (res.statusCode === 200 || res.statusCode === 202) {
                        await journals.updateOne(
                            { _id: post._id },
                            { $set: { googleBusinessSync: 'SYNCED', lastSyncedAt: new Date() } }
                        );
                        console.log('\nDatabase updated: googleBusinessSync = SYNCED');
                        console.log('SUCCESS! Today post sent to Google Business Profile!');
                        console.log('Check your Google Business Profile in 2-3 minutes.');
                    } else {
                        console.log('\nWARNING: Non-200 response from Make.com.');
                        console.log('The Make.com scenario may be paused or inactive.');
                        console.log('Please open https://eu1.make.com and check if the scenario is ON.');
                    }
                    await client.close();
                    resolve();
                });
            });
            req.on('error', async (e) => { 
                console.error('Request error:', e.message); 
                await client.close();
                resolve();
            });
            req.write(payload);
            req.end();
        });
        
    } catch(e) {
        console.error('Error:', e.message);
        await client.close();
    }
}

triggerDirect();
