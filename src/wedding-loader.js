
// import { weddings } from './data/weddings.js'; // Removed static import

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'luxury.html';
        return;
    }

    // 2. Fetch Data
    let weddings = [];
    try {
        const res = await fetch('/api/weddings');
        if (!res.ok) throw new Error('Failed to fetch weddings');
        weddings = await res.json();
    } catch (err) {
        console.error(err);
        document.getElementById('details-content').innerHTML = '<h1 class="text-center mt-20 text-4xl font-heading">Error Loading Data</h1>';
        return;
    }

    // 3. Find Data & Index
    const index = weddings.findIndex(w => w.id === id);
    if (index === -1) {
        document.getElementById('details-content').innerHTML = '<h1 class="text-center mt-20 text-4xl font-heading">Wedding Not Found</h1>';
        return;
    }
    const data = weddings[index];

    // 4. Populate DOM
    document.getElementById('wedding-title').textContent = data.title;
    document.getElementById('wedding-subtitle').textContent = data.subtitle;
    document.getElementById('wedding-desc').textContent = data.description;

    // Video
    const videoFrame = document.getElementById('wedding-video');
    if (videoFrame) videoFrame.src = data.videoUrl;

    // --- STORY CHAPTERS (Gallery) ---
    const galleryContainer = document.getElementById('gallery-container'); // Need to update HTML to use this container ID
    // Fallback if user uses old structure
    const oldGalleryGrid = document.getElementById('gallery-grid');

    // If we have chapters, render them
    if (data.storyChapters) {
        let galleryHTML = '';
        data.storyChapters.forEach((chapter, i) => {
            galleryHTML += `
                <div class="mb-24">
                    <div class="flex items-end justify-between mb-8 border-b border-white/10 pb-4 sticky top-24 bg-[#050505]/90 backdrop-blur-md z-10 py-4 transition-all">
                        <h3 class="font-heading text-2xl md:text-3xl font-black uppercase text-white">${chapter.title}</h3>
                        <span class="text-[#c5a059] font-mono text-xs">0${i + 1} / 0${data.storyChapters.length}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${chapter.images.map(img => `
                            <div class="aspect-[3/4] overflow-hidden rounded-xl border border-white/5 group relative">
                                <img src="${img}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="${data.title}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        // Inject into existing gallery section wrapper if possible, or replace content
        if (galleryContainer) {
            galleryContainer.innerHTML = galleryHTML;
        } else if (oldGalleryGrid) {
            // Replace the grid's parent section content essentially to allow chapters
            oldGalleryGrid.parentElement.innerHTML = `
                <h2 class="font-heading text-3xl font-black mb-12 flex items-center gap-4">
                    <span class="w-12 h-[1px] bg-[#c5a059]"></span> The Story
                </h2>
                <div id="gallery-container">${galleryHTML}</div>
            `;
        }
    } else if (data.gallery && oldGalleryGrid) {
        // Fallback for old simple gallery
        oldGalleryGrid.innerHTML = data.gallery.map(img => `
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
            <div class="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-[#c5a059] transition-colors">
                <div class="flex text-[#c5a059] mb-4 text-xl">★★★★★</div>
                <p class="text-white/80 italic mb-6 leading-relaxed">"${r.text}"</p>
                <div class="font-black uppercase text-xs tracking-widest text-[#c5a059]">— ${r.name}</div>
            </div>
        `).join('');
    }

    // --- VENDOR CREDITS ---
    if (data.vendors) {
        const vendorSection = document.createElement('section');
        vendorSection.className = 'container mx-auto px-6 mb-32 border-t border-white/10 pt-20';
        vendorSection.innerHTML = `
            <div class="text-center mb-12">
                <h2 class="font-heading text-2xl font-black uppercase tracking-widest mb-2 text-white">The Dream Team</h2>
                <div class="w-12 h-[2px] bg-[#c5a059] mx-auto"></div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                ${data.vendors.map(v => `
                    <div class="group">
                        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059] mb-2 group-hover:text-white transition-colors">${v.role}</p>
                        <p class="font-heading text-lg font-bold text-white/80 group-hover:text-white transition-colors">${v.name}</p>
                    </div>
                `).join('')}
            </div>
        `;
        // Insert before footer (last element is footer usually, or append to main)
        document.getElementById('content-body').appendChild(vendorSection);
    }

    // --- NEXT WEDDING NAVIGATION ---
    const nextIndex = (index + 1) % weddings.length;
    const nextWedding = weddings[nextIndex];
    if (nextWedding) {
        const nextNav = document.createElement('a');
        nextNav.href = `wedding-details.html?id=${nextWedding.id}`;
        nextNav.className = 'fixed bottom-8 right-8 z-40 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-full flex items-center gap-4 group hover:bg-[#c5a059] hover:border-[#c5a059] transition-all duration-300 translate-y-20 opacity-0';
        nextNav.id = 'next-wedding-nav';
        nextNav.innerHTML = `
            <div class="text-right hidden md:block">
                <p class="text-[8px] uppercase font-black tracking-widest text-white/50 group-hover:text-black/60">Next Story</p>
                <p class="text-xs font-bold uppercase text-white group-hover:text-black">${nextWedding.title}</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/10">
                <svg class="w-4 h-4 text-white group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
        `;
        document.body.appendChild(nextNav);

        // Show on scroll logic
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                nextNav.classList.remove('translate-y-20', 'opacity-0');
            } else {
                nextNav.classList.add('translate-y-20', 'opacity-0');
            }
        });
    }

    // Show Content
    document.getElementById('dynamic-loader').style.display = 'none';
    document.getElementById('content-body').classList.remove('hidden');
    document.getElementById('content-body').classList.add('animate-fadeIn');
});
