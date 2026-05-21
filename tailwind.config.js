/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/context/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a', // Slate 900
          card: '#1e293b', // Slate 800
          accent: '#10b981', // Emerald 500
          text: '#f8fafc', // Slate 50
          muted: '#94a3b8', // Slate 400
        }
      }
    },
  },
  plugins: [],
}
