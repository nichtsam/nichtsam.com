import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: ({ colors: { transparent, current, white, black } }) => ({
      transparent,
      current,
      white,
      black,
      border: "hsl(var(--surrounding-color) / <alpha-value>)",
      input: "hsl(var(--surrounding-color) / <alpha-value>)",
      ring: "hsl(var(--surrounding-color) / <alpha-value>)",
      background: "hsl(var(--app-background) / <alpha-value>)",
      foreground: {
        DEFAULT: "hsl(var(--app-foreground) / <alpha-value>)",
        secondary: "hsl(var(--ui-accent-foreground) / <alpha-value>)",
      },
      primary: {
        DEFAULT: "hsl(var(--btn-primary-background) / <alpha-value>)",
        foreground: "hsl(var(--btn-primary-foreground) / <alpha-value>)",
      },
      secondary: {
        DEFAULT: "hsl(var(--btn-secondary-background) / <alpha-value>)",
        foreground: "hsl(var(--btn-secondary-foreground) / <alpha-value>)",
      },
      destructive: {
        DEFAULT: "hsl(var(--warning-background) / <alpha-value>)",
        foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
      },
      muted: {
        DEFAULT: "hsl(var(--mauve-5) / <alpha-value>)",
        foreground: "hsl(var(--mauve-11) / <alpha-value>)",
      },
      accent: {
        DEFAULT: "hsl(var(--ui-accent-background) / <alpha-value>)",
        foreground: "hsl(var(--ui-accent-foreground) / <alpha-value>)",
      },
      popover: {
        DEFAULT: "hsl(var(--ui-background) / <alpha-value>)",
        foreground: "hsl(var(--ui-foreground) / <alpha-value>)",
      },
      card: {
        DEFAULT: "hsl(var(--ui-background) / <alpha-value>)",
        foreground: "hsl(var(--ui-foreground) / <alpha-value>)",
      },
    }),

    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "hsl(var(--app-foreground))",
            // TODO add other stuff
          },
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-12deg)" },
          "50%": { transform: "rotate(12deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
} satisfies Config;
