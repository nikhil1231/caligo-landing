/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#03a9f4',
        skyglass: '#cbefff',
        ink: '#10212b',
        muted: '#557180',
        shell: '#f6fbff'
      },
      boxShadow: {
        soft: '0 18px 40px -24px rgba(16, 33, 43, 0.28)'
      },
      borderRadius: {
        card: '1.25rem'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
