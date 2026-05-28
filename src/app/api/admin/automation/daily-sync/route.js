import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Journal from "@/models/Journal";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const FALLBACK_IMAGE = "https://dreamlinepro.s3.ap-south-2.amazonaws.com/1778664039968-apipu-MKS_2044.JPG";
const SITE_URL = "https://dreamlineproduction.com";

// ── Helpers ──────────────────────────────────────────────────────────────

function getISTDateString() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Authorization ────────────────────────────────────────────────────────

function isAuthorizedRequest(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const authHeader = request.headers.get("Authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";

    return (
        isVercelCron ||
        (!process.env.AUTOMATION_SECRET && !process.env.CRON_SECRET) ||
        (secret && secret === process.env.AUTOMATION_SECRET) ||
        (bearerSecret && (
            bearerSecret === process.env.AUTOMATION_SECRET ||
            bearerSecret === process.env.CRON_SECRET
        ))
    );
}

// ── Google Business Profile: Get OAuth Access Token ──────────────────────

async function getGBPAccessToken() {
    const clientId = process.env.GBP_CLIENT_ID;
    const clientSecret = process.env.GBP_CLIENT_SECRET;
    const refreshToken = process.env.GBP_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing GBP credentials: GBP_CLIENT_ID, GBP_CLIENT_SECRET, or GBP_REFRESH_TOKEN not set.");
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
        throw new Error("Google OAuth token refresh failed: " + JSON.stringify(data));
    }
    return data.access_token;
}

// ── Google Business Profile: Create Local Post ───────────────────────────

async function postToGBPDirect(post, log) {
    const accountId = process.env.GBP_ACCOUNT_ID;
    const locationId = process.env.GBP_LOCATION_ID;

    if (!accountId || !locationId) {
        throw new Error("Missing GBP_ACCOUNT_ID or GBP_LOCATION_ID in environment variables.");
    }

    log(`[GBP Direct] Getting OAuth access token...`);
    const accessToken = await getGBPAccessToken();
    log(`[GBP Direct] Access token obtained ✓`);

    const postId = post._id?.toString() || post.id;
    const publicUrl = `${SITE_URL}/journal/${postId}`;
    const summary = stripHtml(post.excerpt || post.content).substring(0, 1500) || post.title;

    // Build image URL via proxy for S3/Unsplash images
    const rawImage = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
    const imageUrl = (rawImage.includes('dreamlinepro.s3') || rawImage.includes('unsplash'))
        ? `${SITE_URL}/api/images/cover.jpg?url=${encodeURIComponent(rawImage)}`
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
    log(`[GBP Direct] Posting to: ${url}`);
    log(`[GBP Direct] Image: ${imageUrl}`);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(`GBP API ${res.status}: ${JSON.stringify(data)}`);
    }

    log(`[GBP Direct] ✅ Post created: ${data.name || 'OK'}`);
    return { method: "GBP_DIRECT", gbpPostName: data.name, data };
}

// ── Webhook Fallback (Make.com) ──────────────────────────────────────────

async function sendToWebhookFallback(post, log) {
    const webhookUrl = process.env.AUTOMATION_WEBHOOK_URL;
    if (!webhookUrl) {
        throw new Error("No AUTOMATION_WEBHOOK_URL configured for fallback.");
    }

    let imageUrl = (post.image && post.image.startsWith('http')) ? post.image : FALLBACK_IMAGE;
    const isOptimizable = imageUrl.includes('dreamlinepro.s3') || imageUrl.includes('unsplash.com');
    if (isOptimizable) {
        imageUrl = `${SITE_URL}/api/images/cover.jpg?url=${encodeURIComponent(imageUrl)}`;
    }

    const postSummary = stripHtml(post.excerpt || post.content).substring(0, 1500);
    const publicUrl = `${SITE_URL}/journal/${post._id || post.id}`;

    const payload = {
        type: 'JOURNAL_POST',
        action: 'AUTOMATED_SYNC',
        title: post.title,
        summary: postSummary,
        sourceUrl: imageUrl,
        url: publicUrl,
        post: {
            _id: post._id,
            title: post.title,
            date: post.date,
            category: post.category || "Wedding",
            image: imageUrl,
            summary: postSummary,
            publicUrl: publicUrl,
            excerpt: post.excerpt || postSummary.substring(0, 300)
        }
    };

    log(`[Webhook Fallback] Sending to Make.com...`);

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook ${response.status}: ${errorText}`);
    }

    log(`[Webhook Fallback] ✅ Make.com accepted the payload`);
    return { method: "WEBHOOK_FALLBACK" };
}

// ── Post with Retry: Direct GBP first, then Webhook fallback ─────────────

async function postWithRetry(post, log) {
    // Strategy: Try direct GBP API first (no middleman). If that fails, fall back to Make.com webhook.

    // ── Attempt 1: Direct Google Business Profile API ────────────
    const hasGBPCredentials = process.env.GBP_CLIENT_ID && process.env.GBP_CLIENT_SECRET &&
                              process.env.GBP_REFRESH_TOKEN && process.env.GBP_ACCOUNT_ID &&
                              process.env.GBP_LOCATION_ID;

    if (hasGBPCredentials) {
        try {
            const result = await postToGBPDirect(post, log);
            return { success: true, ...result };
        } catch (err) {
            log(`[DailySync] ⚠️ Direct GBP failed: ${err.message}`);
            log(`[DailySync] Falling back to Make.com webhook...`);
            await sleep(2000);
        }
    } else {
        log(`[DailySync] ⚠️ GBP credentials not configured — skipping direct API, using webhook.`);
    }

    // ── Attempt 2: Make.com Webhook (fallback) ───────────────────
    if (process.env.AUTOMATION_WEBHOOK_URL) {
        try {
            const result = await sendToWebhookFallback(post, log);
            return { success: true, ...result };
        } catch (err) {
            log(`[DailySync] ❌ Webhook fallback also failed: ${err.message}`);
            // One more retry after 2s
            await sleep(2000);
            try {
                log(`[DailySync] Retrying webhook (last attempt)...`);
                const result = await sendToWebhookFallback(post, log);
                return { success: true, ...result };
            } catch (retryErr) {
                log(`[DailySync] ❌ Final retry failed: ${retryErr.message}`);
            }
        }
    }

    return { success: false, error: "All posting methods failed." };
}

// ── Main Handler ─────────────────────────────────────────────────────────

export async function GET(request) {
    const startTime = Date.now();
    const logs = [];
    const log = (msg) => { console.log(msg); logs.push(msg); };

    try {
        if (!isAuthorizedRequest(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const isDryRun = searchParams.get("dryRun") === "true";

        await dbConnect();

        const todayStr = getISTDateString();
        log(`[DailySync] ═══════════════════════════════════════════════`);
        log(`[DailySync] Date (IST): ${todayStr} | UTC: ${new Date().toISOString()}`);
        log(`[DailySync] Mode: ${isDryRun ? '🧪 DRY RUN' : '🚀 LIVE'}`);
        log(`[DailySync] GBP Direct: ${process.env.GBP_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
        log(`[DailySync] Webhook: ${process.env.AUTOMATION_WEBHOOK_URL ? '✓ Configured' : '✗ Not configured'}`);

        // ── Find today's pending post ────────────────────────────────
        const post = await Journal.findOne({
            date: todayStr,
            googleBusinessSync: { $ne: "SYNCED" }
        });

        if (!post) {
            log(`[DailySync] No pending post for ${todayStr}.`);
            return NextResponse.json({
                success: true,
                status: "NO_PENDING_POST",
                date: todayStr,
                message: `No pending post for today (${todayStr}).`,
                logs,
                durationMs: Date.now() - startTime
            });
        }

        log(`[DailySync] Found: "${post.title}" | Status: ${post.googleBusinessSync}`);

        // ── Dry Run ──────────────────────────────────────────────────
        if (isDryRun) {
            log(`[DailySync] DRY RUN — not posting. Payload preview ready.`);
            return NextResponse.json({
                success: true,
                status: "DRY_RUN",
                date: todayStr,
                post: { title: post.title, id: post._id, image: post.image, category: post.category },
                gbpConfigured: !!process.env.GBP_CLIENT_ID,
                webhookConfigured: !!process.env.AUTOMATION_WEBHOOK_URL,
                logs,
                durationMs: Date.now() - startTime
            });
        }

        // ── Post (Direct GBP → Webhook fallback) ─────────────────────
        const result = await postWithRetry(post, log);

        if (!result.success) {
            post.googleBusinessSync = "FAILED";
            post.lastSyncedAt = new Date();
            await post.save();

            log(`[DailySync] ❌ ALL METHODS FAILED`);
            return NextResponse.json({
                success: false,
                status: "FAILED",
                date: todayStr,
                error: result.error,
                post: { title: post.title, id: post._id },
                logs,
                durationMs: Date.now() - startTime
            }, { status: 502 });
        }

        // ── Success ──────────────────────────────────────────────────
        post.googleBusinessSync = "SYNCED";
        post.lastSyncedAt = new Date();
        await post.save();

        log(`[DailySync] ✅ SUCCESS via ${result.method}`);

        return NextResponse.json({
            success: true,
            status: "SYNCED",
            method: result.method,
            date: todayStr,
            message: `Published: ${post.title}`,
            post: { title: post.title, id: post._id },
            gbpPostName: result.gbpPostName || null,
            logs,
            durationMs: Date.now() - startTime
        });

    } catch (error) {
        log(`[DailySync] 💀 FATAL: ${error.message}`);
        console.error("[DailySync] Stack:", error.stack);
        return NextResponse.json({
            success: false,
            status: "ERROR",
            error: error.message,
            logs,
            durationMs: Date.now() - startTime
        }, { status: 500 });
    }
}
