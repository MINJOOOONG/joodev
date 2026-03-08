import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Background colors (CSS variable based)
        dark: {
          950: "rgb(var(--color-bg) / <alpha-value>)",
          975: "rgb(var(--color-bg-code) / <alpha-value>)",
        },
        accent: {
          purple: "rgb(var(--color-accent) / <alpha-value>)",
          pink: "rgb(var(--color-accent-pink) / <alpha-value>)",
          blue: "rgb(var(--color-accent-blue) / <alpha-value>)",
          mint: "rgb(var(--color-accent-mint) / <alpha-value>)",
          orange: "rgb(var(--color-accent-orange) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          overlay: "rgb(var(--color-surface-overlay) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
          "border-light": "rgb(var(--color-border-light) / <alpha-value>)",
        },
        // Semantic text colors
        heading: "rgb(var(--color-heading) / <alpha-value>)",
        content: {
          1: "rgb(var(--color-text-1) / <alpha-value>)",
          2: "rgb(var(--color-text-2) / <alpha-value>)",
          3: "rgb(var(--color-text-3) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          faint: "rgb(var(--color-text-faint) / <alpha-value>)",
          ghost: "rgb(var(--color-text-ghost) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-mona12)", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-lg": "var(--shadow-glow-lg)",
        "glow-pink": "var(--shadow-glow-pink)",
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        inner: "var(--shadow-inner)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-slow": "float 5s ease-in-out infinite",
        wiggle: "wiggle 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
