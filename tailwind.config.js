/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0C',
        ink2: '#141416',
        paper: '#ECEAE4',
        mist: '#D9DEE4',
        muted: '#8A8F98',
        ember: '#FF5B1F',
        pink: '#FF4FA8',
        volt: '#3B6CFF',
        blonde: '#F4C978',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
