import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ══════════════════════════════════════════════════════════════════════════
// DEPRECATED: Google My Business API v4 was shut down by Google in 2022.
// The endpoint https://mybusiness.googleapis.com/v4/.../localPosts no longer works.
//
// All auto-posting is now handled by:
//   /api/admin/automation/daily-sync → Make.com webhook → Google Business Profile
//
// This route is kept only as a helpful error endpoint.
// ══════════════════════════════════════════════════════════════════════════

export async function GET() {
    return NextResponse.json({
        success: false,
        status: "DEPRECATED",
        message: "This endpoint used the Google My Business API v4 which was shut down in 2022. " +
                 "Auto-posting is now handled by /api/admin/automation/daily-sync via the Make.com webhook. " +
                 "Please use that endpoint instead.",
        migrationGuide: {
            cronEndpoint: "/api/admin/automation/daily-sync",
            manualTrigger: "/api/admin/automation/daily-sync?secret=YOUR_SECRET",
            dryRun: "/api/admin/automation/daily-sync?secret=YOUR_SECRET&dryRun=true"
        }
    }, { status: 410 }); // 410 Gone
}
