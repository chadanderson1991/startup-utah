import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        'startup-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#a3f0ae',
          300: '#7be39a',
          400: '#59b779',
          500: '#11df81',
          600: '#009d4e',
          700: '#067a45',
          800: '#175944',
          900: '#0f3d2f',
          950: '#051410',
        },
        'startup-navy': {
          50: '#f3f5f9',
          100: '#dde2ec',
          200: '#a8b2d1',
          300: '#7281a8',
          400: '#475a86',
          500: '#2a3a5e',
          600: '#1a2849',
          700: '#13203a',
          800: '#0d192d',
          900: '#070e1c',
          950: '#03070f',
        },
        'startup-amber': {
          500: '#ffae00',
          600: '#d99400',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
}
