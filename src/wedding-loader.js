
import { weddings } from './data/weddings.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'luxury.html'; // Redirect if no ID
        return;
    }

    // 2. Find Data
    const data = weddings.find(w => w.id === id);

    if (!data) {
        document.getElementById('heroes-section').innerHTML = '<h1 class="text-center mt-20">Wedding Not Found</h1>';
        return;
    }

    // 3. Populate DOM
    document.getElementById('wedding-title').textContent = data.title;
    document.getElementById('wedding-subtitle').textContent = data.subtitle;
    document.getElementById('wedding-desc').textContent = data.description;

    // Video
    const videoFrame = document.getElementById('wedding-video');
    if (videoFrame) videoFrame.src = data.videoUrl;

    // Gallery
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid && data.gallery) {
        galleryGrid.innerHTML = data.gallery.map(img => `
            <div class="aspect-[3/4] overflow-hidden rounded-xl border border-white/5 group">
                <img src="${img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="${data.title}">
            </div>
        `).join('');
    }

    // Album Link
    const albumLink = document.getElementById('album-link');
    if (albumLink) albumLink.href = data.albumUrl;

    // Reviews
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer && data.reviews) {
        reviewsContainer.innerHTML = data.reviews.map(r => `
            <div class="bg-white/5 p-8 rounded-2xl border border-white/5">
                <div class="flex text-[#c5a059] mb-4 text-xl">★★★★★</div>
                <p class="text-white/80 italic mb-6 leading-relaxed">"${r.text}"</p>
                <div class="font-black uppercase text-xs tracking-widest text-[#c5a059]">— ${r.name}</div>
            </div>
        `).join('');
    }

    // Show Content
    document.getElementById('dynamic-loader').style.display = 'none';
    document.getElementById('content-body').classList.remove('hidden');
    document.getElementById('content-body').classList.add('animate-fadeIn');
});
