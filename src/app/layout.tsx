import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JS Dojo - JavaScript学習",
  description: "HTML/CSSコーダー向け JavaScript基礎学習サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
