
/**
 * Handles the page load transition animation.
 * Expects #loader and #loader-progress elements in the HTML.
 */
export function initPageTransition() {
    // If the document is already loaded, trigger immediately
    if (document.readyState === 'complete') {
        runTransition();
    } else {
        window.addEventListener('load', runTransition);
    }
}

function runTransition() {
    const prog = document.getElementById('loader-progress');
    const loader = document.getElementById('loader');

    if (prog && loader) {
        // Fill progress bar
        prog.style.width = '100%';

        // Slide up after delay
        setTimeout(() => {
            loader.style.transform = 'translateY(-100%)';
        }, 800);
    }
}

// Auto-init
initPageTransition();
