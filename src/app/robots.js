export default function robots() {
    const isProduction = process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com' || 
                         process.env.VERCEL_ENV === 'production';

    return {
        rules: [
            // AI Search/Retrieval Bots — ALLOW (these cite your business in AI search results)
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'OAI-SearchBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // AI Training Bots — BLOCK (these scrape content for model training)
            {
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                disallow: '/',
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
            {
                userAgent: 'Google-Extended',
                disallow: '/',
            },
            {
                userAgent: 'Meta-ExternalAgent',
                disallow: '/',
            },
            {
                userAgent: 'Bytespider',
                disallow: '/',
            },
            {
                userAgent: 'cohere-ai',
                disallow: '/',
            },
            // Social sharing bots — always allow for link previews
            {
                userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp'],
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // Standard search engines (Google, Bing, etc.)
            {
                userAgent: '*',
                allow: isProduction ? '/' : [],
                disallow: isProduction ? ['/admin/', '/api/'] : '/',
            }
        ],
        sitemap: `https://dreamlineproduction.com/sitemap.xml`,
    };
}
