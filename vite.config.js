import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                commercial: resolve(__dirname, 'commercial.html'),
                luxury: resolve(__dirname, 'luxury.html'),
                journal: resolve(__dirname, 'journal.html'),
                about: resolve(__dirname, 'about.html'),
                booking: resolve(__dirname, 'booking.html'),
            },
        },
    },
});
