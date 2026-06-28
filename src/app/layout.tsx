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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://joodev.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "JooDev",
    template: "%s | JooDev",
  },
  description: "개발하면서 배운 것들, 삽질한 경험들, 그리고 고양이처럼 우아한 코드에 대한 이야기.",
  openGraph: {
    title: "JooDev",
    description: "개발하면서 배운 것들, 삽질한 경험들, 그리고 고양이처럼 우아한 코드에 대한 이야기.",
    url: siteUrl,
    siteName: "JooDev",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
