export default function robots() {
    const isProduction = process.env.NEXT_PUBLIC_SITE_URL === 'https://dreamlineproduction.com' || 
                         process.env.VERCEL_ENV === 'production';

    return {
        rules: [
            // ======================================================
            // AI SEARCH / RETRIEVAL BOTS — ALLOW
            // These bots cite your business in AI-powered search results.
            // Allowing them = your business appears in AI answers.
            // ======================================================
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
            {
                userAgent: 'Applebot-Extended',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'GoogleOther',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'GoogleOther-Image',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'GoogleOther-Video',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'PhindBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'YouBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'iaskspider',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'CopilotBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'KagiBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'BraveBot',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },

            // ======================================================
            // AI TRAINING BOTS — BLOCK
            // These bots scrape content for model training purposes.
            // Blocking them protects your content from being used
            // as training data while still appearing in AI search.
            // ======================================================
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
            {
                userAgent: 'anthropic-ai',
                disallow: '/',
            },
            {
                userAgent: 'Amazonbot',
                disallow: '/',
            },
            {
                userAgent: 'Diffbot',
                disallow: '/',
            },
            {
                userAgent: 'Omgilibot',
                disallow: '/',
            },
            {
                userAgent: 'Omgili',
                disallow: '/',
            },
            {
                userAgent: 'Timpibot',
                disallow: '/',
            },
            {
                userAgent: 'PetalBot',
                disallow: '/',
            },
            {
                userAgent: 'ImagesiftBot',
                disallow: '/',
            },
            {
                userAgent: 'Scrapy',
                disallow: '/',
            },
            {
                userAgent: 'Ai2Bot',
                disallow: '/',
            },
            {
                userAgent: 'Webzio-Extended',
                disallow: '/',
            },
            {
                userAgent: 'FacebookBot',
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
