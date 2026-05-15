import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Booking from "@/models/Booking";
import Intelligence from "@/models/Intelligence";
import Content from "@/models/Content";

export async function GET() {
    try {
        await dbConnect();

        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // 1. Fetch Data
        const [todayStats, yesterdayStats, todayBookings] = await Promise.all([
            Analytics.aggregate([
                { $match: { date: today } },
                { $group: { _id: null, views: { $sum: "$views" }, seo: { $sum: "$googleViews" } } }
            ]),
            Analytics.aggregate([
                { $match: { date: yesterday } },
                { $group: { _id: null, views: { $sum: "$views" }, seo: { $sum: "$googleViews" } } }
            ]),
            Booking.countDocuments({ 
                createdAt: { 
                    $gte: new Date(new Date().setHours(0,0,0,0)),
                    $lt: new Date(new Date().setHours(23,59,59,999))
                } 
            })
        ]);

        const tViews = todayStats[0]?.views || 0;
        const tSeo = todayStats[0]?.seo || 0;
        const yViews = yesterdayStats[0]?.views || 0;
        const growth = yViews === 0 ? 100 : Math.round(((tViews - yViews) / yViews) * 100);

        // 2. Generate Insights
        const insights = [];
        const actionItems = [];

        // SEO Insight
        if (tSeo > 0) {
            insights.push({
                type: 'WIN',
                message: `Organic Google traffic is active. ${tSeo} visitors found you via search today.`,
                priority: 'MEDIUM'
            });
        } else if (tViews > 10) {
            insights.push({
                type: 'ISSUE',
                message: "High direct traffic but zero Google Reach. Your SEO might need a refresh.",
                priority: 'HIGH'
            });
            actionItems.push("Check 'Wedding Photographer Kolkata' keyword placement in Meta Tags.");
        }

        // Conversion Insight
        if (tViews > 20 && todayBookings === 0) {
            insights.push({
                type: 'OPPORTUNITY',
                message: `${tViews} people visited today but no inquiries were sent. Consider a limited-time offer.`,
                priority: 'HIGH'
            });
            actionItems.push("Add a 'Special Wedding Package' banner to the Home Page.");
        }

        // 3. Save Report
        const report = await Intelligence.findOneAndUpdate(
            { date: today },
            {
                summary: `Daily audit completed for ${today}. Overall growth is ${growth}%.`,
                stats: {
                    totalViews: tViews,
                    seoViews: tSeo,
                    conversions: todayBookings,
                    growth: growth
                },
                insights,
                actionItems
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Automation error:", error);
        return NextResponse.json({ error: "Audit failed" }, { status: 500 });
    }
}
