/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agent: {
          bg: '#0F172A',
          panel: '#1E293B',
          border: '#334155',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#3B82F6',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          cancelled: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
