const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.svelte'],
  theme: {
    fontFamily: {
      'sans': ['Montserrat', 'Arial', 'sans-serif'],
      'serif': ['Playfair Display', 'serif']
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: 'var(--primary-color)',
      secondary: 'var(--secondary-color)',
      white: colors.white
    }
  }
}
