/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("../../tailwind.config.js")], // Use the root Tailwind config
    content: [
      "../../apps/**/*.{js,ts,jsx,tsx}", // Scan all app components
      ".src/components/ui/**/*.{js,ts,jsx,tsx}", // Scan shared UI components
    ],
    theme: {
      extend: {},
    },
    plugins: [],
};
  