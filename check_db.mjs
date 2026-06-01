import { MongoClient } from 'mongodb';

async function run() {
    const client = new MongoClient("mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0");
    try {
        await client.connect();
        const db = client.db();
        const content = await db.collection('contents').findOne({});
        console.log("Services in DB:", JSON.stringify(content?.home?.services, null, 2));
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
