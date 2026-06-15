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
        codewars: {
          bg: "#1a1a2e",
          surface: "#16213e",
          panel: "#0f3460",
          accent: "#e94560",
          success: "#4ecca3",
          warning: "#f0a500",
          text: "#eaeaea",
          muted: "#8b8b9e",
          border: "#2a2a4a",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
