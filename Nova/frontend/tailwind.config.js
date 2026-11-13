/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        nova: {
          void: '#05030c',
          deep: '#0b0718',
          panel: '#120c24',
          violet: '#8b5cf6',
          orchid: '#c084fc',
          plasma: '#e879f9',
          ice: '#67e8f9',
        },
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(139, 92, 246, 0.6)',
        'glow-lg': '0 0 120px -20px rgba(192, 132, 252, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'rise': 'rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'drift': 'drift 18s ease-in-out infinite',
        'drift-slow': 'drift 28s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spin 32s linear infinite reverse',
        'twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(6%, -8%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-7%, 5%, 0) scale(0.95)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
