import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        xs: "321px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
    nextui({
      layout: {
        radius: {
          small: "0.25rem",
          medium: "0.5rem",
          large: "0.75rem",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#d946ef",
            },
          }
        },
        light: {
          colors: {
            primary: {
              DEFAULT: "#d946ef"
            },
          }
        }
      }
    }),
  ],
  darkMode: "class",
};
