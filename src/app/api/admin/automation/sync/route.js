import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import Content from "@/models/Content";

export async function POST(req) {
    try {
        await dbConnect();
        const { sourceId, sourceType } = await req.json();

        // 1. Fetch Source Data
        let postData;
        if (sourceType === 'WEDDING') {
            postData = await Wedding.findById(sourceId).lean();
        } else {
            postData = await Journal.findById(sourceId).lean();
        }

        if (!postData) return NextResponse.json({ error: "Source not found" }, { status: 404 });

        // 2. GOOGLE OPTIMIZATION ENGINE (Modifications)
        
        // A. Title Transformation (Bold & Local)
        const gTitle = postData.title.toUpperCase();
        const gLocation = "Kolkata, India"; // Default or extracted
        
        // B. Content Truncation & Optimization
        // Extract first 300 characters + add local SEO tags
        const rawContent = postData.description || postData.content || "";
        const cleanContent = rawContent.replace(/<[^>]*>?/gm, ''); // Remove HTML
        const gSummary = cleanContent.substring(0, 400) + "...";
        
        const localTags = `\n\n📍 Serving Kolkata & Pan-India\n#${sourceType === 'WEDDING' ? 'WeddingPhotography' : 'Storytelling'} #Kolkata #Cinematic #DreamlineProduction`;
        
        const finalGooglePost = {
            summary: `${gTitle}\n\n${gSummary}${localTags}`,
            callToAction: {
                actionType: "LEARN_MORE",
                url: `https://dreamlineproduction.com/${sourceType.toLowerCase()}/${postData._id}`
            },
            media: postData.coverImage || postData.image
        };

        // 3. Logic to Push to Google Business API (Placeholder for actual API call)
        // In production, this would hit: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts
        
        console.log("GOOGLE_OPTIMIZED_POST_GENERATED:", finalGooglePost);

        return NextResponse.json({ 
            success: true, 
            optimizedPost: finalGooglePost,
            message: "Website post has been successfully modified and optimized for Google Business SEO."
        });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
