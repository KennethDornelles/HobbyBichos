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
        brand: {
          primary: '#FFD600', // Amarelo vibrante
          secondary: '#4B6FFF', // Azul institucional
        },
        background: {
          dark: '#1A1B2E',
          light: '#F9FAFB',
        },
        status: {
          success: '#22C55E', // Verde
          error: '#EF4444',   // Vermelho
          alert: '#F59E42',   // Laranja
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
    },
  },
  plugins: [],
};
