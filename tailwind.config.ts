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
          bg: "rgb(var(--cw-bg) / <alpha-value>)",
          surface: "rgb(var(--cw-surface) / <alpha-value>)",
          panel: "rgb(var(--cw-panel) / <alpha-value>)",
          accent: "rgb(var(--cw-accent) / <alpha-value>)",
          success: "rgb(var(--cw-success) / <alpha-value>)",
          warning: "rgb(var(--cw-warning) / <alpha-value>)",
          text: "rgb(var(--cw-text) / <alpha-value>)",
          muted: "rgb(var(--cw-muted) / <alpha-value>)",
          disabled: "rgb(var(--cw-disabled) / <alpha-value>)",
          "on-accent": "rgb(var(--cw-on-accent) / <alpha-value>)",
          border: "rgb(var(--cw-border) / <alpha-value>)",
          editor: "rgb(var(--cw-editor) / <alpha-value>)",
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
