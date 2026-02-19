/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./commercial.html",
    "./luxury.html",
    "./journal.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#c5a059',
        black: '#050505',
        'deep-gray': '#121212',
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
