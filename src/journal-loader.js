document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'journal.html';
        return;
    }

    try {
        const res = await fetch(`/api/journals/${id}`);
        if (!res.ok) throw new Error('Journal not found');
        const post = await res.json();

        document.title = `${post.title} | Dreamline Production`;
        const postImg = document.getElementById('post-image');
        const postDate = document.getElementById('post-date');
        const postCat = document.getElementById('post-category');
        const postTitle = document.getElementById('post-title');
        const postContent = document.getElementById('post-content');

        if (postImg) postImg.src = post.image;
        if (postDate) postDate.textContent = post.date || 'INSIGHT';
        if (postCat) postCat.textContent = post.category || 'JOURNAL';
        if (postTitle) postTitle.textContent = post.title;
        if (postContent) postContent.innerHTML = post.content || post.excerpt;

    } catch (err) {
        console.error('Failed to load journal:', err);
        const content = document.getElementById('post-content');
        if (content) content.innerHTML = '<p class="text-center text-red-500 py-20 uppercase tracking-widest text-xs">Insight not found or was moved.</p>';
    }
});
