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
  title: "Atlas Alt — 無知の知プラットフォーム",
  description:
    "人類知へのオルタナティブ。答え(Answer)ではなく、問い(Question)をマッピングする次世代の共有アーキテクチャ。",
  openGraph: {
    title: "Atlas Alt — 無知の知プラットフォーム",
    description:
      "答え(Answer)ではなく、問い(Question)をマッピングする。人類の未解決問題のアトラス。",
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
