/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brasil: {
          green: '#009c3b',
          'green-dark': '#007a2e',
          'green-light': '#00c44a',
          yellow: '#FFDF00',
          'yellow-dark': '#e6c800',
          blue: '#002776',
          'blue-light': '#003da6',
          'blue-mid': '#1a4db8',
        },
        cm: {
          'green-darkest': '#0f3d1d',
          'green-dark': '#1f5d2e',
          green: '#2d8a3e',
          'green-light': '#3fae54',
          yellow: '#f5c518',
          'yellow-dark': '#d4a510',
          blue: '#1e3a8a',
          'blue-dark': '#142a66',
          orange: '#c54a1f',
          'orange-light': '#e06a35',
          cream: '#faf6ec',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
