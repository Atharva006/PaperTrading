/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1800px',
      },
      colors: {
        // Cendrix Capital Bespoke Midnight Navy System
        midnight: '#0B1424',
        charcoal: '#10141C',
        surface: '#0F192B',
        surfaceElevated: '#14223A',
        surfaceHover: '#182740',
        card: '#0E1728',
        cardHover: '#132038',
        background: '#0B1424',

        // Cendrix Warm Gold System
        gold: {
          DEFAULT: '#C6A15B',
          light: '#E2C889',
          rich: '#D4B26F',
          dark: '#8F6E2C',
          glow: 'rgba(198, 161, 91, 0.15)',
          border: 'rgba(198, 161, 91, 0.22)',
          borderBright: 'rgba(198, 161, 91, 0.55)',
        },

        // Execution Accents
        kite: {
          blue: '#387ed1',
          blueHover: '#2566b3',
          blueLight: '#4184f3',
          blueMuted: 'rgba(56, 126, 209, 0.15)',
          red: '#df514c',
          redHover: '#cc3b36',
          redMuted: 'rgba(223, 81, 76, 0.15)',
          ice: '#60a5fa',
        },

        // Typography
        textPrimary: '#F5F5F2',
        textSecondary: '#A1A8B3',
        textTertiary: '#6E7683',

        // Hairline Borders
        borderSubtle: 'rgba(255, 255, 255, 0.07)',
        borderMedium: 'rgba(255, 255, 255, 0.12)',
        borderGold: 'rgba(198, 161, 91, 0.22)',

        // Financial Indicators
        positive: '#00c087',
        negative: '#df514c',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Cinzel"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cendrix-gold': '0 4px 18px rgba(198, 161, 91, 0.18)',
        'cendrix-card': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 1px rgba(198, 161, 91, 0.2)',
      }
    },
  },
  plugins: [],
}
