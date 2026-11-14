import fs from 'fs';
import mongoose from 'mongoose';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);
if (!match) process.exit(1);
const uri = match[1].trim();

async function updateGmb() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const gmbUpdate = {
        "global.company.name": "Dreamline Production",
        "global.contact.address": "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082",
        "global.google.businessName": "Dreamline Production",
        "global.google.profileUrl": "https://maps.app.goo.gl/xRnnVxWCbLFWo8oT9",
        "global.google.mapsUrl": "https://www.google.com/maps/place/Dreamline+Production/@22.4850486,88.3313873,17z/data=!4m6!3m5!1s0x3a027090db628e8f:0x3b8514dce7da523b!8m2!3d22.4850486!4d88.3339622!16s%2Fg%2F11hb2thsvp",
        "global.google.directionsUrl": "https://www.google.com/maps/dir/?api=1&destination=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&destination_place_id=ChIJj45i25BwAjoRO1La59wUhTs",
        "global.google.embedCode": "https://maps.google.com/maps?q=Dreamline+Production,+85,+Tilottama+Plaza,+Tower+2,+First+Floor,+Karunamoyee+Ghat+Road,+Kolkata,+West+Bengal+700082&t=&z=16&ie=UTF8&iwloc=&output=embed",
        "global.google.reviewsUrl": "https://search.google.com/local/writereview?placeid=ChIJj45i25BwAjoRO1La59wUhTs",
        "global.google.placeId": "ChIJj45i25BwAjoRO1La59wUhTs",
        "global.google.mapEnabled": true
    };

    const res = await db.collection('contents').updateOne({}, { $set: gmbUpdate });
    console.log("Updated contents with GMB profile:", res.modifiedCount);

    await mongoose.disconnect();
}

updateGmb().catch(console.error);
