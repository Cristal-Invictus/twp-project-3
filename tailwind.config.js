/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#0d141c',
          gradientFrom: '#0b2545',
          gradientVia: '#13365f',
          gradientTo: '#1d4e89'
        },
        column: {
          bg: '#1d2125',
          header: '#2c333a',
          border: '#2f3d48'
        },
        card: {
          bg: '#22272b',
          hover: '#2c333a',
          border: '#2f3d48'
        },
        accent: {
          blue: '#579dff',
          green: '#4BCE97',
          red: '#F87171',
          yellow: '#F5CD47',
        }
      },
      boxShadow: {
        column: '0 2px 4px rgba(0,0,0,0.4)',
        card: '0 1px 2px rgba(0,0,0,0.35)',
      }
    },
  },
  plugins: [],
}

