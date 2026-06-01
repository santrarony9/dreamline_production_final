import { MongoClient } from 'mongodb';

async function run() {
    const client = new MongoClient("mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0");
    try {
        await client.connect();
        const db = client.db();
        
        // Add a subcategory to the first service
        await db.collection('contents').updateOne(
            {},
            { $set: { "home.services.0.subcategories": ["Pre-Wedding", "Destination Wedding"] } }
        );
        
        console.log("Subcategories added to DB.");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
