/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#08090d',
          panel: '#12141c',
          raised: '#171a24',
          border: '#23273487'
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          glow: '#a5b4fc',
          soft: '#4f46e5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(99, 102, 241, 0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 40px -28px rgba(0,0,0,0.65)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 48px -20px rgba(99,102,241,0.25)'
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '32px 32px'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
