/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Carrom Pool inspired palette
        felt: {
          DEFAULT: '#e9c89a', // board playing surface
          dark: '#d8b27c',
        },
        wood: {
          light: '#c8924a',
          DEFAULT: '#9c5a25',
          dark: '#5b3a1a',
        },
        maroon: {
          light: '#7a1f1a',
          DEFAULT: '#4e1310',
          dark: '#2a0a09',
        },
        gold: {
          light: '#ffd470',
          DEFAULT: '#f5b942',
          dark: '#c8881f',
        },
        coin: {
          white: '#f4f1e8',
          black: '#1f2937',
          queen: '#d4271c',
          striker: '#19b3c4',
        },
        brand: {
          DEFAULT: '#f5b942',
          dark: '#c8881f',
          light: '#ffd470',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'maroon-radial': 'radial-gradient(ellipse at top, #7a1f1a 0%, #4e1310 45%, #2a0a09 100%)',
        'gold-gradient': 'linear-gradient(145deg, #ffd470 0%, #f5b942 50%, #c8881f 100%)',
      },
      boxShadow: {
        coin: '0 4px 10px rgba(0,0,0,0.45)',
        panel: '0 10px 30px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
