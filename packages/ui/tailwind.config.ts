import type { Config } from "tailwindcss";
import { tokens } from "./src/tokens/index.js";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../apps/**/*.{ts,tsx}", // apps podem estender este config
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cores base (dark-first)
        bg: tokens.colors.bg,
        text: tokens.colors.text,
        border: tokens.colors.border,
        brand: tokens.colors.brand,
        // Semânticas
        primary: tokens.colors.semantic.primary,
        secondary: tokens.colors.semantic.secondary,
        danger: tokens.colors.semantic.danger,
        ghost: tokens.colors.semantic.ghost,
      },
      spacing: tokens.spacing,
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
        mono: tokens.typography.fontFamily.mono,
        display: tokens.typography.fontFamily.display,
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      letterSpacing: tokens.typography.letterSpacing,
      borderRadius: tokens.borders.radius,
      borderWidth: tokens.borders.width,
      boxShadow: tokens.shadows,
      transitionDuration: {
        fast: "150ms",
        default: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        ease: "ease",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      zIndex: tokens.zIndex,
      screens: tokens.breakpoints,
      container: {
        center: true,
        padding: tokens.container.padding,
        screens: {
          sm: tokens.breakpoints.sm,
          md: tokens.breakpoints.md,
          lg: tokens.breakpoints.lg,
          xl: tokens.breakpoints.xl,
          "2xl": tokens.container.maxWidth,
        },
      },
      animation: {
        "fade-in": "fadeIn 200ms ease",
        "slide-up": "slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-down": "slideDown 200ms ease",
        "slide-in-right": "slideInRight 300ms ease",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;