/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        vazirmatn: ["var(--font-vazirmatn)", "sans-serif"],
      },
      colors: {
        primary: "#1e40af",
        "primary-light": "#3b82f6",
        "primary-dark": "#1e3a8a",
        success: "#059669",
        warning: "#f59e0b",
        error: "#dc2626",
      },
    },
  },
  plugins: [],
};
