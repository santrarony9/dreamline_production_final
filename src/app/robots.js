export default function robots() {
    // Only allow indexing on the primary production domain
    const isProduction = process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com' || 
                         process.env.VERCEL_ENV === 'production';

    return {
        rules: {
            userAgent: '*',
            allow: isProduction ? '/' : [],
            disallow: isProduction ? ['/admin/', '/api/'] : '/',
        },
        sitemap: `https://dreamlineproduction.com/sitemap.xml`,
    };
}
