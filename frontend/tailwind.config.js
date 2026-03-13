/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0e1a',
          900: '#0d1321',
          800: '#131b2e',
          700: '#1a2540',
          600: '#243152',
        },
        slate: {
          850: '#172033',
        },
        cyan: {
          400: '#00D4FF',
          500: '#00b8db',
          600: '#0098b3',
        },
        accent: {
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
          orange: '#f97316',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        heading: ['Syne', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'progress-fill': 'progressFill 1s ease-out',
        'typing': 'typing 1.2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        typing: {
          '0%, 60%': { opacity: '1' },
          '30%': { opacity: '0.3' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
      },
    },
  },
  plugins: [],
};
