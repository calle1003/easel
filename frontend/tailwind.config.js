/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
      colors: {
        // ブランドカラー（淡い色味）
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // アクセントカラー（淡いブルーグレー）
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        // ウォームベージュ（クリーム色/アイボリー）
        warm: {
          50: '#F2F0E6',
          100: '#ebe8dc',
          200: '#e0dccf',
          300: '#d6d0c7',
          400: '#b8b0a3',
        },
      },
    },
  },
  plugins: [],
}
