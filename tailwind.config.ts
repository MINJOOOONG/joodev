import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark purple developer palette
        dark: {
          50: "#f3f1f9",
          100: "#e4e0f2",
          200: "#ccc5e8",
          300: "#a99bd6",
          400: "#8b72c1",
          500: "#7457ad",
          600: "#624393",
          700: "#503679",
          800: "#442f64",
          900: "#1e1533",
          925: "#171027",
          950: "#141414",
          975: "#111111",
        },
        accent: {
          purple: "#a78bfa",
          pink: "#f0abfc",
          blue: "#93c5fd",
          mint: "#6ee7b7",
          orange: "#fdba74",
        },
        surface: {
          DEFAULT: "#1a1a1a",
          raised: "#222222",
          overlay: "#2a2a2a",
          border: "#333333",
          "border-light": "#444444",
        },
      },
      fontFamily: {
        sans: ["var(--font-galmuri)", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(167, 139, 250, 0.25)",
        "glow-sm": "0 0 12px rgba(167, 139, 250, 0.15)",
        "glow-lg": "0 0 40px rgba(167, 139, 250, 0.3), 0 0 80px rgba(167, 139, 250, 0.1)",
        "glow-pink": "0 0 20px rgba(240, 171, 252, 0.2)",
        soft: "0 4px 20px rgba(0, 0, 0, 0.3)",
        card: "0 2px 10px rgba(0, 0, 0, 0.2), 0 0 1px rgba(167, 139, 250, 0.1)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 2px rgba(167, 139, 250, 0.15)",
        inner: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
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
