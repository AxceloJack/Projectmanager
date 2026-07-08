/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          notStarted: '#9CA3AF',
          design: '#3B82F6',
          review: '#FBBF24',
          revisions: '#EF4444',
          ready: '#10B981',
          complete: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
}
