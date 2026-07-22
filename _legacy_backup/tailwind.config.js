/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Share Tech Mono"', 'Inter', 'Pretendard', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
        tech: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'crt-flicker': 'flicker 0.15s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.975' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' },
        }
      },
      boxShadow: {
        'terminal-green': '0 0 10px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.3)',
        'terminal-amber': '0 0 10px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.3)',
        'terminal-cyan': '0 0 10px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(6, 182, 212, 0.3)',
      }
    },
  },
  plugins: [],
}
