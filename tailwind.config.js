/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zerodha Kite Black & Blue System
        pitch: '#0a0d14',
        midnight: '#0c0f17',
        charcoal: '#0e131f',
        surface: '#111622',
        surfaceElevated: '#151b2a',
        surfaceHover: '#1a2235',
        background: '#0a0d14',

        // Zerodha Signature Blue Palette
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

        // Metallic Accents (Preserved for Cendrix Gold details)
        gold: {
          DEFAULT: '#D4AF65',
          light: '#F0D79A',
          champagne: '#F0D79A',
          dark: '#8F6E2C',
          glow: 'rgba(212, 175, 101, 0.12)',
          border: '#1e293b',
          borderBright: '#387ed1',
        },
        primary: '#387ed1',
        primaryHover: '#4184f3',

        // Typography
        textMain: '#f0f3f8',
        textSecondary: '#9ca8ba',
        textMuted: '#5c687a',

        // Borders
        borderPrimary: '#1e293b',
        borderSubtle: '#162030',
        borderColor: '#1e293b',
        borderNavy: '#162030',
        borderAccent: '#387ed1',

        // Financial Market Indicators (Zerodha Standard)
        positive: '#00c087',
        success: '#00c087',
        negative: '#df514c',
        danger: '#df514c',
        info: '#387ed1',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
        serif: ['Cinzel', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'terminal': '0 4px 20px rgba(0, 0, 0, 0.6)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 1px #1e293b',
        'kite-blue': '0 2px 14px rgba(56, 126, 209, 0.25)',
      }
    },
  },
  plugins: [],
}
