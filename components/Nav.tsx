"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-page items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg tracking-tight text-ink">
            Atlas
          </span>
          <span className="font-mono text-[11px] uppercase tracking-label text-atlas">
            Alt
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:text-atlas"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#cta"
            className="hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-atlas sm:inline-flex"
          >
            Open Atlas
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink md:hidden"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-page flex-col px-5 py-3 sm:px-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-3 font-mono text-sm uppercase tracking-[0.15em] text-ink-soft"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper"
            >
              Open Atlas <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
