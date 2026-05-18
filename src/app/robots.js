export default function robots() {
    // Only allow indexing on the primary production domain
    const isProduction = process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com' || 
                         process.env.VERCEL_ENV === 'production';

    return {
        rules: [
            {
                // Always allow social sharing bots to scrape content for high-fidelity link previews
                userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp'],
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                // General rule for all other search engines (Google, Bing, etc.)
                userAgent: '*',
                allow: isProduction ? '/' : [],
                disallow: isProduction ? ['/admin/', '/api/'] : '/',
            }
        ],
        sitemap: `https://dreamlineproduction.com/sitemap.xml`,
    };
}
