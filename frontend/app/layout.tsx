import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Jura, Russo_One } from "next/font/google";
import Script from "next/script";

import { AppProviders } from "@/lib/app-context";

import "@/styles/globals.css";

const jura = Jura({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const russoOne = Russo_One({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nexx Мини-приложение",
  description: "Мини-приложение Telegram для игровой комнаты Nexx",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f0f23",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js?62" strategy="beforeInteractive" />
      </head>
      <body className={`${jura.variable} ${russoOne.variable} bg-nexx-base text-nexx-text antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
