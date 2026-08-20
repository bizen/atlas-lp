import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFCFF",
        ink: "#0A1A2F",
        "ink-soft": "#47566B",
        "ink-faint": "#8494A8",
        atlas: "#1E6FE0",
        cyan: "#4CC9F0",
        mist: "#E7F1FC",
        line: "#D6E4F2",
        stone: "#ECE7DE",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "var(--font-shippori)", "serif"],
        serifjp: ["var(--font-shippori)", "serif"],
        sans: ["var(--font-zen)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.28em",
      },
      maxWidth: {
        page: "1200px",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseFaint: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        pulseFaint: "pulseFaint 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
