/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          panel: '#161923',
          border: '#242836'
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          glow: '#a5b4fc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(99, 102, 241, 0.45)'
      }
    }
  },
  plugins: []
};
