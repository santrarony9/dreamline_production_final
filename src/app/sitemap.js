import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import ServicePage from "@/models/ServicePage";

const LOCATION_SLUGS = [
    "wedding-photographer-salt-lake-kolkata",
    "wedding-photographer-new-town-kolkata",
    "wedding-photographer-howrah",
    "pre-wedding-shoot-kolkata",
    "corporate-film-production-salt-lake",
    "drone-photography-kolkata",
    "wedding-photographer-park-street-kolkata",
    "wedding-photographer-ballygunge-kolkata",
];

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

    // Base static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date('2026-06-01'),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/luxury`,
            lastModified: new Date('2026-06-01'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/commercial`,
            lastModified: new Date('2026-06-01'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date('2026-09-22'),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tech`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/company-details`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/refund-policy`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Location SEO landing pages (static, no DB needed)
    const locationRoutes = LOCATION_SLUGS.map((slug) => ({
        url: `${baseUrl}/locations/${slug}`,
        lastModified: new Date('2026-09-22'),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    try {
        // Attempt to connect to DB and fetch dynamic routes
        await dbConnect();

        // Fetch all weddings — use custom `id` slug field, not Mongo _id
        const weddings = await Wedding.find({}, 'id date updatedAt').lean();
        const weddingRoutes = weddings
            .filter(w => w.id)
            .map((w) => ({
                url: `${baseUrl}/wedding/${w.id}`,
                lastModified: w.updatedAt || w.date || new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            }));

        // Fetch all journals — use custom `id` slug field, not Mongo _id
        const journals = await Journal.find({}, 'id date updatedAt slug').lean();
        const journalRoutes = journals
            .filter(j => j.slug || j.id)
            .map((j) => ({
                url: `${baseUrl}/blogs/${j.slug || j.id}`,
                lastModified: j.updatedAt || j.date || new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            }));

        // Fetch all services
        const services = await ServicePage.find({}, 'slug updatedAt').lean();
        const serviceRoutes = services
            .filter(s => s.slug)
            .map((s) => ({
                url: `${baseUrl}/services/${s.slug}`,
                lastModified: s.updatedAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            }));

        return [...staticRoutes, ...locationRoutes, ...weddingRoutes, ...journalRoutes, ...serviceRoutes];
    } catch (error) {
        console.error("Sitemap generation error:", error);
        // If DB fails, at least return static routes + location routes
        return [...staticRoutes, ...locationRoutes];
    }
}
