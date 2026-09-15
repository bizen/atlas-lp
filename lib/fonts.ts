import { IBM_Plex_Sans_JP, JetBrains_Mono } from "next/font/google";

// Fonts for the landing page and Open Atlas. Use with the `font-plexjp` / `font-jbmono` classes.
export const plex = IBM_Plex_Sans_JP({ weight: ["400", "500", "700"], subsets: ["latin"], preload: false, variable: "--font-plexjp" });
export const mono = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-jbmono" });
