/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scanner': {
          'bg': '#080818',
          'panel': 'rgba(20, 25, 40, 0.95)',
          'cyan': '#00ffff',
          'magenta': '#ff00ff',
          'body': '#3366ff',
          'selected': '#ff3355',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 3s linear',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}
