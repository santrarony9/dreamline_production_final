// Cloudinary Configuration
const CLOUD_NAME = 'demo'; // Replace with your CloudName
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Generates an optimized Cloudinary URL
 * @param {string} localPath - The path to the image (or existing URL)
 * @param {object} options - Width, height, format
 */
export function getOptimizedUrl(url, width = 'auto') {
    // If it's already a full URL (like Unsplash), return it as is for now
    // In production, you would upload these to Cloudinary and use the ID
    if (url.startsWith('http')) return url;

    return `${BASE_URL}/f_auto,q_auto,w_${width}/${url}`;
}

/**
 * Generates a YouTube embed URL with clean parameters
 * @param {string} videoId 
 */
export function getYouTubeEmbed(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&rel=0&modestbranding=1&showinfo=0`;
}
