import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          lightgreen: "#1ed760",
          black: "#121212",
          dark: "#181818",
          card: "#242424",
          cardhover: "#2a2a2a",
          border: "#333333",
          subtext: "#a7a7a7",
          white: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
