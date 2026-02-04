/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aa-dark-blue': '#0A1F44',
        'aa-orange': '#FF6B00',
        'aa-light-bg': '#F4F7FC',
        'aa-white': '#FFFFFF',
        'aa-text-dark': '#0F172A',
        'aa-gray': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
