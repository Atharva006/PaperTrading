/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0B1424',
        charcoal: '#10141C',
        surface: '#0E1728',
        surfaceElevated: '#14223A',
        surfaceHover: '#132038',
        background: '#0B1424',
        gold: {
          DEFAULT: '#C6A15B',
          light: '#E2C889',
          dark: '#8F6E2C',
          glow: 'rgba(198, 161, 91, 0.15)',
          border: 'rgba(198, 161, 91, 0.22)',
          borderBright: 'rgba(198, 161, 91, 0.55)',
        },
        primary: '#C6A15B',
        primaryHover: '#D4B26F',
        textMain: '#F5F5F2',
        textMuted: '#A1A8B3',
        textTertiary: '#6E7683',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderSubtle: 'rgba(255, 255, 255, 0.06)',
        borderMedium: 'rgba(255, 255, 255, 0.12)',
        borderAccent: 'rgba(198, 161, 91, 0.3)',
        success: '#10B981',
        danger: '#F43F5E',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glow-gold': '0 0 25px rgba(198, 161, 91, 0.2)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
