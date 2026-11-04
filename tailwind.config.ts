import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0B0B0C',
        card: '#111112',
        line: '#1F1F21',
        'line-2': '#2A2A2D',
        pink: '#F0ACD7',
        'on-pink': '#100C10',
        plum: '#291520',
        'plum-2': '#4A2236',
        body: '#B9B6B9',
        muted: '#8E848E',
        // modal / sheet surfaces taken from the purchase frames
        'modal-bg': '#100C10',
        'modal-line': '#543247',
        'modal-rail': '#080708',
        'modal-tile': '#171116',
        'modal-tile-line': '#30252E',
        'modal-tile-on': '#291B26',
        'modal-body': '#BBB3BB',
        sheet: '#0E0C0E',
        'sheet-line': '#2A2228',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-changa)', 'var(--font-cairo)', 'sans-serif'],
        num: ['var(--font-anton)', 'Impact', 'sans-serif'],
        latin: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        card: '18px',
        'card-lg': '20px',
        'card-xl': '24px',
        sheet: '28px',
      },
      transitionTimingFunction: {
        quint: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      spacing: {
        gutter: '20px',
        section: '56px',
      },
      boxShadow: {
        modal: '0px 32px 100px 0px rgba(0,0,0,0.7)',
        cta: '0px 0px 32px 0px rgba(227,100,182,0.2)',
        'price-card': '0px 24px 72px 0px rgba(0,0,0,0.5)',
      },
      screens: {
        xs: '390px',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '55%, 100%': { transform: 'translateX(120%)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        sweep: 'sweep 4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
