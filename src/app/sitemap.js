import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import ServicePage from "@/models/ServicePage";
import CustomPage from "@/models/CustomPage";

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
    "wedding-photography-kolkata",
    "corporate-photography-kolkata",
    "drone-videography-kolkata",
    "drone-photography-kolkata",
    "pre-wedding-shoot-kolkata",
    "rice-ceremony-photography-kolkata",
    "video-production-agency-kolkata",
];

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

    // Base static routes (with trailing slash matching next.config trailingSlash: true)
    const staticRoutes = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/luxury/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/commercial/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/locations/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blogs/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tech/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/company-details/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/privacy-policy/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/refund-policy/`,
            lastModified: new Date('2026-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Location SEO landing pages
    const locationRoutes = LOCATION_SLUGS.map((slug) => ({
        url: `${baseUrl}/locations/${slug}/`,
        lastModified: new Date('2026-10-22'),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    // Static specialized service pages (standardized /services/service-name/ structure)
    const staticServiceRoutes = STATIC_SERVICE_SLUGS.map((slug) => ({
        url: `${baseUrl}/services/${slug}/`,
        lastModified: new Date('2026-10-22'),
        changeFrequency: 'monthly',
        priority: 0.9,
    }));

    try {
        // Attempt to connect to DB and fetch dynamic routes
        await dbConnect();

        // Fetch all weddings — use custom `id` slug field, not Mongo _id
        const weddings = await Wedding.find({}, 'id date updatedAt').lean();
        const weddingRoutes = weddings
            .filter(w => w.id)
            .map((w) => ({
                url: `${baseUrl}/wedding/${w.id}/`,
                lastModified: w.updatedAt || w.date || new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            }));

        // Fetch published blogs only — exclude drafts and future scheduled posts
        const istOffset = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const istDate = new Date(now.getTime() + istOffset);
        const todayStr = istDate.toISOString().split('T')[0];

        const journals = await Journal.find({
            $and: [
                {
                    $or: [
                        { status: 'published' },
                        { status: { $exists: false } },
                        { status: null }
                    ]
                },
                {
                    $or: [
                        { date: { $lte: todayStr } },
                        { date: null },
                        { date: "" },
                        { date: { $exists: false } }
                    ]
                }
            ]
        }, 'id date updatedAt slug title status').lean();

        const journalRoutes = journals
            .filter(j => (j.slug || j.id) && !j.title?.includes('Series'))
            .map((j) => ({
                url: `${baseUrl}/blogs/${j.slug || j.id}/`,
                lastModified: j.updatedAt || j.date || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));

        // Fetch dynamic services from DB — exclude redirecting slugs and static duplicates
        const services = await ServicePage.find({}, 'slug updatedAt').lean();
        const dynamicServiceRoutes = services
            .filter(s => s.slug && s.slug !== 'pre-wedding' && !STATIC_SERVICE_SLUGS.includes(s.slug))
            .map((s) => ({
                url: `${baseUrl}/services/${s.slug}/`,
                lastModified: s.updatedAt || new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            }));

        // Fetch published custom pages — exclude drafts, scheduled for future, or noIndex
        const customPages = await CustomPage.find({
            status: 'published',
            $or: [
                { publishDate: { $lte: todayStr } },
                { publishDate: null },
                { publishDate: "" },
                { publishDate: { $exists: false } }
            ],
            'seo.noIndex': { $ne: true }
        }, 'slug updatedAt').lean();

        const customPageRoutes = customPages
            .filter(p => p.slug)
            .map((p) => ({
                url: `${baseUrl}/${p.slug}/`,
                lastModified: p.updatedAt || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));

        return [
            ...staticRoutes,
            ...locationRoutes,
            ...staticServiceRoutes,
            ...weddingRoutes,
            ...journalRoutes,
            ...dynamicServiceRoutes,
            ...customPageRoutes
        ];
    } catch (error) {
        console.error("Sitemap generation error:", error);
        return [...staticRoutes, ...locationRoutes, ...staticServiceRoutes];
    }
}
