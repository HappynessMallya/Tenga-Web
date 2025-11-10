/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './global.css'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9334ea',
          50: '#F3E7F7',
          100: '#E7CFEF',
          200: '#CF9FDF',
          300: '#B76FCF',
          400: '#9F3FBF',
          500: '#9334ea',
          600: '#8E42B8',
          700: '#6D3189',
          800: '#4C215A',
          900: '#2B102B',
        },
        accent: {
          DEFAULT: '#E91E63',
          light: '#F8BBD9',
          dark: '#AD1457',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Roboto-Regular', 'System', 'ui-sans-serif', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
  important: true,
  corePlugins: {
    borderRadius: false,
  },
};
