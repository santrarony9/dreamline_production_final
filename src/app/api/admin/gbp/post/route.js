import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";

export const dynamic = 'force-dynamic';

const GBP_ACCOUNT = process.env.GBP_ACCOUNT_ID; // e.g. "accounts/112829091342424319410"
const GBP_LOCATION = process.env.GBP_LOCATION_ID; // e.g. "locations/12345678"

async function getAccessToken() {
    const clientId = process.env.GBP_CLIENT_ID;
    const clientSecret = process.env.GBP_CLIENT_SECRET;
    const refreshToken = process.env.GBP_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("GBP_CLIENT_ID, GBP_CLIENT_SECRET, or GBP_REFRESH_TOKEN not set in Vercel environment variables.");
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    const data = await res.json();
    if (!data.access_token) {
        throw new Error("Failed to get access token: " + JSON.stringify(data));
    }
    return data.access_token;
}

async function postToGBP(accessToken, post) {
    const accountId = GBP_ACCOUNT;
    const locationId = GBP_LOCATION;

    if (!accountId || !locationId) {
        throw new Error("GBP_ACCOUNT_ID or GBP_LOCATION_ID not set in Vercel environment variables.");
    }

    const stripHtml = (html) => (html || '').replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();

    const postId = post._id?.toString() || post.id;
    const publicUrl = `https://dreamlineproduction.com/journal/${postId}`;
    const summary = stripHtml(post.excerpt || post.content).substring(0, 1500) || post.title;

    // Build image URL via proxy
    const rawImage = (post.image && post.image.startsWith('http')) ? post.image
        : 'https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG';
    const imageUrl = (rawImage.includes('dreamlinepro.s3') || rawImage.includes('unsplash'))
        ? `https://dreamlineproduction.com/api/images/cover.jpg?url=${encodeURIComponent(rawImage)}`
        : rawImage;

    const body = {
        languageCode: "en-US",
        summary: summary.substring(0, 1500),
        callToAction: {
            actionType: "LEARN_MORE",
            url: publicUrl
        },
        media: [{
            mediaFormat: "PHOTO",
            sourceUrl: imageUrl
        }],
        topicType: "STANDARD"
    };

    const url = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/localPosts`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`GBP API error ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
}

export async function GET(request) {
    try {
        // Authorize: Accept Vercel cron header or secret
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const authHeader = request.headers.get("Authorization");
        const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
        const isVercelCron = request.headers.get("x-vercel-cron") === "1";

        const isAuthorized =
            isVercelCron ||
            (!process.env.AUTOMATION_SECRET && !process.env.CRON_SECRET) ||
            (secret && secret === process.env.AUTOMATION_SECRET) ||
            (bearerSecret && (bearerSecret === process.env.AUTOMATION_SECRET || bearerSecret === process.env.CRON_SECRET));

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        const todayStr = istDate.toISOString().split('T')[0];

        const post = await Journal.findOne({
            date: todayStr,
            googleBusinessSync: { $ne: "SYNCED" }
        });

        if (!post) {
            return NextResponse.json({
                success: true,
                message: `No pending post for today (${todayStr}). Already synced or not scheduled.`
            });
        }

        console.log(`[GBP Direct] Posting: ${post.title}`);

        const accessToken = await getAccessToken();
        const result = await postToGBP(accessToken, post);

        post.googleBusinessSync = "SYNCED";
        post.lastSyncedAt = new Date();
        await post.save();

        console.log(`[GBP Direct] SUCCESS: ${post.title}`);

        return NextResponse.json({
            success: true,
            message: `Published to Google Business Profile: ${post.title}`,
            gbpPostName: result.name
        });

    } catch (error) {
        console.error("[GBP Direct] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
