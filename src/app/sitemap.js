import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

    // Base static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/luxury`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/commercial`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/journal`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    try {
        // Attempt to connect to DB and fetch dynamic routes
        await dbConnect();

        // Fetch all weddings
        const weddings = await Wedding.find({}, '_id date updatedAt').lean();
        const weddingRoutes = weddings.map((w) => ({
            url: `${baseUrl}/wedding/${w._id}`,
            lastModified: w.updatedAt || w.date || new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        }));

        // Fetch all journals
        const journals = await Journal.find({}, '_id date updatedAt').lean();
        const journalRoutes = journals.map((j) => ({
            url: `${baseUrl}/journal/${j._id}`,
            lastModified: j.updatedAt || j.date || new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

        return [...staticRoutes, ...weddingRoutes, ...journalRoutes];
    } catch (error) {
        console.error("Sitemap generation error:", error);
        // If DB fails, at least return static routes
        return staticRoutes;
    }
}
