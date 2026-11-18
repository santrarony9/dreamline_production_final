import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined.');
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const navCol = db.collection('navigationitems');

    const result = await navCol.updateOne(
        { group: 'TECH', url: '/tech' },
        { 
            $set: { 
                title: 'Website',
                badge: '',
                description: 'MODERN RESPONSIVE WEB DESIGN, PORTFOLIO SHOWCASES & CUSTOM WEB APPLICATIONS' 
            } 
        }
    );

    const updated = await navCol.findOne({ group: 'TECH', url: '/tech' });
    console.log('Updated TECH in DB:', updated.title, '| badge:', JSON.stringify(updated.badge), '| desc:', updated.description);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
