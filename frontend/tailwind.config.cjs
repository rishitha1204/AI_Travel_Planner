/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
  bg: '#faf7f2',
  surface: '#ffffff',
  ink: '#1f2a37',
  'ink-muted': '#6b7280',
  border: '#e5e0d8',
  primary: {
    DEFAULT: '#0f6b5c',
    light: '#d7ece7',
    dark: '#0a4f44',
  },
  accent: {
    DEFAULT: '#e8623d',
    light: '#fbe4dc',
  },
  'score-poor': '#dc2626',
},
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};