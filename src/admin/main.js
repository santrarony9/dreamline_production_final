import '../style.css'; // Import main tailwind styles

// Constants
console.log('Admin Panel v1.5.1 Loaded - Premium Luxury Theme');
const API_WEDDINGS_URL = '/api/weddings';
const API_CONTENT_URL = '/api/content';
const API_JOURNALS_URL = '/api/journals';
const UPLOAD_URL = '/api/upload';

// --- LOGGING SYSTEM ---
const systemLogs = [];
const originalLog = console.log;
const originalError = console.error;

const addLogEntry = (type, ...args) => {
    const time = new Date().toLocaleTimeString();
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    systemLogs.push({ time, type, message });

    // Auto-update modal if open
    const consoleEl = document.getElementById('log-console');
    if (consoleEl) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-type-${type}">${type.toUpperCase()}:</span>
            <span class="text-gray-300 ml-2">${message}</span>
        `;
        consoleEl.appendChild(entry);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
};

console.log = (...args) => {
    originalLog(...args);
    addLogEntry('info', ...args);
};

console.error = (...args) => {
    originalError(...args);
    addLogEntry('error', ...args);
};

console.warn = (...args) => {
    originalLog('WARN:', ...args);
    addLogEntry('warn', ...args);
};

window.addSuccessLog = (msg) => addLogEntry('success', msg);

// State
let weddings = [];
let journals = [];
let siteContent = {};

const renderStatsList = () => {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    if (!siteContent.stats) siteContent.stats = [];

    container.innerHTML = siteContent.stats.map((s, i) => `
        <div class="glass-card p-4 rounded-xl border-white/5 shadow-xl">
            <div class="mb-3">
                <label>Number</label>
                <input type="text" class="glass-input w-full p-3 rounded-lg text-sm" value="${s.value}" oninput="window.updateStat(${i}, 'value', this.value)">
            </div>
            <div class="mb-3">
                <label>Label</label>
                <input type="text" class="glass-input w-full p-3 rounded-lg text-sm" value="${s.label}" oninput="window.updateStat(${i}, 'label', this.value)">
            </div>
            <button type="button" class="w-full mt-2 text-[10px] text-red-400 opacity-50 hover:opacity-100 uppercase tracking-widest font-bold transition-opacity" onclick="window.deleteStat(${i})">Remove Stat</button>
        </div>
    `).join('');
};

window.updateStat = (index, field, value) => {
    siteContent.stats[index][field] = value;
};

window.deleteStat = (index) => {
    siteContent.stats.splice(index, 1);
    renderStatsList();
};

window.uploadHeroMedia = async (input) => {
    // This function will be replaced by setupFileUpload in init
};

const renderMarqueeFields = () => {
    const marqueeContainer = document.getElementById('marquee-container');
    marqueeContainer.innerHTML = '';
    (siteContent.marquee || []).forEach((text, i) => {
        marqueeContainer.innerHTML += `<input type="text" class="w-full p-4 rounded-xl glass-input mb-2" value="${text}" name="marquee_${i}">`;
    });
};

document.getElementById('add-stat-btn').addEventListener('click', () => {
    if (!siteContent.stats) siteContent.stats = [];
    siteContent.stats.push({ value: '0', label: 'New Stat' });
    renderStatsList();
});

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const weddingList = document.getElementById('wedding-list');
const editModal = document.getElementById('edit-modal');
const weddingForm = document.getElementById('wedding-form');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const addWeddingBtn = document.getElementById('add-wedding-btn');

// Journal Modal Elements
const journalModal = document.getElementById('journal-modal');
const journalForm = document.getElementById('journal-form');
const closeJournalModal = document.getElementById('close-journal-modal');
const cancelJournalBtn = document.getElementById('cancel-journal-btn');
const addJournalBtn = document.getElementById('add-journal-btn');

// Tabs
const tabHome = document.getElementById('tab-home');
const tabWeddings = document.getElementById('tab-weddings');
const tabMasterGallery = document.getElementById('tab-master-gallery');
const tabAbout = document.getElementById('tab-about');
const tabJournal = document.getElementById('tab-journal');

const sectionHome = document.getElementById('section-home');
const sectionWeddings = document.getElementById('section-weddings');
const sectionMasterGallery = document.getElementById('section-master-gallery');
const sectionAbout = document.getElementById('section-about');
const sectionJournal = document.getElementById('section-journal');

const homeForm = document.getElementById('home-form');
const masterGalleryForm = document.getElementById('master-gallery-form');
const aboutForm = document.getElementById('about-form');

// --- TABS ---
tabHome.addEventListener('click', () => switchTab('home'));
tabWeddings.addEventListener('click', () => switchTab('weddings'));
tabMasterGallery.addEventListener('click', () => switchTab('master-gallery'));
tabAbout.addEventListener('click', () => switchTab('about'));
tabJournal.addEventListener('click', () => switchTab('journal'));

const switchTab = (tab) => {
    // Hide all sections
    sectionHome.classList.add('hidden');
    sectionWeddings.classList.add('hidden');
    sectionMasterGallery.classList.add('hidden');
    sectionAbout.classList.add('hidden');
    sectionJournal.classList.add('hidden');

    // Reset tab styles
    [tabHome, tabWeddings, tabMasterGallery, tabAbout, tabJournal].forEach(t => {
        t.classList.remove('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        t.classList.add('text-gray-500');
    });

    // Show active section & style tab
    if (tab === 'home') {
        sectionHome.classList.remove('hidden');
        tabHome.classList.add('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        tabHome.classList.remove('text-gray-500');
        fetchContent();
    } else if (tab === 'weddings') {
        sectionWeddings.classList.remove('hidden');
        tabWeddings.classList.add('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        tabWeddings.classList.remove('text-gray-500');
        fetchWeddings();
    } else if (tab === 'master-gallery') {
        sectionMasterGallery.classList.remove('hidden');
        tabMasterGallery.classList.add('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        tabMasterGallery.classList.remove('text-gray-500');
        fetchContent();
    } else if (tab === 'about') {
        sectionAbout.classList.remove('hidden');
        tabAbout.classList.add('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        tabAbout.classList.remove('text-gray-500');
        fetchContent();
    } else if (tab === 'journal') {
        sectionJournal.classList.remove('hidden');
        tabJournal.classList.add('gold-gradient-text', 'border-b-2', 'border-gold-500', 'active-tab');
        tabJournal.classList.remove('text-gray-500');
        fetchJournals();
    }
};

// --- DATA FETCHING (Weddings) ---
const fetchWeddings = async () => {
    try {
        const res = await fetch(API_WEDDINGS_URL);
        weddings = await res.json();
        renderWeddingList();
    } catch (err) {
        console.error('Failed to fetch weddings:', err);
    }
};

// --- DATA FETCHING (Journals) ---
const fetchJournals = async () => {
    try {
        const res = await fetch(API_JOURNALS_URL);
        journals = await res.json();
        renderJournalList();
    } catch (err) {
        console.error('Failed to fetch journals:', err);
    }
};

// --- DATA FETCHING (Content) ---
const fetchContent = async () => {
    try {
        const res = await fetch(API_CONTENT_URL);
        siteContent = await res.json();
        renderHomeForm();
        renderMasterGalleryList();
        renderAboutForm();
    } catch (err) {
        console.error('Failed to fetch content:', err);
    }
};

const renderHomeForm = () => {
    if (!siteContent.hero) return;

    // Hero
    document.getElementById('hero-title-line1').value = siteContent.hero.title?.line1 || '';
    document.getElementById('hero-title-line2').value = siteContent.hero.title?.line2 || '';
    document.getElementById('hero-subtitle').value = siteContent.hero.subtitle || '';
    document.getElementById('hero-media-url').value = siteContent.hero.videoUrl || '';

    // Setup Hero Media Upload
    setupFileUpload('hero-media-upload', 'hero-media-status', 'hero-media-url');

    // Video Vault
    renderVideoVaultList();

    // Render Stats Cards
    renderStatsList();

    // Render Marquee
    renderMarqueeFields();

    // Gallery
    if (siteContent.gallery) {
        document.getElementById('gallery-title').value = siteContent.gallery.title || '';
        document.getElementById('gallery-subtitle').value = siteContent.gallery.subtitle || '';

        // Render Gallery Grid
        renderMotionGalleryForm(siteContent.gallery.images || []);
    }
};

const renderMotionGalleryForm = (images) => {
    const container = document.getElementById('gallery-container');
    const hiddenInput = document.getElementById('gallery-images');

    // Update hidden input
    if (hiddenInput) hiddenInput.value = images.join(',');

    container.innerHTML = images.map((img, i) => `
        <div class="glass-card p-2 rounded-xl border-white/5 overflow-hidden group relative aspect-square bg-white/2">
            <img src="${img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <button type="button" class="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90" onclick="window.removeGalleryImage(${i})">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <span class="text-[8px] font-bold uppercase tracking-widest text-white/40">Frame ${i + 1}</span>
            </div>
        </div>
    `).join('');
};

window.removeGalleryImage = (index) => {
    const hiddenInput = document.getElementById('gallery-images');
    const images = hiddenInput.value.split(',').filter(s => s);
    images.splice(index, 1);
    renderMotionGalleryForm(images);
};

// Gallery Upload Listener (with Multi-Upload Support)
const galleryUploadInput = document.getElementById('gallery-upload');
if (galleryUploadInput) {
    galleryUploadInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        const statusEl = document.getElementById('gallery-upload-status');
        const hiddenInput = document.getElementById('gallery-images');
        let currentImages = (hiddenInput?.value || '').split(',').filter(s => s);

        if (files.length === 0) return;

        statusEl.textContent = `OPTIMIZING ${files.length} ITEMS...`;
        statusEl.className = 'upload-status loading';

        try {
            for (const file of files) {
                const url = await uploadFile(file);
                if (url) currentImages.push(url);
            }
            renderMotionGalleryForm(currentImages);
            statusEl.textContent = 'RESTORED';
            statusEl.className = 'upload-status success';
            addSuccessLog(`Batch uploaded ${files.length} frames.`);
            setTimeout(() => statusEl.textContent = '', 3000);
        } catch (err) {
            statusEl.textContent = 'SYNC ERROR';
            statusEl.className = 'upload-status error';
        }
    });
}

const renderAboutForm = () => {
    if (!siteContent.about) return;

    document.getElementById('about-hero-title').value = siteContent.about.heroTitle || '';
    document.getElementById('about-hero-subtitle').value = siteContent.about.heroSubtitle || '';
    document.getElementById('about-vision').value = siteContent.about.vision || '';
    document.getElementById('about-mission').value = siteContent.about.mission || '';
    document.getElementById('about-founder-note').value = siteContent.about.founderNote || '';
    document.getElementById('about-founder-img').value = siteContent.about.founderImage || '';
};

const renderMasterGalleryList = () => {
    const container = document.getElementById('master-gallery-container');
    container.innerHTML = '';

    if (!siteContent.projects) siteContent.projects = [];

    container.innerHTML = siteContent.projects.map((proj, i) => `
        <div class="glass-card overflow-hidden group border-white/5 bg-white/2">
            <div class="relative h-40 overflow-hidden">
                <img src="${proj.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-3 left-4">
                    <span class="block text-gold font-black text-xs tracking-widest uppercase">${proj.type || 'Commercial'}</span>
                </div>
            </div>
            <div class="p-5">
                <span class="block text-white font-bold text-sm tracking-tight mb-4 truncate">${proj.title || 'Untitled'}</span>
                <div class="flex gap-3">
                    <button type="button" class="flex-1 bg-white/5 border border-white/10 text-[10px] font-black py-2.5 rounded-full hover:bg-gold hover:text-black transition-all uppercase tracking-widest" onclick="window.toggleEditProject(${i})">Edit Details</button>
                    <button type="button" class="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black px-4 py-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest" onclick="window.deleteProject(${i})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Edit Form (Hidden by default) -->
            <div id="edit-project-${i}" class="p-4 pt-0 space-y-4 hidden">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label>Title</label>
                        <input type="text" class="glass-input w-full p-2 rounded-lg text-xs" value="${proj.title}" oninput="window.updateProject(${i}, 'title', this.value)">
                    </div>
                    <div>
                        <label>Type</label>
                        <select class="glass-input w-full p-2 rounded-lg text-xs" onchange="window.updateProject(${i}, 'type', this.value)">
                            <option value="commercial" ${proj.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                            <option value="wedding" ${proj.type === 'wedding' ? 'selected' : ''}>Wedding</option>
                            <option value="music" ${proj.type === 'music' ? 'selected' : ''}>Music</option>
                        </select>
                    </div>
                </div>
                <div>
                     <label>Image URL</label>
                     <div class="flex items-center gap-2 mb-2">
                        <label class="bg-gold/10 text-gold border border-gold/30 px-3 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-gold hover:text-black transition-all">
                            <input type="file" onchange="window.uploadProjectImage(this, ${i})" class="hidden">
                            UPLOAD
                        </label>
                        <span id="proj-status-${i}" class="text-[9px] uppercase opacity-50"></span>
                    </div>
                     <input type="text" class="glass-input w-full p-2 rounded-lg text-xs" value="${proj.img}" oninput="window.updateProject(${i}, 'img', this.value)">
                </div>
                <button type="button" class="w-full text-[10px] font-bold text-gold uppercase tracking-widest text-center py-2 bg-gold/5 rounded-lg border border-gold/10" onclick="window.toggleEditProject(${i})">DONE</button>
            </div>
        </div>
    `).join('');
};

window.toggleEditProject = (index) => {
    const el = document.getElementById(`edit-project-${index}`);
    el.classList.toggle('hidden');
};

window.updateProject = (index, field, value) => {
    siteContent.projects[index][field] = value;
    // We don't re-render list here to avoid losing focus, just update state
    // Update preview if image changed via URL input
    if (field === 'img') {
        // Optional: update thumbnail src if we could find it easily
    }
};

window.deleteProject = (index) => {
    if (!confirm('Delete this project?')) return;
    siteContent.projects.splice(index, 1);
    renderMasterGalleryList();
};

window.uploadProjectImage = async (input, index) => {
    if (input.files[0]) {
        const statusEl = document.getElementById(`proj-status-${index}`);
        statusEl.textContent = '...';
        const url = await uploadFile(input.files[0]);
        if (url) {
            siteContent.projects[index].img = url;
            renderMasterGalleryList(); // Re-render to show new image
        } else {
            statusEl.textContent = 'Err';
        }
    }
};

document.getElementById('add-project-btn').addEventListener('click', () => {
    siteContent.projects.push({ title: 'New Project', type: 'commercial', img: '' });
    renderMasterGalleryList();
    // Open edit for the new item
    window.toggleEditProject(siteContent.projects.length - 1);
});

const renderVideoVaultList = () => {
    const container = document.getElementById('video-vault-container');
    container.innerHTML = '';
    if (!siteContent.videoVault) siteContent.videoVault = [];

    container.innerHTML = siteContent.videoVault.map((item, i) => `
        <div class="glass-card overflow-hidden group border-white/5 bg-white/2 relative">
            <div class="relative aspect-[21/9] overflow-hidden">
                <img src="${item.image || 'https://via.placeholder.com/1920x800?text=No+Thumbnail'}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <label class="w-8 h-8 rounded-full bg-gold/90 text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <input type="file" class="hidden" onchange="window.uploadVaultMedia(this, ${i}, 'image')">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </label>
                    <button type="button" class="w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:scale-110 transition-transform" onclick="window.deleteVault(${i})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="absolute bottom-2 left-3">
                     <span class="text-[8px] font-black uppercase tracking-widest text-gold/80">${item.category || 'CINEMA'}</span>
                </div>
            </div>
            <div class="p-4 space-y-3">
                <input type="text" class="w-full glass-input text-xs p-2" value="${item.title || ''}" placeholder="Video Title" oninput="window.updateVault(${i}, 'title', this.value)">
                <div class="flex items-center gap-2">
                    <input type="text" class="flex-1 glass-input text-[10px] p-2" value="${item.videoUrl || ''}" placeholder="Video URL (S3/MP4)" oninput="window.updateVault(${i}, 'videoUrl', this.value)">
                    <label class="cursor-pointer text-gold hover:text-white transition-colors">
                        <input type="file" class="hidden" onchange="window.uploadVaultMedia(this, ${i}, 'videoUrl')">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </label>
                </div>
            </div>
             <div id="vault-img-status-${i}" class="absolute top-2 right-2 text-[8px] font-bold text-gold pointer-events-none"></div>
             <div id="vault-vid-status-${i}" class="absolute top-2 right-12 text-[8px] font-bold text-gray-500 pointer-events-none"></div>
        </div>
    `).join('');
};

window.handleVaultBulkUpload = async (input) => {
    const files = Array.from(input.files);
    if (files.length === 0) return;

    addSuccessLog(`Optimizing ${files.length} vault frames...`);

    for (const file of files) {
        const url = await uploadFile(file);
        if (url) {
            siteContent.videoVault.push({
                title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
                category: 'ARCHIVE',
                image: url,
                videoUrl: ''
            });
        }
    }
    renderVideoVaultList();
};

window.toggleEditVault = (index) => {
    document.getElementById(`edit-vault-${index}`).classList.toggle('hidden');
};

window.updateVault = (index, field, value) => {
    siteContent.videoVault[index][field] = value;
};

window.deleteVault = (index) => {
    if (!confirm('Delete this video?')) return;
    siteContent.videoVault.splice(index, 1);
    renderVideoVaultList();
};

window.uploadVaultMedia = async (input, index, field) => {
    if (input.files[0]) {
        const typeStr = field === 'image' ? 'img' : 'vid';
        const statusEl = document.getElementById(`vault-${typeStr}-status-${index}`);
        statusEl.textContent = '...';
        const url = await uploadFile(input.files[0]);
        if (url) {
            siteContent.videoVault[index][field] = url;
            if (field === 'image') renderVideoVaultList(); // Re-render for thumb
            else {
                // Just update text input if video
                statusEl.textContent = 'Done';
                // Force re-render not needed for video url text, but consistent state is key.
                // Actually re-rendering is safer to update the inputs value attribute
                renderVideoVaultList();
            }
        } else {
            statusEl.textContent = 'Err';
        }
    }
}

document.getElementById('add-vault-btn').addEventListener('click', () => {
    siteContent.videoVault.push({ title: 'New Video', category: 'Category', image: '', videoUrl: '' });
    renderVideoVaultList();
    window.toggleEditVault(siteContent.videoVault.length - 1);
});


// Home Form Submit
homeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedContent = { ...siteContent };

    // Update Hero
    updatedContent.hero.title.line1 = document.getElementById('hero-title-line1').value;
    updatedContent.hero.title.line2 = document.getElementById('hero-title-line2').value;
    updatedContent.hero.subtitle = document.getElementById('hero-subtitle').value;
    updatedContent.hero.videoUrl = document.getElementById('hero-media-url').value;

    // Update Video Vault
    updatedContent.videoVault = siteContent.videoVault;

    // Update Marquee
    updatedContent.marquee = Array.from(document.querySelectorAll('#marquee-container input')).map(input => input.value);

    // Update Stats (Now uses direct state sync)
    updatedContent.stats = siteContent.stats;

    // Update Gallery
    updatedContent.gallery.title = document.getElementById('gallery-title').value;
    updatedContent.gallery.subtitle = document.getElementById('gallery-subtitle').value;
    updatedContent.gallery.title = document.getElementById('gallery-title').value;
    updatedContent.gallery.subtitle = document.getElementById('gallery-subtitle').value;
    updatedContent.gallery.images = document.getElementById('gallery-images').value.split(',').filter(s => s);

    await saveContent(updatedContent);
});

// Master Gallery Form Submit
masterGalleryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedContent = { ...siteContent };

    // projects are already updated in siteContent state via inputs
    updatedContent.projects = siteContent.projects;

    await saveContent(updatedContent);
});

// About Form Submit
aboutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedContent = { ...siteContent };

    if (!updatedContent.about) updatedContent.about = {};

    updatedContent.about.heroTitle = document.getElementById('about-hero-title').value;
    updatedContent.about.heroSubtitle = document.getElementById('about-hero-subtitle').value;
    updatedContent.about.vision = document.getElementById('about-vision').value;
    updatedContent.about.mission = document.getElementById('about-mission').value;
    updatedContent.about.founderNote = document.getElementById('about-founder-note').value;
    updatedContent.about.founderImage = document.getElementById('about-founder-img').value;
    updatedContent.about.heroImage = document.getElementById('hero-bg').value;

    await saveContent(updatedContent);
});

window.uploadAboutHero = async (input) => {
    const file = input.files[0];
    const statusEl = document.getElementById('hero-upload-status');
    if (!file) return;

    statusEl.textContent = 'Uploading...';
    statusEl.className = 'upload-status loading';

    try {
        const url = await uploadFile(file);
        if (url) {
            document.getElementById('hero-bg').value = url;
            statusEl.textContent = 'Success!';
            statusEl.className = 'upload-status success';
        }
    } catch (err) {
        statusEl.textContent = 'Failed';
        statusEl.className = 'upload-status error';
    }
};

const saveContent = async (content) => {
    try {
        const res = await fetch(API_CONTENT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        });
        if (!res.ok) throw new Error('Failed to save');
        alert('Content updated successfully!');
        siteContent = content; // Update local state
    } catch (err) {
        alert('Error saving content');
    }
};

// Upload for Content Form
// --- FILE UPLOAD HELPER (with Compression) ---
const uploadFile = async (file) => {
    let fileToUpload = file;

    // Client-side compression for images
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
        try {
            console.log(`Compressing ${file.name} locally...`);
            const compressed = await compressImage(file);
            if (compressed) fileToUpload = compressed;
        } catch (err) {
            console.warn('Local compression failed, uploading original:', err);
        }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Upload failed');
        }
        const data = await res.json();
        return data.url;
    } catch (err) {
        console.error(err);
        alert(`File upload failed: ${err.message}`);
        return null;
    }
};

const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Max dimensions
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1600;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Canvas toBlob failed'));
                    resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
                }, 'image/webp', 0.8);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Upload for Content Form (Enhanced)
const setupFileUpload = (inputId, statusId, urlInputId, previewId = null) => {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        const statusEl = document.getElementById(statusId);
        if (!file) return;

        statusEl.textContent = 'OPTIMIZING...';
        statusEl.className = 'upload-status loading';

        try {
            const url = await uploadFile(file);
            if (url) {
                const urlInp = document.getElementById(urlInputId);
                if (urlInp) urlInp.value = url;
                if (previewId) {
                    const prev = document.getElementById(previewId);
                    if (prev) {
                        prev.src = url;
                        prev.classList.remove('hidden');
                    }
                }
                statusEl.textContent = 'READY';
                statusEl.className = 'upload-status success';
                addSuccessLog(`Uploaded: ${file.name}`);
            } else {
                statusEl.textContent = 'FAILED';
                statusEl.className = 'upload-status error';
            }
        } catch (err) {
            statusEl.textContent = 'ERROR';
            statusEl.className = 'upload-status error';
        }
    });
};

// Init Uploaders
setupFileUpload('hero-media-upload', 'hero-media-status', 'hero-media-url');
setupFileUpload('about-founder-upload', 'about-founder-status', 'about-founder-img');
setupFileUpload('gallery-upload', 'gallery-upload-status', 'gallery-images');


// --- JOURNAL FUNCTIONS ---

const renderJournalList = () => {
    const list = document.getElementById('journal-list');
    list.innerHTML = journals.map(j => `
        <div class="glass-card p-5 rounded-2xl flex flex-col justify-between border-white/5 transition-all">
            <div class="relative group overflow-hidden rounded-xl mb-4">
                 <img src="${j.image}" alt="${j.title}" class="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110">
                 <div class="absolute top-3 left-3 flex gap-2">
                    <span class="bg-black/60 backdrop-blur-md text-[9px] text-white px-3 py-1 rounded-full uppercase tracking-widest font-bold">${j.date || ''}</span>
                    <span class="bg-gold/80 backdrop-blur-md text-[9px] text-black px-3 py-1 rounded-full uppercase tracking-widest font-bold">${j.category || ''}</span>
                 </div>
            </div>
            <div>
                <h3 class="font-bold text-lg text-white leading-tight mb-3 line-clamp-2">${j.title}</h3>
                <p class="text-gray-500 text-xs line-clamp-3 leading-relaxed mb-6">${j.excerpt || ''}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="window.editJournal('${j.id}')" class="flex-1 bg-white/5 border border-white/10 text-[10px] font-bold py-3 rounded-xl hover:bg-gold hover:text-black transition-all uppercase tracking-widest">EDIT</button>
                <button onclick="window.deleteJournal('${j.id}')" class="bg-red-900/20 text-red-500 text-[10px] font-bold px-4 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">DEL</button>
            </div>
        </div>
    `).join('');
};


const openJournalModal = (journal = null) => {
    journalModal.classList.remove('hidden');
    journalForm.reset();

    if (journal) {
        document.getElementById('journal-modal-title').textContent = 'Edit Article';
        document.getElementById('journal-id').value = journal.id;
        document.getElementById('journal-title').value = journal.title;
        document.getElementById('journal-date').value = journal.date;
        document.getElementById('journal-category').value = journal.category;
        document.getElementById('journal-image').value = journal.image;
        document.getElementById('journal-excerpt').value = journal.excerpt;
        document.getElementById('journal-content').value = journal.content || '';
    } else {
        document.getElementById('journal-modal-title').textContent = 'New Article';
        document.getElementById('journal-id').value = '';
    }
};

const closeJournalModalFunc = () => {
    journalModal.classList.add('hidden');
};

// Journal Events
addJournalBtn.addEventListener('click', () => openJournalModal());
closeJournalModal.addEventListener('click', closeJournalModalFunc);
cancelJournalBtn.addEventListener('click', closeJournalModalFunc);

document.getElementById('journal-image-upload').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const url = await uploadFile(e.target.files[0]);
        if (url) {
            document.getElementById('journal-image').value = url;
        }
    }
});

journalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('journal-id').value || `journal-${Date.now()}`;
    const newJournal = {
        id,
        title: document.getElementById('journal-title').value,
        date: document.getElementById('journal-date').value,
        category: document.getElementById('journal-category').value,
        image: document.getElementById('journal-image').value,
        excerpt: document.getElementById('journal-excerpt').value,
        content: document.getElementById('journal-content').value
    };

    const existing = journals.find(j => j.id === id);
    // If Updating, merge
    if (existing) {
        Object.assign(newJournal, { createdAt: existing.createdAt }); // Keep meta
    }

    try {
        const method = existing ? 'PUT' : 'POST';
        const url = existing ? `${API_JOURNALS_URL}/${id}` : API_JOURNALS_URL;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newJournal)
        });

        if (!res.ok) throw new Error('Save failed');

        closeJournalModalFunc();
        fetchJournals();
    } catch (err) {
        console.error(err);
        alert('Error saving journal');
    }
});

// Global Journal Handlers
window.editJournal = (id) => {
    const journal = journals.find(j => j.id === id);
    openJournalModal(journal);
};

window.deleteJournal = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
        await fetch(`${API_JOURNALS_URL}/${id}`, { method: 'DELETE' });
        fetchJournals();
    } catch (err) {
        alert('Error deleting journal');
    }
};

// --- RENDERING ---
const renderWeddingList = () => {
    weddingList.innerHTML = weddings.map(w => `
        <div class="glass-card p-6 rounded-2xl flex flex-col justify-between border-white/5">
            <div>
                <div class="relative overflow-hidden rounded-xl mb-5">
                    <img src="${w.coverImage}" alt="${w.title}" class="w-full h-52 object-cover transition-transform duration-700 hover:scale-105">
                </div>
                <h3 class="font-bold text-lg gold-gradient-text transition-all">${w.title}</h3>
                <p class="text-gray-400 text-xs font-medium mb-3 uppercase tracking-widest">${w.subtitle || ''}</p>
                <p class="text-gray-500 text-xs line-clamp-3 leading-relaxed mb-6">${w.description}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="window.editWedding('${w.id}')" class="flex-1 bg-white/5 border border-white/10 text-[10px] font-bold py-3 rounded-xl hover:bg-gold hover:text-black transition-all uppercase tracking-widest">EDIT FILM</button>
                <button onclick="window.deleteWedding('${w.id}')" class="bg-red-900/20 text-red-500 text-[10px] font-bold px-4 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">DEL</button>
            </div>
        </div>
    `).join('');
};


// --- FORM HANDLING ---
const openModal = (wedding = null) => {
    editModal.classList.remove('hidden');
    // Reset form
    weddingForm.reset();
    document.getElementById('chapters-container').innerHTML = '';

    if (wedding) {
        document.getElementById('modal-title').textContent = 'Edit Wedding';
        document.getElementById('wedding-id').value = wedding.id;
        document.getElementById('title').value = wedding.title;
        document.getElementById('subtitle').value = wedding.subtitle;
        document.getElementById('description').value = wedding.description;
        document.getElementById('cover-image-url').value = wedding.coverImage;
        document.getElementById('preview-cover').src = wedding.coverImage;
        document.getElementById('hover-video-url').value = wedding.hoverVideo || '';
        document.getElementById('youtube-url').value = wedding.videoUrl || '';
        document.getElementById('album-url').value = wedding.albumUrl || '';

        // Render Chapters (Simplified for MVP)
        if (wedding.storyChapters) {
            wedding.storyChapters.forEach((chapter, index) => addChapterField(chapter, index));
        }
    } else {
        document.getElementById('modal-title').textContent = 'Add New Wedding';
        document.getElementById('wedding-id').value = '';
        document.getElementById('preview-cover').src = '';
    }
};

const closeModalFunc = () => {
    editModal.classList.add('hidden');
};

const addChapterField = (chapter = { title: '', images: [] }, index) => {
    const container = document.getElementById('chapters-container');
    const div = document.createElement('div');
    div.className = 'glass-card p-6 rounded-2xl border-white/5 bg-white/5 space-y-4';
    div.id = `chapter-card-${index}`;

    div.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h4 class="text-xs font-black uppercase tracking-[0.2em] text-gold">Chapter ${index + 1}</h4>
            <button type="button" class="text-[9px] text-red-400 uppercase font-bold hover:text-white" onclick="this.closest('#chapter-card-${index}').remove()">Delete Chapter</button>
        </div>
        <input type="text" class="w-full p-4 rounded-xl glass-input text-sm" placeholder="Chapter Name (e.g., The Vows)" value="${chapter.title}" name="chapter_title_${index}">
        
        <div class="space-y-3">
            <label class="block text-[10px] uppercase font-bold text-gray-400">Chapter Frames</label>
            <div id="chapter-images-grid-${index}" class="grid grid-cols-4 md:grid-cols-6 gap-3">
                ${(chapter.images || []).map((img, imgIdx) => `
                    <div class="relative aspect-square rounded-lg overflow-hidden border border-white/5 group">
                        <img src="${img}" class="w-full h-full object-cover">
                        <button type="button" class="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white" onclick="window.removeChapterImage(${index}, ${imgIdx})">
                             <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                `).join('')}
                <label class="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-all group">
                    <input type="file" multiple class="hidden" onchange="window.handleChapterUpload(this, ${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span class="text-[8px] font-bold mt-1 text-gray-500 group-hover:text-gold uppercase tracking-tighter">Add</span>
                </label>
            </div>
            <input type="hidden" id="chapter-images-data-${index}" name="chapter_images_${index}" value="${(chapter.images || []).join(',')}">
        </div>
    `;
    container.appendChild(div);
};

window.removeChapterImage = (chapterIndex, imgIdx) => {
    const dataInput = document.getElementById(`chapter-images-data-${chapterIndex}`);
    let images = dataInput.value.split(',').filter(s => s);
    images.splice(imgIdx, 1);
    dataInput.value = images.join(',');

    // Refresh only the grid
    refreshChapterGrid(chapterIndex, images);
};

window.handleChapterUpload = async (input, chapterIndex) => {
    const files = Array.from(input.files);
    if (files.length === 0) return;

    const dataInput = document.getElementById(`chapter-images-data-${chapterIndex}`);
    let images = dataInput.value.split(',').filter(s => s);

    addSuccessLog(`Optimizing ${files.length} chapter frames...`);

    for (const file of files) {
        const url = await uploadFile(file);
        if (url) images.push(url);
    }

    dataInput.value = images.join(',');
    refreshChapterGrid(chapterIndex, images);
};

const refreshChapterGrid = (chapterIndex, images) => {
    const grid = document.getElementById(`chapter-images-grid-${chapterIndex}`);
    const lastItem = grid.lastElementChild; // The plus button

    grid.innerHTML = images.map((img, imgIdx) => `
        <div class="relative aspect-square rounded-lg overflow-hidden border border-white/5 group">
            <img src="${img}" class="w-full h-full object-cover">
            <button type="button" class="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white" onclick="window.removeChapterImage(${chapterIndex}, ${imgIdx})">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `).join('');
    grid.appendChild(lastItem);
};

// Global handlers for buttons in innerHTML
window.editWedding = (id) => {
    const wedding = weddings.find(w => w.id === id);
    openModal(wedding);
};

window.deleteWedding = async (id) => {
    if (!confirm('Are you sure you want to delete this wedding?')) return;
    try {
        await fetch(`${API_WEDDINGS_URL}/${id}`, { method: 'DELETE' });
        fetchWeddings();
    } catch (err) {
        alert('Error deleting wedding');
    }
};

// Event Listeners
addWeddingBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', closeModalFunc);
cancelBtn.addEventListener('click', closeModalFunc);
document.getElementById('add-chapter-btn').addEventListener('click', () => {
    const count = document.getElementById('chapters-container').children.length;
    addChapterField({ title: '', images: [] }, count);
});

// File Inputs
setupFileUpload('cover-image-upload', 'preview-cover', 'cover-image-url'); // Status will be handled by setup if I add a status field, but for now it's okay.
// Wait, I should add status fields for these too in admin.html for consistency.
// Let's just use the logic for now.

// Form Submit
weddingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect Data
    const id = document.getElementById('wedding-id').value || `wedding-${Date.now()}`;
    const newWedding = {
        id,
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        description: document.getElementById('description').value,
        coverImage: document.getElementById('cover-image-url').value,
        hoverVideo: document.getElementById('hover-video-url').value,
        videoUrl: document.getElementById('youtube-url').value,
        albumUrl: document.getElementById('album-url').value,
        reviews: [], // Preserve existing or empty
        storyChapters: [], // Collect below
        vendors: [] // Preserve for now
    };

    // Collect Chapters
    const chapterDivs = document.getElementById('chapters-container').children;
    for (let i = 0; i < chapterDivs.length; i++) {
        const title = chapterDivs[i].querySelector(`input[name="chapter_title_${i}"]`).value;
        const imagesStr = chapterDivs[i].querySelector(`[name="chapter_images_${i}"]`).value;
        const images = imagesStr.split(',').map(s => s.trim()).filter(s => s);
        newWedding.storyChapters.push({ title, images });
    }

    // Preserve items we didn't edit in this simple form (reviews, vendors)
    // If updating, merge with existing
    const existing = weddings.find(w => w.id === id);
    const finalData = existing ? { ...existing, ...newWedding } : newWedding;

    try {
        const method = existing ? 'PUT' : 'POST';
        const url = existing ? `${API_WEDDINGS_URL}/${id}` : API_WEDDINGS_URL;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });

        if (!res.ok) throw new Error('Save failed');

        closeModalFunc();
        fetchWeddings();
    } catch (err) {
        console.error(err);
        alert('Error saving wedding');
    }
});

// Init
// --- AUTHENTICATION ---
const checkAuth = () => {
    try {
        const isAdmin = localStorage.getItem('isAdmin');
        if (isAdmin === 'true') {
            showDashboard();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
    }
};

const showDashboard = () => {
    try {
        console.log('Showing dashboard...');
        const screen = document.getElementById('login-screen');
        const dash = document.getElementById('dashboard');

        if (screen) {
            screen.classList.add('hidden-force');
            screen.style.setProperty('display', 'none', 'important');
        }
        if (dash) {
            dash.classList.remove('hidden', 'hidden-force');
            dash.style.setProperty('display', 'flex', 'important');
        }

        fetchWeddings();

        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.click();
        } else {
            console.warn('tab-home not found for initial click');
        }
    } catch (err) {
        console.error('showDashboard failed:', err);
        alert('Dashboard load error: ' + err.message);
    }
};

const handleLogin = async () => {
    // Redundant now as admin.html has inline handler, 
    // but kept as safety for Enter key binding
    try {
        const pInput = document.getElementById('pass-key');
        if (!pInput) return;
        await new Promise(r => setTimeout(r, 100)); // Browser delay
        const pass = pInput.value.trim();
        if (pass.toLowerCase() === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            showDashboard();
        }
    } catch (err) {
        console.error('handleLogin Error:', err);
    }
};

// Export to window
window.initializeDashboard = showDashboard; // Allow inline script to trigger it

// Safe Initialization
const init = () => {
    console.log('Initializing Admin UI v1.3.6...');

    // Attach Enter key
    const pInput = document.getElementById('password-input');
    if (pInput) {
        pInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // Password toggle
    const tBtn = document.getElementById('toggle-password');
    if (tBtn && pInput) {
        tBtn.addEventListener('click', () => {
            const type = pInput.getAttribute('type') === 'password' ? 'text' : 'password';
            pInput.setAttribute('type', type);
            tBtn.style.opacity = type === 'text' ? '1' : '0.5';
        });
    }

    // Logout
    const logout = document.getElementById('logout-btn');
    if (logout) {
        logout.addEventListener('click', () => {
            localStorage.removeItem('isAdmin');
            location.reload();
        });
    }

    // Tabs
    const tabs = [
        { id: 'tab-home', key: 'home' },
        { id: 'tab-about', key: 'about' },
        { id: 'tab-weddings', key: 'weddings' },
        { id: 'tab-master-gallery', key: 'master-gallery' },
        { id: 'tab-journal', key: 'journal' }
    ];

    tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) el.addEventListener('click', () => switchTab(t.key));
    });

    // Forms
    const forms = [
        { id: 'home-form', handler: (e) => e.preventDefault() }, // Add real handlers later if needed
        { id: 'master-gallery-form', handler: (e) => e.preventDefault() },
        { id: 'about-form', handler: (e) => e.preventDefault() }
    ];
    // Note: real handlers are defined elsewhere in the file, 
    // this is just to ensure they are connected if they weren't before.

    checkAuth();
};

// Log Console Handlers
document.addEventListener('DOMContentLoaded', () => {
    const logModal = document.getElementById('log-modal');
    const viewLogsBtn = document.getElementById('view-logs-btn');
    const closeLogModal = document.getElementById('close-log-modal');
    const copyBtn = document.getElementById('copy-logs-btn');
    const clearBtn = document.getElementById('clear-logs-btn');

    if (viewLogsBtn) {
        viewLogsBtn.addEventListener('click', () => {
            logModal.classList.remove('hidden');
            // Refresh view
            const consoleEl = document.getElementById('log-console');
            consoleEl.innerHTML = systemLogs.map(l => `
                <div class="log-entry">
                    <span class="log-time">[${l.time}]</span>
                    <span class="log-type-${l.type}">${l.type.toUpperCase()}:</span>
                    <span class="text-gray-300 ml-2">${l.message}</span>
                </div>
            `).join('') || '<p class="text-gray-600 italic">// No activity recorded yet.</p>';
            consoleEl.scrollTop = consoleEl.scrollHeight;
        });
    }

    if (closeLogModal) {
        closeLogModal.addEventListener('click', () => logModal.classList.add('hidden'));
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = systemLogs.map(l => `[${l.time}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'COPIED!';
                setTimeout(() => copyBtn.textContent = originalText, 2000);
            });
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            systemLogs.length = 0;
            const consoleEl = document.getElementById('log-console');
            if (consoleEl) consoleEl.innerHTML = '<p class="text-gray-600 italic">// Console cleared.</p>';
        });
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
