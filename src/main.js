import './style.css';
import './transitions.js'; // Global Page Transitions

// Global scripts can be added here
console.log('Vite App Initialized');

// Back to Top Button Logic
const backToTopBtn = document.createElement('button');
backToTopBtn.id = 'back-to-top';
backToTopBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
</svg>
`;
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Review Slider Logic
const reviewTrack = document.querySelector('.review-track');
if (reviewTrack) {
    const reviews = Array.from(reviewTrack.children);
    reviews.forEach(review => {
        const clone = review.cloneNode(true);
        reviewTrack.appendChild(clone);
    });
}
