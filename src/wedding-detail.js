import './style.css';

// Constants
const API_WEDDINGS_URL = '/api/weddings';

// State
let weddingData = null;

// Init
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = 'luxury.html';
        return;
    }

    await fetchWedding(id);
    if (weddingData) {
        renderWedding();
        document.body.classList.remove('opacity-0');
    } else {
        window.location.href = 'luxury.html';
    }
});

const fetchWedding = async (id) => {
    try {
        const res = await fetch(`${API_WEDDINGS_URL}/${id}`);
        if (!res.ok) throw new Error('Not found');
        weddingData = await res.json();
    } catch (err) {
        console.error('Failed to fetch wedding details:', err);
    }
};

const renderWedding = () => {
    const { title, subtitle, description, coverImage, hoverVideo, videoUrl, albumUrl, storyChapters, date } = weddingData;

    // Nav & Meta
    document.title = `${title} | Dreamline Story`;
    document.getElementById('couple-names-nav').textContent = title;

    // Hero
    document.getElementById('wedding-title').textContent = title;
    document.getElementById('wedding-subtitle').textContent = subtitle || 'A Cinematic Legacy';
    document.getElementById('wedding-date').textContent = date || 'MOMENTS';
    document.getElementById('wedding-description').textContent = description;

    const heroContainer = document.getElementById('hero-media-container');
    if (hoverVideo) {
        heroContainer.innerHTML = `
            <video src="${hoverVideo}" autoplay muted loop playsinline class="w-full h-full object-cover opacity-40 scale-110 hero-zoom"></video>
        `;
    } else {
        heroContainer.innerHTML = `
            <img src="${coverImage}" class="w-full h-full object-cover opacity-40 scale-110 hero-zoom">
        `;
    }

    // Album Link
    if (albumUrl) {
        document.getElementById('album-container').classList.remove('hidden');
        document.getElementById('album-link').href = albumUrl;
    }

    // Video Section
    if (videoUrl) {
        const filmSection = document.getElementById('film-section');
        const iframe = document.getElementById('video-iframe');

        // Handle YouTube/Vimeo embed conversion
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch?v=')) {
            embedUrl = videoUrl.replace('watch?v=', 'embed/');
        } else if (videoUrl.includes('youtu.be/')) {
            embedUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
        }

        iframe.src = embedUrl;
        filmSection.classList.remove('hidden');
    }

    // Chapters & Gallery
    const chaptersContainer = document.getElementById('chapters-grid');
    const largeGallery = document.getElementById('large-gallery');

    chaptersContainer.innerHTML = '';
    largeGallery.innerHTML = '';

    if (storyChapters && storyChapters.length > 0) {
        storyChapters.forEach((chapter, i) => {
            // Render Chapter Text
            const chapterEl = document.createElement('div');
            chapterEl.className = 'glass-panel p-10 rounded-3xl border-white/5';
            chapterEl.innerHTML = `
                <span class="text-[#c5a059] font-black text-[9px] uppercase tracking-widest mb-4 block">Chapter 0${i + 1}</span>
                <h3 class="font-heading text-xl font-bold uppercase mb-4 text-white">${chapter.title}</h3>
                <div class="h-px w-10 bg-[#c5a059] mb-6"></div>
            `;
            chaptersContainer.appendChild(chapterEl);

            // Add images to the large gallery
            chapter.images.forEach(img => {
                const imgCard = document.createElement('div');
                imgCard.className = 'gallery-card group';
                imgCard.innerHTML = `<img src="${img}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700">`;
                largeGallery.appendChild(imgCard);
            });
        });
    } else {
        // Fallback: If no chapters, just show cover image in gallery
        const imgCard = document.createElement('div');
        imgCard.className = 'gallery-card group';
        imgCard.innerHTML = `<img src="${coverImage}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all">`;
        largeGallery.appendChild(imgCard);
    }
};
