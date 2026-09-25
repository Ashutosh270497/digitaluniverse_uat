/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffde9',
          100: '#fff6b8',
          200: '#ffec7a',
          300: '#ffe44a',
          400: '#ffda1a',
          500: '#ffd400',
          600: '#8f6500',
          700: '#745500',
          800: '#664a00',
          900: '#513b00',
        },
        amazon: {
          orange: '#FF9900',
          dark: '#17180f',
          navy: '#24251a',
          gold: '#ffda1a',
          lightGold: '#fffde9',
          cream: '#fffbea',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-hero': 'radial-gradient(ellipse at 10% 15%, rgba(255,212,0,0.11), transparent 55%)',
        'gold-gradient': 'linear-gradient(135deg, #ffe74a 0%, #ffd400 100%)',
        'dark-gradient': 'linear-gradient(135deg, #292a1b 0%, #17180f 58%, #101109 100%)',
      },
    },
  },
  plugins: [],
}
