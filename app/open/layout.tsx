import type { Metadata } from "next";
import { mono, plex } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Open Atlas", template: "%s — Open Atlas" },
  description: "人類の未解決問題を、解決基準・出典・つながりとともに記録するオープンな問いの登録簿。",
};

export default function OpenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plex.variable} ${mono.variable} flex min-h-[100svh] flex-col bg-ax-paper font-plexjp text-ax-ink antialiased`}>
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-baseline gap-3">
          <a href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg tracking-tight">Atlas</span>
          <span className="font-mono text-[11px] uppercase tracking-label text-ax-open">Alt</span>
        </a>
          <a href="/open" className="text-[14px] text-ax-muted hover:text-ax-ink">Open Atlas</a>
        </div>
        <form action="/open" className="w-full max-w-xs">
          <input
            name="q"
            type="search"
            placeholder="問いを検索"
            aria-label="問いを検索"
            className="w-full rounded-lg border border-ax-rule bg-white px-3.5 py-2 text-[14px] focus:border-ax-ink focus:outline-none"
          />
        </form>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-10 sm:px-8 sm:pt-14">{children}</main>
      <footer className="border-t border-ax-rule font-jbmono">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-3 px-5 py-6 text-[12px] text-ax-muted sm:px-8">
          <span>Corpus: CC-BY-4.0</span>
          <span>書き込みは MCP から</span>
        </div>
      </footer>
    </div>
  );
}
