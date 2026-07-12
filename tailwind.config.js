/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        piano: {
          white: '#f8f4e6',
          black: '#1a1a2e',
          gold: '#d4a574',
          accent: '#e8c170',
          dark: '#16213e',
          mid: '#0f3460',
          note: '#e94560',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'note-float': 'noteFloat 0.6s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'key-press': 'keyPress 0.15s ease-out',
        'sparkle': 'sparkle 0.8s ease-out forwards',
      },
      keyframes: {
        noteFloat: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) scale(1.5)', opacity: '0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.8)' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        keyPress: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgba(212,165,116,0.3)' },
          '100%': { transform: 'scale(0.95)', backgroundColor: 'rgba(212,165,116,0.1)' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(180deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
