/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./apps/**/*.{js,ts,jsx,tsx}",
      "./packages/ui/src/components/ui/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#1E40AF",
          secondary: "#9333EA",
        },
      },
    },
    plugins: [],
};
  