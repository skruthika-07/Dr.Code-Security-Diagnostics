/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0f1e',
          dark: '#070d18',
          light: '#0d1b2a',
          card: '#0f1a2e',
          border: '#1e3a5f',
        },
        'med-green': '#00ff9d',
        'med-green-dim': '#00cc7d',
        'sev-critical': '#ff0040',
        'sev-high': '#ff6b35',
        'sev-medium': '#ffd700',
        'sev-low': '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'ecg': 'ecg-scroll 2.5s linear infinite',
        'stamp-in': 'stamp-appear 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up': 'fade-up 0.4s ease-out',
        'fade-down': 'fade-down 0.3s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'heartbeat': 'heartbeat 1.8s ease-in-out infinite',
        'scan-glow': 'scan-glow 2s ease-in-out infinite',
        'rejection-pulse': 'rejection-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        'ecg-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-200px)' },
        },
        'stamp-appear': {
          '0%': { transform: 'scale(1.4) rotate(-12deg)', opacity: '0' },
          '55%': { transform: 'scale(0.93) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.18)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' },
        },
        'scan-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,255,157,0.25), 0 0 4px rgba(0,255,157,0.1)' },
          '50%': { boxShadow: '0 0 32px rgba(0,255,157,0.55), 0 0 12px rgba(0,255,157,0.25)' },
        },
        'rejection-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255,165,0,0.2)' },
          '50%': { boxShadow: '0 0 28px rgba(255,165,0,0.45)' },
        },
      },
    },
  },
  plugins: [],
};
