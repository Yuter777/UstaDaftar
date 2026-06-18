/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F1117',
        surface: '#171A21',
        surface2: '#1F2430',
        line: '#2A2F3A',
        ink: '#F1F5F9',
        muted: '#94A3B8',
        brand: '#3B82F6',
        brandDark: '#2563EB',

        keldi: '#22C55E',
        kelmadi: '#EF4444',
        yarim: '#F59E0B',

        zamer: '#A855F7',
        tasdiq: '#3B82F6',
        ishda: '#F59E0B',
        tugadi: '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
