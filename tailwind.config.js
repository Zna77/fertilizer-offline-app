/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Optima", "Candara", "Trebuchet MS", "sans-serif"],
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        "bg-deep": "rgb(var(--color-bg-deep) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-strong": "rgb(var(--color-surface-strong) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-strong": "rgb(var(--color-accent-strong) / <alpha-value>)",
        "accent-warm": "rgb(var(--color-accent-warm) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 18px 40px rgb(var(--shadow-color) / 0.18)",
        pop: "0 26px 60px rgb(var(--shadow-color) / 0.22)",
      },
    },
  },
  plugins: [],
};
