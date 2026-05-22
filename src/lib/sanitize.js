/**
 * Lightweight HTML sanitizer for server-side rendering.
 * 
 * Replaces isomorphic-dompurify which pulls in jsdom (with ESM-only 
 * dependencies like @exodus/bytes that crash Vercel's edge runtime).
 *
 * This sanitizer allows only safe HTML tags and attributes used in 
 * our CMS content (headings, paragraphs, line breaks, links, 
 * formatting, lists, and images).
 */

// Tags allowed in our CMS content
const ALLOWED_TAGS = new Set([
    'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'sup', 'sub', 'small',
]);

// Attributes allowed per tag (or globally with '*')
const ALLOWED_ATTRS = {
    '*': ['class', 'style', 'id'],
    'a': ['href', 'target', 'rel', 'title'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
};

/**
 * Sanitize HTML by stripping disallowed tags and attributes.
 * Self-closing tags (br, hr, img) are preserved properly.
 * 
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return '';

    // Remove script tags and their content entirely
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers (onclick, onerror, onload, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '');
    clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

    // Remove javascript: and data: URLs from href/src attributes
    clean = clean.replace(/(href|src)\s*=\s*(['"])\s*javascript:/gi, '$1=$2#');
    clean = clean.replace(/(href|src)\s*=\s*(['"])\s*data:/gi, '$1=$2#');

    // Process tags: keep allowed, strip disallowed
    clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tagName, attrs) => {
        const tag = tagName.toLowerCase();
        
        if (!ALLOWED_TAGS.has(tag)) {
            return ''; // Strip disallowed tags
        }

        const isClosing = match.startsWith('</');
        if (isClosing) return `</${tag}>`;

        // Filter attributes
        const allowedForTag = [
            ...(ALLOWED_ATTRS['*'] || []),
            ...(ALLOWED_ATTRS[tag] || []),
        ];

        let filteredAttrs = '';
        if (attrs) {
            const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrs)) !== null) {
                const attrName = attrMatch[1].toLowerCase();
                const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
                if (allowedForTag.includes(attrName)) {
                    filteredAttrs += ` ${attrName}="${attrValue}"`;
                }
            }
        }

        // Handle self-closing tags
        const isSelfClosing = match.endsWith('/>') || ['br', 'hr', 'img'].includes(tag);
        return `<${tag}${filteredAttrs}${isSelfClosing ? ' /' : ''}>`;
    });

    return clean;
}

export default sanitizeHtml;
