import './style.css';
import './transitions.js'; // Global Page Transitions

// Global scripts can be added here
// API Config
const API_CONTENT_URL = '/api/content';
const API_WEDDINGS_URL = '/api/weddings';

// State
let siteContent = {};
let weddings = [];

// Init
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Vite App Initializing...');
    await Promise.all([fetchContent(), fetchWeddings()]);
    renderAll();
});

const fetchContent = async () => {
    try {
        const res = await fetch(API_CONTENT_URL);
        if (!res.ok) throw new Error('Failed to fetch content');
        siteContent = await res.json();
    } catch (err) {
        console.error(err);
    }
};

const fetchWeddings = async () => {
    try {
        const res = await fetch(API_WEDDINGS_URL);
        if (!res.ok) throw new Error('Failed to fetch weddings');
        weddings = await res.json();
    } catch (err) {
        console.error(err);
    }
};

const renderAll = () => {
    renderHero();
    renderMarquee();
    renderStats();
    renderMotionGallery();
    renderMasterGallery(); // Not fully implemented in HTML yet, but logic can be here
};

const renderHero = () => {
    if (!siteContent.hero) return;
    const { title, subtitle, videoUrl } = siteContent.hero;

    const title1El = document.getElementById('hero-title-1');
    const title2El = document.getElementById('hero-title-2');
    const subtitleEl = document.getElementById('hero-subtitle');
    const bgImg = document.getElementById('hero-bg-img');

    if (title1El) title1El.textContent = title?.line1 || 'Visionary';
    if (title2El) title2El.textContent = title?.line2 || 'Cinema.';
    if (subtitleEl) subtitleEl.textContent = subtitle || 'Est. 2010';

    // If videoUrl is an image (simple check), set src. If video, we might need a video tag replacement.
    // For now assuming image background based on ID 'hero-bg-img'.
    if (bgImg && videoUrl) {
        // Check if it's a video file extension
        if (videoUrl.match(/\.(mp4|webm)$/i)) {
            // Create video element replacement
            const video = document.createElement('video');
            video.src = videoUrl;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.className = "absolute inset-0 w-full h-full object-cover opacity-30 scale-110";
            bgImg.replaceWith(video);
        } else {
            bgImg.src = videoUrl;
        }
    }
};

const renderMarquee = () => {
    const container = document.getElementById('marquee-content');
    if (!container || !siteContent.marquee) return;

    // Use fetched marquee or default if empty
    const items = siteContent.marquee.length ? siteContent.marquee : [
        'LUXURY WEDDINGS', 'ADVERTISING', 'MUSIC CINEMA', 'CORPORATE NARRATIVES'
    ];

    container.innerHTML = items.map((text, i) => `
        <span class="font-heading font-black text-4xl ${i % 2 === 0 ? 'text-outline' : 'text-[#c5a059]'}">${text}</span>
    `).join('');
};

const renderStats = () => {
    const container = document.getElementById('stats-container');
    if (!container || !siteContent.stats) return;

    container.innerHTML = siteContent.stats.map(stat => `
        <div class="border-l border-white/10 pl-8 py-4">
            <div class="text-[#c5a059] font-heading text-5xl font-black mb-2">${stat.value}</div>
            <div class="text-[10px] font-black uppercase tracking-widest text-white/40">${stat.label}</div>
        </div>
    `).join('');
};

const renderMotionGallery = () => {
    const container = document.getElementById('motion-gallery-track');
    const titleEl = document.getElementById('gallery-title');
    const subtitleEl = document.getElementById('gallery-subtitle');

    if (titleEl && siteContent.gallery?.title) titleEl.textContent = siteContent.gallery.title;
    if (subtitleEl && siteContent.gallery?.subtitle) subtitleEl.textContent = siteContent.gallery.subtitle;

    if (!container || !siteContent.gallery?.images) return;

    // We need clones for infinite scroll, so we repeat the list
    const images = siteContent.gallery.images;
    const allImages = [...images, ...images]; // Simple duplication

    container.innerHTML = allImages.map(img => `
        <div class="motion-card"><img src="${img}" loading="lazy"></div>
    `).join('');
};

// Global exports for other scripts if needed
window.fetchContent = fetchContent;
window.fetchWeddings = fetchWeddings;


// Back to Top Button Logic
const backToTopBtn = document.createElement('button');
backToTopBtn.id = 'back-to-top';
backToTopBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
</svg>
`;
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Review Slider Logic
const reviewTrack = document.querySelector('.review-track');
if (reviewTrack) {
    const reviews = Array.from(reviewTrack.children);
    reviews.forEach(review => {
        const clone = review.cloneNode(true);
        reviewTrack.appendChild(clone);
    });
}
