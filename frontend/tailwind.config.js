/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'tiko-blue': '#0ea5e9',
        'tiko-green': '#10b981',
        'tiko-red': '#ef4444',
        'tiko-orange': '#f97316',
        'tiko-purple': '#8b5cf6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

