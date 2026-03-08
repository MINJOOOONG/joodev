import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const mona12 = localFont({
  src: "../../public/fonts/Mona12.ttf",
  display: "swap",
  variable: "--font-mona12",
});

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}else if(window.matchMedia("(prefers-color-scheme:light)").matches){document.documentElement.setAttribute("data-theme","light")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${mona12.variable} ${galmuri.variable} font-sans`}>{children}</body>
    </html>
  );
}
