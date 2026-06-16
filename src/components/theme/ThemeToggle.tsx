"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
      aria-label={theme === "dark" ? "通常モードに切り替え" : "ナイトモードに切り替え"}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
      <span>{theme === "dark" ? "通常モード" : "ナイトモード"}</span>
    </button>
  );
}
