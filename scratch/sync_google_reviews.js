const { MongoClient } = require('mongodb');
const axios = require('axios');

async function main() {
    const uri = "mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB Atlas...");
        const db = client.db("dreamline");
        const contentCollection = db.collection("contents");
        
        const content = await contentCollection.findOne();
        if (!content || !content.global?.google?.placeId || !content.global?.google?.mapsApiKey) {
            console.log("Google Configuration Missing in contents collection!");
            return;
        }

        const { placeId, mapsApiKey } = content.global.google;
        console.log("Found Place ID:", placeId);
        console.log("Fetching live, genuine reviews from Google Places API...");

        // Call Google Places Details API
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${mapsApiKey}`
        );

        const result = response.data.result;
        
        if (response.data.status !== "OK" || !result) {
            console.error("Google API returned an error:", response.data.status, response.data.error_message || "");
            return;
        }

        if (!result.reviews || result.reviews.length === 0) {
            console.log("No reviews found for this business on Google Places.");
            return;
        }

        console.log(`Successfully fetched ${result.reviews.length} genuine reviews from Google!`);

        // Map Google reviews to our internal schema
        const realReviews = result.reviews.map(r => ({
            author: r.author_name,
            text: r.text,
            rating: r.rating,
            initial: r.author_name.charAt(0),
            role: "Verified Google Reviewer",
            source: "Google",
            avatar: r.profile_photo_url || null
        }));

        // Update the content model
        const updateData = {
            "home.reviews.list": realReviews,
            "home.reviews.averageRating": result.rating.toString(),
            "home.reviews.totalReviewsText": `${result.user_ratings_total} GOOGLE REVIEWS`
        };

        console.log("Writing genuine reviews to your live database...");
        await contentCollection.updateOne({}, { $set: updateData });
        console.log("Database update successful!");

        console.log("\n--- NEW REVIEWS IN YOUR DATABASE ---");
        realReviews.forEach((r, idx) => {
            console.log(`[Review ${idx + 1}] Author: "${r.author}", Rating: ${r.rating}, Text: "${r.text.substring(0, 100)}..."`);
        });

    } catch (e) {
        console.error("Sync execution failed:", e.message);
    } finally {
        await client.close();
    }
}

main();
