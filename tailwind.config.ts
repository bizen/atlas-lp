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
    },
  },
  plugins: [],
};

export default config;
