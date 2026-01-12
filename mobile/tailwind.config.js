/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#2B2D42',
          yellow: '#FDB813',
        },
        card: {
          bg: '#363849',
          input: '#3D4054',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF',
        },
        brand: {
          primary: '#FFD600',
          secondary: '#4B6FFF',
        },
        background: {
          dark: '#1A1B2E',
          light: '#F9FAFB',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          alert: '#F59E42',
        },
      },
      borderRadius: {
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(31, 41, 55, 0.15)',
      },
      backdropBlur: {
        glass: '8px',
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
        'quicksand-bold': ['Quicksand_700Bold'],
        'quicksand-semibold': ['Quicksand_600SemiBold'],
        'quicksand-medium': ['Quicksand_500Medium'],
      },
    },
  },
  plugins: [],
};
