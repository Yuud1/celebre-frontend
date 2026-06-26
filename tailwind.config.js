/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cb-bg':      '#fffefe',
        'cb-ink':     '#42445d',
        'cb-muted':   '#805a7c',
        'cb-primary': '#9e68ba',
        'cl-rose':    '#c88bbe',
        'cl-lilac':   '#b0aeff',
      },
      borderColor: {
        'cb-border': 'rgba(66, 68, 93, 0.1)',
      },
      borderRadius: {
        'cb': '14px',
      },
      boxShadow: {
        'cb': '0 8px 32px rgba(66, 68, 93, 0.08)',
      },
      backgroundImage: {
        'cl-grad':      'linear-gradient(135deg, #9e68ba 0%, #c88bbe 52%, #b0aeff 100%)',
        'cl-grad-soft': 'linear-gradient(160deg, #fffefe 0%, #f3f0ff 48%, #f9f0f6 100%)',
      },
      maxWidth: {
        'page': '1120px',
      },
      keyframes: {
        'home-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'home-orb-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.9)' },
          '50%':       { opacity: '1',    transform: 'scale(1.1)' },
        },
      },
      animation: {
        'home-float':      'home-float 6s ease-in-out infinite',
        'home-orb-pulse':  'home-orb-pulse 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
