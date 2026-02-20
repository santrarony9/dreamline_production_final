import '../style.css'; // Import main tailwind styles

// Constants
const API_WEDDINGS_URL = '/api/weddings';
const API_CONTENT_URL = '/api/content';
const API_JOURNALS_URL = '/api/journals';
const UPLOAD_URL = '/api/upload';

// State
let weddings = [];
let journals = [];
let siteContent = {};

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
        t.classList.remove('text-gold-500', 'border-b-2', 'border-gold-500');
        t.classList.add('text-gray-500');
    });

    // Show active section & style tab
    if (tab === 'home') {
        sectionHome.classList.remove('hidden');
        tabHome.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabHome.classList.remove('text-gray-500');
        fetchContent(); // Reload to get fresh data
    } else if (tab === 'weddings') {
        sectionWeddings.classList.remove('hidden');
        tabWeddings.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabWeddings.classList.remove('text-gray-500');
        fetchWeddings();
    } else if (tab === 'master-gallery') {
        sectionMasterGallery.classList.remove('hidden');
        tabMasterGallery.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabMasterGallery.classList.remove('text-gray-500');
        fetchContent(); // Master Gallery projects are part of content
    } else if (tab === 'about') {
        sectionAbout.classList.remove('hidden');
        tabAbout.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabAbout.classList.remove('text-gray-500');
        fetchContent(); // About is part of content
    } else if (tab === 'journal') {
        sectionJournal.classList.remove('hidden');
        tabJournal.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
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
    document.getElementById('hero-video-url').value = siteContent.hero.videoUrl || '';

    // Video Vault
    renderVideoVaultList();

    // Marquee
    const marqueeContainer = document.getElementById('marquee-container');
    marqueeContainer.innerHTML = '';
    (siteContent.marquee || []).forEach((text, i) => {
        marqueeContainer.innerHTML += `<input type="text" class="w-full p-2 border rounded" value="${text}" name="marquee_${i}">`;
    });

    // Stats
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    (siteContent.stats || []).forEach((stat, i) => {
        statsContainer.innerHTML += `
            <div class="border p-2 rounded">
                <input type="text" class="w-full p-1 border rounded mb-1 text-sm font-bold" value="${stat.value}" name="stat_val_${i}" placeholder="Value">
                <input type="text" class="w-full p-1 border rounded text-xs" value="${stat.label}" name="stat_lbl_${i}" placeholder="Label">
            </div>
        `;
    });

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
    hiddenInput.value = images.join(',');

    container.innerHTML = images.map((img, i) => `
        <div class="gallery-item group relative">
            <img src="${img}" class="w-full h-full object-cover">
            <div class="gallery-item-actions">
                <button type="button" class="btn-remove-img" onclick="removeGalleryImage(${i})">Remove</button>
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

// Gallery Upload Listener
document.getElementById('gallery-upload').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    const statusEl = document.getElementById('gallery-upload-status');
    const hiddenInput = document.getElementById('gallery-images');
    let currentImages = hiddenInput.value.split(',').filter(s => s);

    if (files.length === 0) return;

    statusEl.textContent = 'Uploading...';
    statusEl.className = 'upload-status loading';

    try {
        for (const file of files) {
            const url = await uploadFile(file);
            if (url) currentImages.push(url);
        }
        renderMotionGalleryForm(currentImages);
        statusEl.textContent = 'Done!';
        statusEl.className = 'upload-status success';
        setTimeout(() => statusEl.textContent = '', 2000);
    } catch (err) {
        statusEl.textContent = 'Error';
        statusEl.className = 'upload-status error';
    }
});

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
        <div class="admin-card">
            <img src="${proj.img}" class="admin-card-thumb">
            <div class="admin-card-body">
                <span class="admin-card-title">${proj.title || 'Untitled'}</span>
                <span class="admin-card-subtitle">${proj.type || 'Commercial'}</span>
            </div>
            <div class="admin-card-actions">
                <button type="button" class="btn-edit-card" onclick="window.toggleEditProject(${i})">Edit</button>
                <button type="button" class="btn-delete-card" onclick="window.deleteProject(${i})">Delete</button>
            </div>
            
            <!-- Edit Form (Hidden by default) -->
            <div id="edit-project-${i}" class="admin-card-edit hidden">
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label class="block text-xs font-bold mb-1">Title</label>
                        <input type="text" class="w-full p-1 border rounded text-xs" value="${proj.title}" oninput="window.updateProject(${i}, 'title', this.value)">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">Type</label>
                        <select class="w-full p-1 border rounded text-xs" onchange="window.updateProject(${i}, 'type', this.value)">
                            <option value="commercial" ${proj.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                            <option value="wedding" ${proj.type === 'wedding' ? 'selected' : ''}>Wedding</option>
                            <option value="music" ${proj.type === 'music' ? 'selected' : ''}>Music</option>
                        </select>
                    </div>
                </div>
                <div class="mb-2">
                     <label class="block text-xs font-bold mb-1">Image</label>
                     <div class="upload-group mb-1">
                        <label class="btn-upload py-1 px-2 text-xs">
                            <input type="file" onchange="window.uploadProjectImage(this, ${i})">
                            <span>Replace Image</span>
                        </label>
                        <span id="proj-status-${i}" class="upload-status"></span>
                    </div>
                     <input type="text" class="w-full p-1 border rounded text-xs" value="${proj.img}" oninput="window.updateProject(${i}, 'img', this.value)">
                </div>
                <button type="button" class="text-xs text-blue-600 underline" onclick="window.toggleEditProject(${i})">Done</button>
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
         <div class="admin-card">
            <img src="${item.image}" class="admin-card-thumb">
            <div class="admin-card-body">
                <span class="admin-card-title">${item.title || 'Untitled'}</span>
                <span class="admin-card-subtitle">${item.category || 'No Category'}</span>
            </div>
            <div class="admin-card-actions">
                <button type="button" class="btn-edit-card" onclick="window.toggleEditVault(${i})">Edit</button>
                <button type="button" class="btn-delete-card" onclick="window.deleteVault(${i})">Delete</button>
            </div>
            
            <!-- Edit Form -->
             <div id="edit-vault-${i}" class="admin-card-edit hidden">
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" class="w-full p-1 border rounded text-xs" value="${item.title}" placeholder="Title" oninput="window.updateVault(${i}, 'title', this.value)">
                    <input type="text" class="w-full p-1 border rounded text-xs" value="${item.category}" placeholder="Category" oninput="window.updateVault(${i}, 'category', this.value)">
                </div>
                <div class="mb-2">
                     <label class="block text-xs font-bold mb-1">Thumbnail</label>
                      <div class="upload-group mb-1">
                        <label class="btn-upload py-1 px-2 text-xs">
                            <input type="file" onchange="window.uploadVaultMedia(this, ${i}, 'image')">
                            <span>Replace Thumb</span>
                        </label>
                        <span id="vault-img-status-${i}" class="upload-status"></span>
                    </div>
                     <input type="text" class="w-full p-1 border rounded text-xs" value="${item.image}" oninput="window.updateVault(${i}, 'image', this.value)">
                </div>
                <div>
                     <label class="block text-xs font-bold mb-1">Video URL</label>
                      <div class="upload-group mb-1">
                         <label class="btn-upload py-1 px-2 text-xs">
                            <input type="file" onchange="window.uploadVaultMedia(this, ${i}, 'videoUrl')">
                            <span>Upload Video</span>
                        </label>
                         <span id="vault-vid-status-${i}" class="upload-status"></span>
                     </div>
                     <input type="text" class="w-full p-1 border rounded text-xs" value="${item.videoUrl}" oninput="window.updateVault(${i}, 'videoUrl', this.value)">
                </div>
                <button type="button" class="mt-2 text-xs text-blue-600 underline" onclick="window.toggleEditVault(${i})">Done</button>
            </div>
        </div>
    `).join('');
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
    updatedContent.hero.videoUrl = document.getElementById('hero-video-url').value;

    // Update Video Vault
    // Video Vault Update: Handled by state sync above, no need to scrape
    // Just ensure updatedContent.videoVault is current siteContent.videoVault
    updatedContent.videoVault = siteContent.videoVault;

    // Update Marquee
    updatedContent.marquee = Array.from(document.querySelectorAll('#marquee-container input')).map(input => input.value);

    // Update Stats
    updatedContent.stats = Array.from(document.querySelectorAll('#stats-container > div')).map((div, i) => ({
        value: div.querySelector(`input[name="stat_val_${i}"]`).value,
        label: div.querySelector(`input[name="stat_lbl_${i}"]`).value
    }));

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

    await saveContent(updatedContent);
});

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
// Upload for Content Form (Enhanced)
const setupFileUpload = (inputId, statusId, urlInputId, previewId = null) => {
    document.getElementById(inputId).addEventListener('change', async (e) => {
        const file = e.target.files[0];
        const statusEl = document.getElementById(statusId);
        if (!file) return;

        statusEl.textContent = 'Uploading...';
        statusEl.className = 'upload-status loading';

        try {
            const url = await uploadFile(file);
            if (url) {
                document.getElementById(urlInputId).value = url;
                if (previewId) document.getElementById(previewId).src = url;
                statusEl.textContent = 'Success!';
                statusEl.className = 'upload-status success';
            }
        } catch (err) {
            statusEl.textContent = 'Failed';
            statusEl.className = 'upload-status error';
        }
    });
};

// Init Uploaders
setupFileUpload('hero-video-upload', 'hero-video-status', 'hero-video-url');
setupFileUpload('about-founder-upload', 'about-founder-status', 'about-founder-img');


// --- JOURNAL FUNCTIONS ---

const renderJournalList = () => {
    const list = document.getElementById('journal-list');
    list.innerHTML = journals.map(j => `
        <div class="bg-white rounded shadow p-4 flex flex-col justify-between">
            <div>
                 <img src="${j.image}" alt="${j.title}" class="w-full h-40 object-cover rounded mb-4 bg-gray-100">
                <div class="flex gap-2 text-xs font-bold text-gray-500 mb-2">
                    <span>${j.date || 'No Date'}</span>
                     <span class="text-gold-500">${j.category || 'Uncategorized'}</span>
                </div>
                <h3 class="font-bold text-lg leading-tight mb-2">${j.title}</h3>
                <p class="text-gray-500 text-xs line-clamp-3">${j.excerpt || ''}</p>
            </div>
             <div class="mt-4 flex gap-2">
                <button onclick="window.editJournal('${j.id}')" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Edit</button>
                <button onclick="window.deleteJournal('${j.id}')" class="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">Del</button>
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
        <div class="bg-white rounded shadow p-4 flex flex-col justify-between">
            <div>
                <img src="${w.coverImage}" alt="${w.title}" class="w-full h-40 object-cover rounded mb-4">
                <h3 class="font-bold text-lg">${w.title}</h3>
                <p class="text-gray-500 text-sm mb-2">${w.subtitle}</p>
                <p class="text-gray-700 text-sm line-clamp-3">${w.description}</p>
            </div>
            <div class="mt-4 flex gap-2">
                <button onclick="window.editWedding('${w.id}')" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Edit</button>
                <button onclick="window.deleteWedding('${w.id}')" class="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">Del</button>
            </div>
        </div>
    `).join('');
};

// --- FILE UPLOAD HELPER ---
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
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
        return data.url; // Relative path from server /uploads/...
    } catch (err) {
        console.error(err);
        alert(`File upload failed: ${err.message}`);
        return null;
    }
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
    div.className = 'border p-3 rounded bg-gray-50';
    div.innerHTML = `
        <h4 class="font-semibold text-sm mb-2">Chapter ${index + 1}</h4>
        <input type="text" class="w-full p-2 border rounded mb-2 text-sm" placeholder="Chapter Title" value="${chapter.title}" name="chapter_title_${index}">
        <label class="block text-xs font-medium mb-1">Images (Comma separated URLs for now, or use JSON edit)</label>
        <textarea class="w-full p-2 border rounded text-xs h-16" name="chapter_images_${index}">${chapter.images.join(', ')}</textarea>
    `;
    container.appendChild(div);
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
document.getElementById('cover-image-upload').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const url = await uploadFile(e.target.files[0]);
        if (url) {
            document.getElementById('cover-image-url').value = url;
            document.getElementById('preview-cover').src = url;
        }
    }
});

document.getElementById('hover-video-upload').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const url = await uploadFile(e.target.files[0]);
        if (url) {
            document.getElementById('hover-video-url').value = url;
        }
    }
});

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
        const imagesStr = chapterDivs[i].querySelector(`textarea[name="chapter_images_${i}"]`).value;
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
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
        showDashboard();
    }
};

const showDashboard = () => {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    fetchWeddings();
    // Default tab is home, but let's load it
    // switchTab('home'); // already default?
    // Trigger click on default
    tabHome.click();
};

const handleLogin = () => {
    const password = passwordInput.value;
    if (password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        showDashboard();
    } else {
        loginError.classList.remove('hidden');
    }
};

loginBtn.addEventListener('click', handleLogin);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    location.reload();
});

// Init
checkAuth();
