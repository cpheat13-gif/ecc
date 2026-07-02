/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Figtree', '-apple-system', 'sans-serif'],
      },
      colors: {
        cream: '#fbf7f2',
        ink: '#1c1917',
      },
    },
  },
  plugins: [],
};
