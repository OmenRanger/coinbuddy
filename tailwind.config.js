/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ledger: {
          paper: 'rgb(var(--color-paper) / <alpha-value>)',
          ink: 'rgb(var(--color-ink) / <alpha-value>)',
          brass: 'rgb(var(--color-brass) / <alpha-value>)',
          oxblood: 'rgb(var(--color-oxblood) / <alpha-value>)',
          line: 'rgb(var(--color-line) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
