import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const content = await Content.findOne();
    
    if (!content || !content.global?.google?.placeId || !content.global?.google?.mapsApiKey) {
        return NextResponse.json({ 
            error: "Google Configuration Missing. Please ensure Place ID and Maps API Key are saved in Global Settings." 
        }, { status: 400 });
    }

    const { placeId, mapsApiKey } = content.global.google;

    try {
        // Call Google Places Details API
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${mapsApiKey}`
        );

        const result = response.data.result;
        
        if (response.data.status !== "OK" || !result) {
            return NextResponse.json({ 
                error: `Google API Error: ${response.data.status}. ${response.data.error_message || "Invalid Place ID or API Key."}` 
            }, { status: 400 });
        }

        if (!result.reviews || result.reviews.length === 0) {
            return NextResponse.json({ error: "No reviews found for this business on Google." }, { status: 404 });
        }

        // Map Google reviews to our internal schema
        const realReviews = result.reviews.map(r => ({
            author: r.author_name,
            text: r.text,
            rating: r.rating,
            initial: r.author_name.charAt(0),
            role: "Verified Google Reviewer"
        }));

        // Update the content model
        const updateData = {
            "home.reviews.list": realReviews,
            "home.reviews.averageRating": result.rating.toString(),
            "home.reviews.totalReviewsText": `${result.user_ratings_total} GOOGLE REVIEWS`
        };

        await Content.findOneAndUpdate({}, { $set: updateData });

        return NextResponse.json({ 
            success: true, 
            count: realReviews.length,
            averageRating: result.rating,
            totalReviews: result.user_ratings_total
        });

    } catch (err) {
        console.error("Sync Error:", err);
        return NextResponse.json({ error: "Sync failed: " + err.message }, { status: 500 });
    }
}
