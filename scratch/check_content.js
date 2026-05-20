const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB Atlas...");
        const db = client.db("dreamline");
        const contentCollection = db.collection("contents");
        
        const content = await contentCollection.findOne();
        if (!content) {
            console.log("No content document found in contents collection!");
            return;
        }

        console.log("\n--- GOOGLE CONFIG STATUS ---");
        console.log("Google Configuration in DB:");
        console.log("Place ID:", content.global?.google?.placeId || "MISSING");
        console.log("Maps API Key:", content.global?.google?.mapsApiKey ? "PRESENT (SECURED)" : "MISSING");

        console.log("\n--- REVIEWS CURRENTLY IN DB ---");
        const reviews = content.home?.reviews;
        if (!reviews) {
            console.log("No reviews field found under content.home!");
        } else {
            console.log("Average Rating:", reviews.averageRating);
            console.log("Total Reviews Text:", reviews.totalReviewsText);
            console.log("Number of Reviews in list:", reviews.list?.length || 0);
            if (reviews.list && reviews.list.length > 0) {
                console.log("\nList of reviews in DB:");
                reviews.list.forEach((r, idx) => {
                    console.log(`[Review ${idx + 1}] Author: "${r.author}", Rating: ${r.rating}, Text: "${r.text.substring(0, 80)}..."`);
                });
            } else {
                console.log("Review list is EMPTY.");
            }
        }

    } catch (e) {
        console.error("Database connection failed:", e);
    } finally {
        await client.close();
    }
}

main();
