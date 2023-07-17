import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-12deg)" },
          "50%": { transform: "rotate(12deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
