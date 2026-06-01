import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    home: {
        services: [{
            title: String,
            description: String,
            number: String,
            priceHint: String,
            category: { type: String, enum: ['wedding', 'commercial', 'tech', 'other'], default: 'wedding' },
            subcategories: [String]
        }]
    }
});
const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

async function testPost() {
    await mongoose.connect("mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0");
    
    try {
        const updateData = {
            "home.services": [
                {
                    title: "LUXURY WEDDINGS",
                    number: "01",
                    priceHint: "Premium Packages Start at ₹85,000",
                    category: "wedding",
                    subcategories: ["Pre-Wedding Shoot", "Cinematic Film"]
                }
            ]
        };
        
        await Content.findOneAndUpdate(
            {},
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );
        
        const content = await Content.findOne().lean();
        console.log("Services after update:", JSON.stringify(content.home.services, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}
testPost().catch(console.error);
