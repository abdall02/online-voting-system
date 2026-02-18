/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          hover: '#1D4ED8',
          light: '#2563EB',
        },
        secondary: {
          DEFAULT: '#10B981',
        },
        accent: {
          DEFAULT: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
        },
        bg: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        text: {
          primary: {
            light: '#0F172A',
            dark: '#F1F5F9',
          },
          secondary: '#64748B',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, #1E3A8A, #2563EB)',
      }
    },
  },
  plugins: [],
}
