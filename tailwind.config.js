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
        black: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
        white: 'rgb(var(--color-text-rgb) / <alpha-value>)',
        'deep-gray': 'rgb(var(--color-surface-rgb) / <alpha-value>)',
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
