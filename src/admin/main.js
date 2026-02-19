import '../style.css'; // Import main tailwind styles

// Constants
const API_WEDDINGS_URL = '/api/weddings';
const API_CONTENT_URL = '/api/content';
const UPLOAD_URL = '/api/upload';

// State
let weddings = [];
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

// Tabs
const tabWeddings = document.getElementById('tab-weddings');
const tabContent = document.getElementById('tab-content');
const sectionWeddings = document.getElementById('section-weddings');
const sectionContent = document.getElementById('section-content');
const contentForm = document.getElementById('content-form');

// --- AUTHENTICATION ---
const checkAuth = () => {
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        fetchWeddings();
    }
};

loginBtn.addEventListener('click', () => {
    if (passwordInput.value === 'admin123') {
        localStorage.setItem('adminAuthenticated', 'true');
        checkAuth();
    } else {
        loginError.classList.remove('hidden');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminAuthenticated');
    window.location.reload();
});

// --- TABS ---
tabWeddings.addEventListener('click', () => {
    switchTab('weddings');
});
tabContent.addEventListener('click', () => {
    switchTab('content');
});

const switchTab = (tab) => {
    if (tab === 'weddings') {
        sectionWeddings.classList.remove('hidden');
        sectionContent.classList.add('hidden');
        tabWeddings.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabWeddings.classList.remove('text-gray-500');
        tabContent.classList.remove('text-gold-500', 'border-b-2', 'border-gold-500');
        tabContent.classList.add('text-gray-500');
    } else {
        sectionWeddings.classList.add('hidden');
        sectionContent.classList.remove('hidden');
        tabWeddings.classList.remove('text-gold-500', 'border-b-2', 'border-gold-500');
        tabWeddings.classList.add('text-gray-500');
        tabContent.classList.add('text-gold-500', 'border-b-2', 'border-gold-500');
        tabContent.classList.remove('text-gray-500');
        fetchContent();
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

// --- DATA FETCHING (Content) ---
const fetchContent = async () => {
    try {
        const res = await fetch(API_CONTENT_URL);
        siteContent = await res.json();
        renderContentForm();
    } catch (err) {
        console.error('Failed to fetch content:', err);
    }
};

const renderContentForm = () => {
    if (!siteContent.hero) return;

    // Hero
    document.getElementById('hero-title-line1').value = siteContent.hero.title?.line1 || '';
    document.getElementById('hero-title-line2').value = siteContent.hero.title?.line2 || '';
    document.getElementById('hero-subtitle').value = siteContent.hero.subtitle || '';
    document.getElementById('hero-video-url').value = siteContent.hero.videoUrl || '';

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
        document.getElementById('gallery-images').value = (siteContent.gallery.images || []).join(',\n');
    }

    // Projects
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';
    (siteContent.projects || []).forEach((proj, i) => addProjectField(proj, i));
};

const addProjectField = (proj = { title: '', type: 'commercial', img: '' }, i) => {
    const container = document.getElementById('projects-container');
    const div = document.createElement('div');
    div.className = 'border p-3 rounded bg-gray-50 project-item';
    div.innerHTML = `
        <div class="flex justify-between mb-2">
            <h4 class="font-bold text-sm">Project ${i + 1}</h4>
            <button type="button" class="text-red-500 text-xs hover:underline" onclick="this.parentElement.parentElement.remove()">Remove</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <input type="text" class="w-full p-1 border rounded text-xs" value="${proj.title}" placeholder="Title" name="proj_title">
            <select class="w-full p-1 border rounded text-xs" name="proj_type">
                <option value="commercial" ${proj.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                <option value="wedding" ${proj.type === 'wedding' ? 'selected' : ''}>Wedding</option>
                <option value="music" ${proj.type === 'music' ? 'selected' : ''}>Music</option>
            </select>
        </div>
        <input type="text" class="w-full p-1 border rounded text-xs mt-2" value="${proj.img}" placeholder="Image URL" name="proj_img">
    `;
    container.appendChild(div);
};

document.getElementById('add-project-btn').addEventListener('click', () => {
    const count = document.getElementById('projects-container').children.length;
    addProjectField({ title: '', type: 'commercial', img: '' }, count);
});


// Content Form Submit
contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedContent = { ...siteContent };

    // Update Hero
    updatedContent.hero.title.line1 = document.getElementById('hero-title-line1').value;
    updatedContent.hero.title.line2 = document.getElementById('hero-title-line2').value;
    updatedContent.hero.subtitle = document.getElementById('hero-subtitle').value;
    updatedContent.hero.videoUrl = document.getElementById('hero-video-url').value;

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
    updatedContent.gallery.images = document.getElementById('gallery-images').value.split(',').map(s => s.trim()).filter(s => s);

    // Update Projects
    updatedContent.projects = Array.from(document.getElementById('projects-container').children).map((div, i) => ({
        id: i + 1, // Simple ID regeneration
        title: div.querySelector('input[name="proj_title"]').value,
        type: div.querySelector('select[name="proj_type"]').value,
        img: div.querySelector('input[name="proj_img"]').value
    }));

    try {
        const res = await fetch(API_CONTENT_URL, {
            method: 'POST', // or PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedContent)
        });
        if (!res.ok) throw new Error('Failed to save');
        alert('Content updated successfully!');
    } catch (err) {
        alert('Error saving content');
    }
});

// Upload for Content Form
document.getElementById('hero-video-upload').addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const url = await uploadFile(e.target.files[0]);
        if (url) {
            document.getElementById('hero-video-url').value = url;
        }
    }
});

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
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url; // Relative path from server /uploads/...
    } catch (err) {
        console.error(err);
        alert('File upload failed');
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
checkAuth();
