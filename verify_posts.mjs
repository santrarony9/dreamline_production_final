import mongoose from 'mongoose';

const uri = 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
    await mongoose.connect(uri);
    const Journal = mongoose.model('Journal', new mongoose.Schema({}, { strict: false }));
    
    const count = await Journal.countDocuments();
    const today = '2026-06-12';
    const future = await Journal.find({ date: { $gt: today } }).sort({ date: 1 }).select('title date category id seo googleBusinessSync excerpt').lean();
    
    console.log(`\n📊 TOTAL JOURNAL POSTS IN DATABASE: ${count}`);
    console.log(`📅 FUTURE SCHEDULED POSTS: ${future.length}\n`);
    console.log('='.repeat(80));
    
    let missingId = 0, missingSeo = 0, missingExcerpt = 0;
    
    future.forEach((p, i) => {
        const hasId = p.id ? '✅' : '❌';
        const hasSeoTitle = p.seo?.title ? '✅' : '❌';
        const hasSeoDesc = p.seo?.description ? '✅' : '❌';
        const hasSeoKeys = p.seo?.keywords ? '✅' : '❌';
        const hasExcerpt = p.excerpt ? '✅' : '❌';
        
        if (!p.id) missingId++;
        if (!p.seo?.title || !p.seo?.description) missingSeo++;
        if (!p.excerpt) missingExcerpt++;
        
        console.log(`\n${i + 1}. [${p.date}] ${p.category}`);
        console.log(`   📌 ${p.title}`);
        console.log(`   ID: ${hasId} ${p.id || 'NONE'}`);
        console.log(`   SEO Title: ${hasSeoTitle} | Description: ${hasSeoDesc} | Keywords: ${hasSeoKeys}`);
        console.log(`   Excerpt: ${hasExcerpt} | Sync: ${p.googleBusinessSync}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 HEALTH CHECK SUMMARY:');
    console.log(`   Total future posts: ${future.length}`);
    console.log(`   Missing ID: ${missingId}`);
    console.log(`   Missing SEO: ${missingSeo}`);
    console.log(`   Missing Excerpt: ${missingExcerpt}`);
    console.log(`   All PENDING sync: ${future.every(p => p.googleBusinessSync === 'PENDING') ? '✅ YES' : '❌ NO'}`);
    
    // Check Make.com webhook payload format
    if (future.length > 0) {
        const sample = future[0];
        console.log('\n📡 SAMPLE MAKE.COM WEBHOOK PAYLOAD:');
        console.log(JSON.stringify({
            type: 'JOURNAL_POST',
            action: 'CREATE',
            post: {
                _id: sample._id,
                title: sample.title,
                date: sample.date,
                category: sample.category || "Wedding",
                image: "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG",
                summary: (sample.excerpt || '').substring(0, 1500),
                publicUrl: `https://dreamlineproduction.com/journal/${sample.id || sample._id}`,
                excerpt: sample.excerpt || ''
            }
        }, null, 2));
    }
    
    await mongoose.disconnect();
}

check();
