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

const STATIC_SERVICE_SLUGS = [
    "rice-ceremony-photography-kolkata",
    "video-production-agency-kolkata",
    "drone-photography-kolkata",
    "pre-wedding-shoot-kolkata",
];

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

    // Base static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date('2026-01-01'),
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
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/locations`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.7,
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

    // Location SEO landing pages
    const locationRoutes = LOCATION_SLUGS.map((slug) => ({
        url: `${baseUrl}/locations/${slug}`,
        lastModified: new Date('2026-10-22'),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    // Static specialized service pages
    const staticServiceRoutes = STATIC_SERVICE_SLUGS.map((slug) => ({
        url: `${baseUrl}/services/${slug}`,
        lastModified: new Date('2026-10-22'),
        changeFrequency: 'monthly',
        priority: 0.8,
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

        // Fetch all journals — use clean slug or custom `id`
        const journals = await Journal.find({}, 'id date updatedAt slug').lean();
        const journalRoutes = journals
            .filter(j => (j.slug || j.id) && !j.title?.includes('Series'))
            .map((j) => ({
                url: `${baseUrl}/blogs/${j.slug || j.id}`,
                lastModified: j.updatedAt || j.date || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));

        // Fetch dynamic services from DB — exclude redirecting slugs and static duplicates
        const services = await ServicePage.find({}, 'slug updatedAt').lean();
        const dynamicServiceRoutes = services
            .filter(s => s.slug && s.slug !== 'pre-wedding' && !STATIC_SERVICE_SLUGS.includes(s.slug))
            .map((s) => ({
                url: `${baseUrl}/services/${s.slug}`,
                lastModified: s.updatedAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            }));

        return [
            ...staticRoutes,
            ...locationRoutes,
            ...staticServiceRoutes,
            ...weddingRoutes,
            ...journalRoutes,
            ...dynamicServiceRoutes
        ];
    } catch (error) {
        console.error("Sitemap generation error:", error);
        return [...staticRoutes, ...locationRoutes, ...staticServiceRoutes];
    }
}
