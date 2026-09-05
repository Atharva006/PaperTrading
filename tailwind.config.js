/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Deepest black/charcoal
        surface: '#121214',    // Very dark grey for cards
        surfaceHover: '#18181b', // Slightly lighter for hover
        primary: '#ea580c',      // Burnt orange
        primaryHover: '#c2410c',
        textMain: '#fafafa',
        textMuted: '#a1a1aa',
        borderColor: '#27272a',  // Standard border
        borderAccent: '#3d2817', // Bronze/Orange tinted border for glowing cards
        success: '#22c55e',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(234, 88, 12, 0.1)',
      }
    },
  },
  plugins: [],
}
