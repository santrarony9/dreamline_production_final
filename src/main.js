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
    initThemeToggle();
    trackPageView();
    await Promise.all([fetchContent(), fetchWeddings()]);

    // Create unified portfolio for Master Gallery
    siteContent.masterPortfolio = [
        ...(siteContent.projects || []).map(p => ({ ...p, category: 'commercial' })),
        ...(weddings || []).map(w => ({
            id: w._id,
            title: w.title,
            img: w.coverImage,
            hoverVideo: w.hoverVideo,
            type: 'wedding',
            category: 'wedding',
            isWedding: true
        }))
    ];

    renderAll();
    initVideoModal();
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

const trackPageView = async () => {
    try {
        const path = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
        await fetch('/api/tracking/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
            // Keepalive to ensure the request is sent even if the user navigates away fast
            keepalive: true
        });
    } catch (err) {
        console.warn('Analytics tracking failed:', err);
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
    renderGlobal();
    renderHero();
    renderMarquee();
    renderStats();
    renderMotionGallery();
    renderVideoVault();
    renderMasterGallery();
    renderAbout();
    renderJournal();
    renderPartners();
    renderSplitGallery();
    renderLuxuryPage();
    renderCommercialPage();
    applyGlobalSEO();
};

const applyGlobalSEO = () => {
    if (!siteContent.global?.seo) return;
    const seo = siteContent.global.seo;

    // Only set title if it appears to be the default
    if (!document.title || document.title.includes('Vite App') || document.title === 'Dreamline Production') {
        if (seo.title) document.title = seo.title;
    }

    const setMeta = (name, content) => {
        if (!content) return;
        let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:')) meta.setAttribute('property', name);
            else meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    setMeta('description', seo.description);
    setMeta('keywords', seo.keywords);
    setMeta('og:title', seo.title);
    setMeta('og:description', seo.description);
    setMeta('og:image', seo.ogImage);
};

const renderGlobal = () => {
    if (!siteContent.global) return;
    // Footer updates if IDs exist
    const fAddress = document.getElementById('footer-address');
    const fPhone = document.getElementById('footer-phone');
    const fEmail = document.getElementById('footer-email');
    if (fAddress && siteContent.global.contact?.address) fAddress.textContent = siteContent.global.contact.address;
    if (fPhone && siteContent.global.contact?.phone) {
        fPhone.textContent = siteContent.global.contact.phone;
        fPhone.href = `tel:${siteContent.global.contact.phone.replace(/[^0-9+]/g, '')}`;
    }
    if (fEmail && siteContent.global.contact?.email) {
        fEmail.textContent = siteContent.global.contact.email;
        fEmail.href = `mailto:${siteContent.global.contact.email}`;
    }
};

const renderLuxuryPage = () => {
    if (!siteContent.luxury) return;
    const h1 = document.getElementById('luxury-page-title1');
    const h2 = document.getElementById('luxury-page-title2');
    const desc = document.getElementById('luxury-page-desc');

    if (h1 && siteContent.luxury.hero?.titleLine1) h1.textContent = siteContent.luxury.hero.titleLine1;
    if (h2 && siteContent.luxury.hero?.titleLine2) h2.textContent = siteContent.luxury.hero.titleLine2;
    if (desc && siteContent.luxury.hero?.description) desc.textContent = siteContent.luxury.hero.description;

    const tQuote = document.getElementById('luxury-test-quote-el');
    const tAuthor = document.getElementById('luxury-test-author-el');
    const tRole = document.getElementById('luxury-test-role-el');
    const tImg = document.getElementById('luxury-test-img-el');

    if (tQuote && siteContent.luxury.testimonial?.quote) tQuote.textContent = `"${siteContent.luxury.testimonial.quote}"`;
    if (tAuthor && siteContent.luxury.testimonial?.author) tAuthor.textContent = siteContent.luxury.testimonial.author;
    if (tRole && siteContent.luxury.testimonial?.role) tRole.textContent = siteContent.luxury.testimonial.role;
    if (tImg && siteContent.luxury.testimonial?.image) tImg.src = siteContent.luxury.testimonial.image;
};

const renderCommercialPage = () => {
    if (!siteContent.commercial) return;
    const h1 = document.getElementById('comm-page-title1');
    const h2 = document.getElementById('comm-page-title2');
    const desc = document.getElementById('comm-page-desc');

    if (h1 && siteContent.commercial.hero?.titleLine1) h1.textContent = siteContent.commercial.hero.titleLine1;
    if (h2 && siteContent.commercial.hero?.titleLine2) h2.textContent = siteContent.commercial.hero.titleLine2;
    if (desc && siteContent.commercial.hero?.description) desc.textContent = siteContent.commercial.hero.description;
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

const renderPartners = () => {
    const container = document.querySelector('.brand-track');
    if (!container || !siteContent.partners) return;

    const items = siteContent.partners.length ? siteContent.partners : [
        { name: 'ADIDAS', letter: 'A' },
        { name: 'VOGUE', letter: 'V' },
        { name: 'RELIANCE', letter: 'R' },
        { name: 'NETFLIX', letter: 'N' },
        { name: 'TATA MOTORS', letter: 'T' }
    ];

    // Duplicate for ticker
    const allPartners = [...items, ...items, ...items];

    container.innerHTML = allPartners.map(p => `
        <div class="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-black">${p.letter}</div>
            <span class="font-heading text-xl font-bold tracking-tighter">${p.name}</span>
        </div>
    `).join('');
};

const renderSplitGallery = () => {
    const track1 = document.getElementById('v-track-1');
    const track2 = document.getElementById('v-track-2');
    const track3 = document.getElementById('v-track-3');

    if (!track1 || !track2 || !siteContent.splitGallery?.length) return;

    const images = siteContent.splitGallery;
    const count = images.length;

    // Distribute images into 3 columns
    const cols = [[], [], []];
    images.forEach((img, i) => {
        cols[i % 3].push(img);
    });

    // Helper to render a track with duplicates for loop
    const renderTrack = (el, items) => {
        if (!el || !items.length) return;
        const allItems = [...items, ...items, ...items]; // Duplicate for scroll
        el.innerHTML = allItems.map(src => `
            <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                <img src="${src}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
            </div>
        `).join('');
    };

    renderTrack(track1, cols[0]);
    renderTrack(track2, cols[1]);
    renderTrack(track3, cols[2]);
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

    // Branded Placeholder for broken images
    const placeholder = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=20';

    container.innerHTML = items.map(proj => {
        const isWedding = proj.isWedding || proj.type === 'wedding';
        const typeLabel = proj.type || (isWedding ? 'wedding' : 'commercial');
        const displayImg = proj.img || placeholder;

        return `
            <div class="wedding-card aspect-[4/5] bg-zinc-900 border border-white/5 overflow-hidden relative group block cursor-pointer" 
                 onclick="window.openVideoPlayer('${proj.videoUrl || ''}', '${proj.title}')">
                <img src="${displayImg}" 
                     onerror="this.src='${placeholder}'"
                     class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100">
                
                ${proj.hoverVideo ? `
                    <video src="${proj.hoverVideo}" preload="metadata" muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none hover-video" style="transform: scale(1.05)"></video>
                ` : ''}

                <!-- Content Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end z-10">
                    <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p class="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em] mb-3">${typeLabel}</p>
                        <h3 class="text-white font-heading text-xl font-black uppercase leading-tight tracking-tighter mb-4">${proj.title}</h3>
                        
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold group-hover:text-black transition-all">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <span class="text-[9px] text-white/50 uppercase font-black tracking-widest group-hover:text-white transition-colors">
                                ${proj.videoUrl ? 'Watch Film' : (isWedding ? 'View Story' : 'View Project')}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Subtle Border Glow -->
                <div class="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none rounded-sm"></div>
            </div>
        `;
    }).join('');

    // Attach video hover listeners
    const cards = container.querySelectorAll('.wedding-card');
    cards.forEach(card => {
        const video = card.querySelector('.hover-video');
        if (video) {
            card.addEventListener('mouseenter', () => video.play().catch(() => { }));
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });
};

// --- VIDEO PLAYER MODAL LOGIC ---
window.openVideoPlayer = (url, title) => {
    if (!url) return;

    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');
    const videoTag = document.getElementById('modal-video');
    const loader = document.getElementById('video-loader');

    if (!modal) return;

    // Determine player type
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    const isDirect = url.match(/\.(mp4|webm|ogg|mov)$/i);

    loader.style.display = 'flex';
    modal.classList.remove('pointer-events-none');
    modal.classList.add('opacity-100');

    if (isYouTube || isVimeo) {
        let embedUrl = url;
        if (isYouTube) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length == 11) {
                embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
            }
        } else if (isVimeo) {
            const match = url.match(/vimeo.com\/(\d+)/);
            if (match) {
                embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
            }
        }

        videoTag.classList.add('hidden');
        iframe.classList.remove('hidden');
        iframe.src = embedUrl;
        iframe.onload = () => {
            loader.style.display = 'none';
            iframe.style.opacity = '1';
        };
    } else {
        // Direct Video
        iframe.classList.add('hidden');
        videoTag.classList.remove('hidden');
        videoTag.src = url;
        videoTag.oncanplay = () => {
            loader.style.display = 'none';
        };
    }
};

const initVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('close-video');
    const iframe = document.getElementById('modal-iframe');
    const videoTag = document.getElementById('modal-video');

    if (!modal || !closeBtn) return;

    const closeModal = () => {
        modal.classList.add('pointer-events-none');
        modal.classList.remove('opacity-100');
        iframe.src = '';
        iframe.style.opacity = '0';
        videoTag.pause();
        videoTag.src = '';
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // ESC key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
};

// Add to init
// initVideoModal(); // Moved to DOMContentLoaded

const renderAbout = () => {
    if (!siteContent.about) return;
    const { heroTitle, heroSubtitle, vision, mission, founderNote, founderImage } = siteContent.about;

    const hTitle = document.getElementById('about-hero-title');
    const hSub = document.getElementById('about-hero-subtitle');
    const vis = document.getElementById('about-vision');
    const mis = document.getElementById('about-mission');
    const note = document.getElementById('about-founder-note');
    const img = document.getElementById('about-founder-img');

    if (hTitle && heroTitle) hTitle.innerHTML = heroTitle.replace(/\n/g, '<br>');
    if (hSub && heroSubtitle) hSub.textContent = heroSubtitle;
    if (vis && vision) vis.textContent = vision;
    if (mis && mission) mis.textContent = mission;
    if (note && founderNote) note.textContent = `"${founderNote}"`;
    if (img && founderImage) img.src = founderImage;
};

const renderJournal = async () => {
    const container = document.getElementById('journal-grid');
    if (!container) return;

    try {
        const res = await fetch('/api/journals');
        if (!res.ok) throw new Error('Failed to fetch journals');
        const journals = await res.json();

        if (journals.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full py-10 uppercase tracking-widest text-[10px] font-bold">No insights shared yet.</p>';
            return;
        }

        container.innerHTML = journals.map(post => `
            <article class="blog-card rounded-3xl group">
                <div class="h-64 overflow-hidden">
                    <img src="${post.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${post.title}">
                </div>
                <div class="p-8">
                    <div class="flex gap-4 mb-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                        <span>${post.date || ''}</span>
                        <span class="text-[#c5a059]">${post.category || 'INSIGHT'}</span>
                    </div>
                    <h3 class="text-2xl font-bold mb-4 group-hover:text-[#c5a059] transition-colors leading-tight">${post.title}</h3>
                    <p class="text-sm text-gray-400 mb-6 font-light line-clamp-3">${post.excerpt || ''}</p>
                    <a href="journal-details.html?id=${post.id}" class="text-xs font-black uppercase tracking-widest border-b-2 border-[#c5a059] pb-1">Read Insight</a>
                </div>
            </article>
        `).join('');
    } catch (err) {
        console.error(err);
    }
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

document.addEventListener('DOMContentLoaded', () => {
    // Setup back to top
    const btt = document.getElementById('back-to-top');
    if (btt) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) btt.classList.add('visible');
            else btt.classList.remove('visible');
        });
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    initThemeToggle(); // Call the theme toggle initialization
});

// --- THEME TOGGLE LOGIC ---
const initThemeToggle = () => {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const htmlEl = document.documentElement;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            htmlEl.setAttribute('data-theme', 'light');
            themeToggles.forEach(btn => {
                btn.querySelector('.sun-icon')?.classList.add('hidden');
                btn.querySelector('.moon-icon')?.classList.remove('hidden');
            });
        } else {
            htmlEl.removeAttribute('data-theme');
            themeToggles.forEach(btn => {
                btn.querySelector('.moon-icon')?.classList.add('hidden');
                btn.querySelector('.sun-icon')?.classList.remove('hidden');
            });
        }
    };

    // Load from memory
    const savedTheme = localStorage.getItem('dreamline_theme') || 'dark';
    applyTheme(savedTheme);

    // Bind clicks
    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('dreamline_theme', newTheme);
            applyTheme(newTheme);
        });
    });
};

// Review Slider Logic
const reviewTrack = document.querySelector('.review-track');
if (reviewTrack) {
    const reviews = Array.from(reviewTrack.children);
    reviews.forEach(review => {
        const clone = review.cloneNode(true);
        reviewTrack.appendChild(clone);
    });
}
