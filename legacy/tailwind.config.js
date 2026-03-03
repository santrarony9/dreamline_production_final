/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c5a059',
          500: '#c5a059'
        },
        black: 'var(--color-bg)',
        white: 'var(--color-text)',
        'deep-gray': 'var(--color-surface)',
        'text-gray': '#a1a1aa',
      },
      fontFamily: {
        heading: ['Unbounded', 'sans-serif'],
        body: ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
