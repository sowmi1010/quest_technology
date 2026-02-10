/** @type {import('tailwindcss').Config} */
const withOpacity = (cssVar) => `rgb(var(${cssVar}) / <alpha-value>)`;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "peacock-blue": withOpacity("--qt-blue"),
        "peacock-green": withOpacity("--qt-green"),
        "peacock-navy": withOpacity("--qt-navy"),
        "peacock-bg": withOpacity("--qt-bg"),
        "peacock-border": withOpacity("--qt-border"),
        "peacock-ink": withOpacity("--qt-ink"),
        "peacock-muted": withOpacity("--qt-muted"),
      },
      boxShadow: {
        soft: "var(--qt-shadow-soft)",
        lift: "var(--qt-shadow-lift)",
      },
    },
  },
  plugins: [],
}
