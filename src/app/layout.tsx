import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const galmuri = localFont({
  src: "../../public/fonts/Galmuri11-Bold.ttf",
  display: "swap",
  variable: "--font-galmuri",
});

export const metadata: Metadata = {
  title: "JooDev Blog",
  description: "A personal tech blog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${galmuri.variable} font-sans`}>{children}</body>
    </html>
  );
}
