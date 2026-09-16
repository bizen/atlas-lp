"use client";

import { useEffect, useState } from "react";

// "Atlas FOR ALIGNMENT": the letters that are not A, L or T fold away — every 10 seconds, and
// while the pointer is anywhere in the header (the header carries the `group` class).
const FOLD_MS = 10_000;

export default function Wordmark() {
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setFolded((f) => !f), FOLD_MS);
    return () => clearInterval(id);
  }, []);

  // letter-spacing is inherited as a pixel value, so it has to collapse too, or the folded
  // letters leave a gap behind (AL T instead of ALT).
  const FOLDED = "text-[0px] tracking-[0em] opacity-0";
  const fold = `inline transition-all duration-700 ease-in-out motion-reduce:transition-none ${
    folded
      ? FOLDED
      : `text-[11px] tracking-[0.12em] opacity-100 group-hover:text-[0px] group-hover:tracking-[0em] group-hover:opacity-0
         group-focus-within:text-[0px] group-focus-within:tracking-[0em] group-focus-within:opacity-0`
  }`;

  return (
    <a href="/" aria-label="Atlas Alt" className="flex items-baseline gap-1">
      <span className="font-display text-lg tracking-tight">Atlas</span>
      <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-ax-open">
        <span className={fold}>For&nbsp;</span>AL<span className={fold}>ignmen</span>T
      </span>
    </a>
  );
}
