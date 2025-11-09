/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1193d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
        "foreground-light": "#101c22",
        "foreground-dark": "#f6f7f8",
        "subtle-light": "#e9ebed",
        "subtle-dark": "#1b2c35",
        "border-light": "#d1d5db",
        "border-dark": "#374151"
      },
      fontFamily: {
        display: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: { 
        DEFAULT: "0.25rem", 
        lg: "0.5rem", 
        xl: "0.75rem", 
        full: "9999px" 
      },
    },
  },
  plugins: [],
}