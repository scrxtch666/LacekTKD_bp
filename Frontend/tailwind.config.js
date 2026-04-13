/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGreen: '#01923E',
        customBlack: '#181918',
        customWhite: '#F8F0E5',
        alertRed: '	#ff0f0f',
      },
      keyframes: {
        pulsate: {
          '0%': { transform: 'scale(0.1)', opacity: '0.0' },
          '50%': { opacity: '1.0' },
          '100%': { transform: 'scale(1.2)', opacity: '0.0' },
        },
      },
      animation: {
        pulsate: 'pulsate 1s ease-out infinite',
      },
    },
  },
  plugins: [],
}
