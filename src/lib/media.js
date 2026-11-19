/**
 * Dreamline Production - Central Media Asset & URL Normalizer
 * Safely handles fallback images, sanitizes video links, and guards against
 * broken AWS S3 bucket URLs or empty media records.
 */

const FALLBACK_MEDIA = {
    hero: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85",
    quote: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85",
    wedding: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    commercial: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    documentary: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    general: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
};

export function isBrokenMediaUrl(url) {
    if (!url || typeof url !== 'string') return true;
    const trimmed = url.trim();
    if (!trimmed) return true;
    // AWS S3 bucket with AllAccessDisabled
    if (trimmed.includes('dreamlinepro.s3') || trimmed.includes('amazonaws.com')) return true;
    return false;
}

export function getSafeImageUrl(url, fallbackType = 'general') {
    if (isBrokenMediaUrl(url)) {
        return FALLBACK_MEDIA[fallbackType] || FALLBACK_MEDIA.general;
    }
    return url.trim();
}

export function getYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/i;
    const match = clean.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function normalizeVideoUrl(url) {
    if (!url || typeof url !== 'string') return "";
    let trimmed = url.trim();
    if (!trimmed) return "";
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        trimmed = `https://${trimmed}`;
    }
    return trimmed;
}

export function getVideoThumbnail(videoUrl, customImage, fallbackType = 'commercial') {
    const ytId = getYouTubeId(videoUrl);
    if (!isBrokenMediaUrl(customImage)) {
        return customImage;
    }
    if (ytId) {
        return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return FALLBACK_MEDIA[fallbackType] || FALLBACK_MEDIA.commercial;
}
