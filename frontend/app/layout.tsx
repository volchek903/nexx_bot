import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2 } from "next/font/google";
import Script from "next/script";

import { AppProviders } from "@/lib/app-context";

import "@/styles/globals.css";

const exo = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-exo",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nexx Mini App",
  description: "Telegram Mini App для игровой комнаты Nexx",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js?62" strategy="beforeInteractive" />
      </head>
      <body className={`${exo.variable} bg-nexx-base text-nexx-text antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
