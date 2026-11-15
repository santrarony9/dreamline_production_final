/**
 * Smart SEO Alt Text Generator & Validator for Dreamline Production
 * Generates natural-language, descriptive, accessibility-compliant alt text.
 */

const GENERIC_ALT_PATTERNS = [
    /^image$/i, /^photo$/i, /^img$/i, /^picture$/i, /^media$/i,
    /^thumbnail$/i, /^banner$/i, /^cover$/i, /^gallery image$/i,
    /^preview$/i, /^untitled$/i, /^img_\d+/i, /^image_\d+/i,
    /^dsc_\d+/i, /^asset$/i, /^\d+$/
];

/**
 * Check if an existing alt text is missing, empty, or a generic placeholder.
 */
export function isAltTextSuboptimal(alt) {
    if (!alt || typeof alt !== 'string') return true;
    const clean = alt.trim().toLowerCase();
    if (clean.length < 3) return true;
    if (GENERIC_ALT_PATTERNS.some(pattern => pattern.test(clean))) return true;
    if (/\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(clean)) return true;
    return false;
}

/**
 * Clean up a raw filename into readable words.
 */
export function cleanFilenameToWords(urlOrFilename) {
    if (!urlOrFilename) return "";
    const basename = urlOrFilename.split('/').pop().split('?')[0];
    const withoutExt = basename.replace(/\.[a-zA-Z0-9]+$/, '');
    // Remove timestamp prefix like "1791280746958-" or "1791281132940_"
    const withoutTimestamp = withoutExt.replace(/^\d+[-_]/, '');
    // Replace underscores, hyphens, and multiple spaces with a single space
    const cleaned = withoutTimestamp
        .replace(/[-_]+/g, ' ')
        .replace(/\b(dsc|img|shot|pic|frame)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    return cleaned;
}

/**
 * Intelligently generate natural-language, SEO-rich alt text based on context.
 */
export function generateSmartAltText({
    url = "",
    contextTitle = "",
    category = "general",
    pageSlug = "",
    index = 0,
    role = "main" // 'main', 'gallery', 'thumbnail', 'founder', 'team', 'partner', 'badge'
}) {
    const filenameWords = cleanFilenameToWords(url);
    const title = (contextTitle || "").trim();
    const lowerTitle = title.toLowerCase();

    // 1. Founder & Team
    if (role === 'founder' || lowerTitle.includes('founder') || lowerTitle.includes('rony santra')) {
        return "Rony Santra, Founder and Creative Director of Dreamline Production Kolkata";
    }
    if (role === 'team' || lowerTitle.includes('team member')) {
        return `${title || 'Creative cinema crew member'} at Dreamline Production studio Kolkata`;
    }

    // 2. Wedding Photography & Cinema
    if (category === 'wedding' || lowerTitle.includes('wedding') || lowerTitle.includes('pre-wedding') || lowerTitle.includes('couple') || lowerTitle.includes('reception') || lowerTitle.includes('haldi') || lowerTitle.includes('sindoor')) {
        const weddingVariations = [
            `Cinematic wedding couple portrait by Dreamline Production Kolkata`,
            `Candid emotional wedding moment captured during ceremony in Kolkata`,
            `Traditional Bengali wedding rituals and cultural celebration documentation`,
            `Romantic pre-wedding outdoor couple photoshoot at heritage location`,
            `Intimate evening reception portrait with luxury cinematic lighting`,
            `Bridal preparation and traditional attire candid photography Kolkata`,
            `Sindoor daan and saat paak wedding ritual photography in Kolkata`
        ];

        if (title) {
            if (lowerTitle.includes('pre wedding') || lowerTitle.includes('pre-wedding')) {
                return `Romantic pre-wedding couple photoshoot for ${title} by Dreamline Production`;
            }
            if (index > 0) {
                return `${title} - ${weddingVariations[index % weddingVariations.length]}`;
            }
            return `Cinematic wedding photography capturing ${title} by Dreamline Production Kolkata`;
        }

        if (filenameWords && filenameWords.length > 3) {
            return `Cinematic wedding photography: ${filenameWords} by Dreamline Production Kolkata`;
        }

        return weddingVariations[index % weddingVariations.length];
    }

    // 3. Drone & Aerial Cinematography
    if (category === 'drone' || lowerTitle.includes('drone') || lowerTitle.includes('aerial')) {
        if (title) {
            return `DGCA certified aerial drone cinematography for ${title} in Kolkata`;
        }
        return "DGCA certified aerial drone photography capturing cinematic perspectives of Kolkata";
    }

    // 4. Commercial & Corporate Films
    if (category === 'commercial' || lowerTitle.includes('commercial') || lowerTitle.includes('corporate') || lowerTitle.includes('ad film') || lowerTitle.includes('brand') || lowerTitle.includes('podcast')) {
        if (title) {
            return `Commercial film production and brand cinematography for ${title}`;
        }
        return "Professional commercial video production with cinema camera setup in Kolkata";
    }

    // 5. Tech & Web Solutions
    if (category === 'tech' || lowerTitle.includes('tech') || lowerTitle.includes('web development') || lowerTitle.includes('digital') || lowerTitle.includes('3d')) {
        if (title) {
            return `Digital innovation and technology project showcase: ${title} by Dreamline`;
        }
        return "Creative technology and full-stack web development project by Dreamline Production";
    }

    // 6. Blog Articles
    if (category === 'blog' || role === 'blog') {
        if (title) {
            return `Editorial featured photography for ${title} - Dreamline Production Kolkata`;
        }
    }

    // 7. General Service Pages
    if (category === 'service' || lowerTitle.includes('photography') || lowerTitle.includes('videography')) {
        if (title) {
            return `Professional ${title} service showcase by Dreamline Production in Kolkata`;
        }
    }

    // 8. Fallback to cleaned filename if informative
    if (filenameWords && filenameWords.length > 3) {
        // Capitalize first letter
        const formatted = filenameWords.charAt(0).toUpperCase() + filenameWords.slice(1);
        return `${formatted} - Dreamline Production Kolkata`;
    }

    if (title) {
        return `${title} visual showcase - Dreamline Production Kolkata`;
    }

    return "Cinematic photography and visual production by Dreamline Production Kolkata";
}
