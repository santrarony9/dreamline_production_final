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
    console.log('Dreamline Vite Initializing...');
    await Promise.all([fetchContent(), fetchWeddings()]);

    // Create unified portfolio for Master Gallery
    siteContent.masterPortfolio = [
        ...(siteContent.projects || []).map(p => ({ ...p, category: 'commercial' })),
        ...(weddings || []).map(w => ({
            id: w.id,
            title: w.title,
            img: w.coverImage,
            type: 'wedding',
            category: 'wedding',
            isWedding: true
        }))
    ];

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
    renderVideoVault();
    renderMasterGallery();
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

const renderVideoVault = () => {
    const container = document.getElementById('video-vault-grid');
    if (!container || !siteContent.videoVault) return;

    if (siteContent.videoVault.length === 0) {
        container.innerHTML = '<p class="text-white/50 col-span-full text-center">No video items yet.</p>';
        return;
    }

    container.innerHTML = siteContent.videoVault.map(item => `
        <div class="motion-card w-full h-[400px] interactive group relative overflow-hidden rounded-xl">
            <img src="${item.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            ${item.videoUrl ? `
            <a href="${item.videoUrl}" target="_blank" class="video-overlay absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                <div class="w-20 h-20 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8 fill-white ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </a>` : ''}
            <div class="absolute bottom-6 left-6 pointer-events-none">
                <p class="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">${item.category}</p>
                <h3 class="font-heading text-xl font-bold uppercase text-white">${item.title}</h3>
            </div>
        </div>
    `).join('');
};

const renderMasterGallery = (filter = 'all') => {
    const container = document.getElementById('master-grid');
    if (!container || !siteContent.masterPortfolio) return;

    const items = filter === 'all'
        ? siteContent.masterPortfolio
        : siteContent.masterPortfolio.filter(p => p.category === filter || p.type === filter);

    if (items.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-10 uppercase tracking-widest text-[10px] font-bold">No projects found in this category.</p>';
        return;
    }

    container.innerHTML = items.map(proj => `
        <a href="${proj.isWedding ? `wedding-details.html?id=${proj.id}` : '#'}" class="aspect-[4/5] bg-gray-900 overflow-hidden relative group block">
            <img src="${proj.img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <p class="text-[#c5a059] text-[9px] font-black uppercase tracking-widest mb-2">${proj.category || proj.type}</p>
                <h3 class="text-white font-heading text-xl font-black uppercase leading-tight">${proj.title}</h3>
                ${proj.isWedding ? '<span class="text-[9px] text-white/50 uppercase font-bold mt-4 tracking-tighter">View Story →</span>' : ''}
            </div>
        </a>
    `).join('');
};

window.filterGallery = (type, btn) => {
    // Update active button state
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    renderMasterGallery(type);
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
