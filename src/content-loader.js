import { websiteContent } from './content.js';
import { getOptimizedUrl } from './media-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Hero Section
    updateElement('hero-title-1', websiteContent.hero.title.line1);
    updateElement('hero-title-2', websiteContent.hero.title.line2);
    updateElement('hero-subtitle', websiteContent.hero.subtitle);

    // Background Video/Image
    const heroBg = document.getElementById('hero-bg-img');
    if (heroBg && websiteContent.hero.videoUrl) {
        heroBg.src = getOptimizedUrl(websiteContent.hero.videoUrl, 1920);
    }

    // Stats
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = websiteContent.stats.map(stat => `
            <div class="border-l border-white/10 pl-8 py-4">
                <div class="text-[#c5a059] font-heading text-5xl font-black mb-2">${stat.value}</div>
                <div class="text-[10px] font-black uppercase tracking-widest text-white/40">${stat.label}</div>
            </div>
        `).join('');
    }

    // Marquee
    const marqueeContainer = document.getElementById('marquee-content');
    if (marqueeContainer) {
        marqueeContainer.innerHTML = websiteContent.marquee.map((item, index) => {
            const isGold = index % 2 !== 0;
            const colorClass = isGold ? 'text-[#c5a059]' : 'text-outline';
            return `<span class="font-heading font-black text-4xl ${colorClass}">${item}</span>`;
        }).join('');
    }

    // Motion Gallery
    const galleryContainer = document.querySelector('.motion-track');
    if (galleryContainer && websiteContent.gallery.images) {
        // Create 2 sets of images for seamless loop
        const images = [...websiteContent.gallery.images, ...websiteContent.gallery.images];
        galleryContainer.innerHTML = images.map(src => `
            <div class="motion-card"><img src="${getOptimizedUrl(src, 600)}"></div>
        `).join('');
    }
});

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
