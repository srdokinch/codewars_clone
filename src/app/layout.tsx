import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ThemeToggleBar from "@/components/theme/ThemeToggleBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "JS Dojo - JavaScript学習",
  description: "HTML/CSSコーダー向け JavaScript基礎学習サイト",
};

const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("theme");
    document.documentElement.classList.add(
      theme === "light" || theme === "dark" ? theme : "dark"
    );
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <ThemeToggleBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
