import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined.');
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const navCol = db.collection('navigationitems');

    await navCol.updateOne(
        { group: 'SOCIAL', url: '/services/birthday-photography-kolkata/' },
        { $set: { description: 'MILESTONE CELEBRATIONS' } }
    );
    await navCol.updateOne(
        { group: 'SOCIAL', url: '/services/rice-ceremony-photography-kolkata/' },
        { $set: { description: 'SACRED ANNAPRASHAN RITUALS' } }
    );
    await navCol.updateOne(
        { group: 'SOCIAL', url: '/services/other-social-events-kolkata/' },
        { $set: { description: 'ANNIVERSARIES, CULTURAL AND FAMILY EVENTS' } }
    );

    const socialItems = await navCol.find({ group: 'SOCIAL' }).toArray();
    console.log('Updated Social Items:');
    socialItems.forEach(it => console.log(it.title, '=>', it.description));
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
