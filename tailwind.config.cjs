// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D47A1", // navy
        accent: "#FFB300", // saffron
        secondary: "#2E7D32" // green
      }
    }
  },
  plugins: []
};