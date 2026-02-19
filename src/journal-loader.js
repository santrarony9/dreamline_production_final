import { journals } from './data/journals.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id) {
        window.location.href = 'journal.html';
        return;
    }

    const post = journals.find(j => j.id === id);

    if (post) {
        document.title = `${post.title} | Dreamline Production`;
        document.getElementById('post-image').src = post.image;
        document.getElementById('post-date').textContent = post.date;
        document.getElementById('post-category').textContent = post.category;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-content').innerHTML = post.content;
    } else {
        document.getElementById('post-content').innerHTML = '<p class="text-center text-red-500">Journal post not found.</p>';
    }
});
