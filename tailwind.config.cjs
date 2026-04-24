/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#02CDD4',
        sky: {
          50: '#effdfe',
          100: '#d8fafc',
          200: '#b1f4f8',
          300: '#81ecf1',
          400: '#4adfe7',
          500: '#01b8be',
          600: '#01989d',
          700: '#017379',
          800: '#01555a',
          900: '#01393d'
        },
        skyglass: '#c8f8fa',
        ink: '#10212b',
        muted: '#4f6e7a',
        shell: '#f0fcfd'
      },
      boxShadow: {
        soft: '0 18px 40px -24px rgba(16, 33, 43, 0.28)'
      },
      borderRadius: {
        card: '1.25rem'
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
