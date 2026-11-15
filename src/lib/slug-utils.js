export const RESERVED_SLUGS = new Set([
    'admin', 'api', 'blogs', 'journal', 'new', 'edit', 'draft', 
    'feed', 'sitemap', 'category', 'tag', 'search', 'preview',
    'luxury', 'commercial', 'tech', 'about', 'contact', 'services'
]);

export const RESERVED_PAGE_ROOTS = new Set([
    '_next', 'api', 'admin', 'blogs', 'journal', 'favicon.ico', 
    'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'uploads'
]);

// Hardcoded static Next.js routes
export const STATIC_CORE_ROUTES = new Set([
    'about', 'commercial', 'company-details', 'contact', 'faq', 
    'locations', 'luxury', 'privacy-policy', 'refund-policy', 
    'services', 'tech', 'terms', 'wedding'
]);

/**
 * Clean and convert any text into an SEO-friendly URL slug.
 * Uses lowercase letters, numbers, and single hyphens.
 */
export function slugify(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/['’"]/g, '') // Remove quotation marks without replacing with hyphen
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, '') // Trim leading and trailing hyphens
        .replace(/-{2,}/g, '-'); // Collapse consecutive hyphens
}

/**
 * Validate that a slug meets SEO standards:
 * - lowercase alphanumeric and hyphens only
 * - no leading/trailing hyphens
 * - not a reserved path
 * - between 2 and 120 characters
 */
export function isValidSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    const clean = slug.toLowerCase().trim();
    if (clean.length < 2 || clean.length > 120) return false;
    if (RESERVED_SLUGS.has(clean)) return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean);
}

/**
 * Normalize a page slug. Supports root paths ('drone-photography-kolkata') 
 * or nested paths ('services/aerial-cinematography').
 */
export function normalizePageSlug(rawSlug) {
    if (!rawSlug || typeof rawSlug !== 'string') return '';
    return rawSlug
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .split('/')
        .map(segment => segment
            .replace(/['’"]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
        )
        .filter(Boolean)
        .join('/');
}

/**
 * Validate that a page slug meets SEO and routing standards.
 */
export function isValidPageSlug(rawSlug) {
    if (!rawSlug || typeof rawSlug !== 'string') return false;
    const trimmed = rawSlug.trim().replace(/^\/+|\/+$/g, '');
    const clean = normalizePageSlug(rawSlug);
    if (!clean || clean.length < 2 || clean.length > 200) return false;
    if (trimmed !== clean) return false;

    const segments = clean.split('/');
    if (segments.length === 0) return false;
    if (RESERVED_PAGE_ROOTS.has(segments[0])) return false;

    for (const segment of segments) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) {
            return false;
        }
    }
    return true;
}
