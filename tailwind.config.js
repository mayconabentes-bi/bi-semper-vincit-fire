/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        svBlue: '#1b3a82',
        svCopper: '#b26e2e',
        svGold: '#c27803',
        svGray: '#71717a',
        svSuccess: '#27AE60',
        svWarning: '#F1C40F',
        svCritical: '#E74C3C',
        svAnthracite: '#1e1e1e',
        svDarkCard: '#2d2d2d'
      }
    },
  },
  plugins: [],
}