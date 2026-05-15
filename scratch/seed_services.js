
const mongoose = require('mongoose');

async function seedServices() {
    try {
        await mongoose.connect('mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0');
        const Content = mongoose.model('Content', new mongoose.Schema({}, { strict: false }));
        const content = await Content.findOne();
        
        if (!content) {
            console.log("No content document found.");
            process.exit(1);
        }

        const defaultServices = [
            {
                number: "01",
                title: "WEDDING CINEMA",
                category: "wedding",
                priceHint: "Luxury Cinematic Experiences",
                subcategories: ["Cinematography", "Photography", "Pre-Wedding", "Narrative Films"]
            },
            {
                number: "02",
                title: "COMMERCIAL ADS",
                category: "commercial",
                priceHint: "Brand Narrative & TVC",
                subcategories: ["TVC", "Brand Films", "Corporate", "Documentaries"]
            },
            {
                number: "03",
                title: "TECH SOLUTIONS",
                category: "tech",
                priceHint: "Next-Gen Visual Tech",
                subcategories: ["3D Visualization", "Drone Mapping", "Live Stream", "VR Tours"]
            }
        ];

        // Update the document
        content.services = defaultServices;
        await content.save();
        
        console.log("Services seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seedServices();
