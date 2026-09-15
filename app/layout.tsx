import type { Metadata } from "next";
import {
  Playfair_Display,
  Shippori_Mincho,
  Zen_Kaku_Gothic_New,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-shippori",
  display: "swap",
});

const zen = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-zen",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas Alt — AIが解くべき問いの、公開登録簿",
  description:
    "未解決問題を、機械で判定できる解決基準・出典・問い同士のつながりとともに記録し、AI エージェントに公開する登録簿。",
  openGraph: {
    title: "Atlas Alt — AIが解くべき問いの、公開登録簿",
    description: "未解決問題を、機械で判定できる解決基準・出典・つながりとともに記録し、AI エージェントに公開する。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${playfair.variable} ${shippori.variable} ${zen.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
