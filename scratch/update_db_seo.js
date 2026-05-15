const mongoose = require('mongoose');

const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";

async function updateDb() {
    try {
        await mongoose.connect(uri);
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        
        const fullAddress = "85 Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road. Kolkata 700082";
        const panIndiaTitle = "Dreamline Production | Best Wedding Photographer in Kolkata & Pan-India";
        const panIndiaDesc = "Premier cinematic visual house in Kolkata, offering luxury wedding photography and commercial films across India.";
        
        const result = await Content.updateOne(
            {}, 
            { 
                $set: { 
                    "global.contact.address": fullAddress,
                    "global.seo.title": panIndiaTitle,
                    "global.seo.description": panIndiaDesc
                } 
            }
        );
        
        console.log("Database updated successfully:", result);
        process.exit(0);
    } catch (err) {
        console.error("Database update failed:", err);
        process.exit(1);
    }
}

updateDb();
