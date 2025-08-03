/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: "#0b0b0d",
        brandBlue: "#125795",
      },
      fontFamily :{
        merriweather: ["Merriweather", 'serif'],
        montserrat: ["Montserrat", 'sans-serif'],
      },
    },
  },
  plugins: [],
}

