/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          900: '#04060a',
          800: '#070a0f',
          700: '#0a0e15',
          600: '#0e131c',
          500: '#131924',
          400: '#1a212e',
          300: '#232c3b',
        },
        ink: {
          bright: '#e4edf5',
          base: '#b6c4d2',
          dim: '#7c8ea0',
          faint: '#4d5c6b',
          ghost: '#33404c',
        },
        signal: {
          nexus: '#46d5e0',
          coop: '#3fd6a8',
          comp: '#e8734a',
          comm: '#5aa9e6',
          food: '#5ec97f',
          energy: '#9b7ff0',
          wealth: '#e0b64f',
          risk: '#e05c6e',
          drift: '#c9a0ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Menlo',
          'Consolas',
          'ui-monospace',
          'monospace',
        ],
      },
      fontSize: {
        '3xs': ['9px', '12px'],
        '2xs': ['10px', '13px'],
        xsi: ['11px', '15px'],
      },
      letterSpacing: {
        ultra: '0.22em',
        wider2: '0.14em',
      },
      transitionTimingFunction: {
        lab: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
