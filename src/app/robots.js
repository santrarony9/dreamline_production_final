export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamlineproduction.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Prevent crawling of admin and api routes
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
