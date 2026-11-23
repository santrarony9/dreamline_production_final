/**
 * Dreamline Production — Wedding Slug Mapping & Canonicalization
 * 
 * Maps raw Unix timestamp IDs to keyword-rich, SEO-friendly wedding URLs
 * while maintaining 100% backward compatibility and 301 redirects.
 */

export const WEDDING_SLUG_MAP = {
    'wedding-1771743825332': 'sid-trina-luxury-bengali-wedding',
    'wedding-1778663588915': 'rajlaxmi-mohit-royal-wedding-kolkata',
    'zamindar-soul': 'zamindar-soul',
};

export const REVERSE_WEDDING_MAP = {
    'sid-trina-luxury-bengali-wedding': 'wedding-1771743825332',
    'rajlaxmi-mohit-royal-wedding-kolkata': 'wedding-1778663588915',
    'zamindar-soul': 'zamindar-soul',
};

export function getCanonicalWeddingSlug(id) {
    if (!id) return '';
    return WEDDING_SLUG_MAP[id] || id;
}

export function getOriginalWeddingId(slugOrId) {
    if (!slugOrId) return '';
    return REVERSE_WEDDING_MAP[slugOrId] || slugOrId;
}
