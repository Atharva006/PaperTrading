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
        // FundingPips Light Official Brand Palette
        primary: {
          DEFAULT: '#00225A', // Bold authoritative navy anchor
          hover: '#001944',
          light: '#0A3175',
          subtle: '#EEF3FF',
        },
        secondary: {
          DEFAULT: '#536CF0', // Vibrant lighter blue for interactive accents
          hover: '#4258D6',
          light: '#7288FB',
          subtle: '#EEF1FE',
        },
        tertiary: '#6B7A90', // Muted slate-blue for secondary text
        neutral: {
          DEFAULT: '#FCFCFC', // Base page canvas
          dark: '#F0F2F6',
        },
        surface: {
          DEFAULT: '#FFFFFF', // Pure white panels & cards
          elevated: '#FFFFFF',
          hover: '#F7F8FA',
        },
        'on-surface': '#111114', // Primary dark text
        'muted-surface': '#F7F8FA', // Subtle container background
        border: {
          DEFAULT: '#D9E2F2', // Faint cool border tone
          subtle: '#EAEFF8',
          strong: '#BCCAE0',
        },
        success: {
          DEFAULT: '#12B76A', // Positive financial indicator
          light: '#ECFDF3',
          dark: '#0E9355',
        },
        warning: {
          DEFAULT: '#F5B800', // Star ratings & highlights
          light: '#FEF9E6',
        },
        error: {
          DEFAULT: '#D92D20', // Negative P&L / destructive
          light: '#FEF3F2',
          dark: '#B42318',
        },
        info: {
          DEFAULT: '#4DA3FF',
          light: '#F0F7FF',
        },

        // Backward compatibility mappings for existing component classes
        midnight: '#FCFCFC',
        charcoal: '#F7F8FA',
        card: '#FFFFFF',
        cardHover: '#F7F8FA',
        background: '#FCFCFC',

        // Legacy gold alias mapped cleanly to FundingPips primary navy & secondary blue
        gold: {
          DEFAULT: '#00225A',
          light: '#536CF0',
          rich: '#00225A',
          dark: '#001840',
          glow: 'rgba(83, 108, 240, 0.15)',
          border: '#D9E2F2',
          borderBright: '#536CF0',
        },

        // Trading Execution Accents
        kite: {
          blue: '#536CF0',
          blueHover: '#4258D6',
          blueLight: '#7288FB',
          blueMuted: '#EEF1FE',
          red: '#D92D20',
          redHover: '#B42318',
          redMuted: '#FEF3F2',
          ice: '#4DA3FF',
        },

        // Typography colors
        textPrimary: '#111114',
        textSecondary: '#6B7A90',
        textTertiary: '#94A3B8',

        // Hairline Borders
        borderSubtle: '#EAEFF8',
        borderMedium: '#D9E2F2',
        borderGold: '#D9E2F2',

        // Financial Indicators
        positive: '#12B76A',
        negative: '#D92D20',
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        headline: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Sans"', 'sans-serif'], // Replaced archaic Cinzel with modern editorial DM Sans
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 34, 90, 0.04), 0 1px 2px rgba(0, 34, 90, 0.02)',
        'card': '0 2px 12px rgba(0, 34, 90, 0.04), 0 0 1px rgba(0, 34, 90, 0.08)',
        'elevated': '0 8px 30px rgba(0, 34, 90, 0.07), 0 0 1px rgba(217, 226, 242, 0.8)',
        'dropdown': '0 12px 36px rgba(0, 34, 90, 0.12), 0 0 1px rgba(0, 34, 90, 0.08)',
        'cendrix-gold': '0 4px 16px rgba(0, 34, 90, 0.12)',
        'cendrix-card': '0 2px 12px rgba(0, 34, 90, 0.04)',
      }
    },
  },
  plugins: [],
}
