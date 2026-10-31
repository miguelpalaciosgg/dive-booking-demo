// Paleta de la demo (solo tema claro): papel cálido, tinta marino y cian.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Schibsted Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        slate: { 50: '#f7f6f3', 100: '#efede8', 200: '#e2dfd8', 300: '#ccc8bf', 400: '#a19c92', 500: '#78736a', 600: '#5c5850', 700: '#46433d', 800: '#2f2d29', 900: '#1e1d1a', 950: '#121110' },
        navy: { 700: '#3a3f46', 800: '#24282d', 900: '#15181b' },
        ocean: { 50: '#eef5f6', 100: '#d7e8ec', 400: '#3f8aa1', 500: '#256f87', 600: '#1b5a6f' },
        sand: '#f4f2ed',
        marca: '#16b4ea',
      },
      borderRadius: { lg: '6px', xl: '8px', '2xl': '10px', '3xl': '14px' },
      boxShadow: { pop: '0 18px 40px -18px rgb(0 0 0 / .35)' },
    },
  },
}
