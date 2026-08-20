"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Map } from "lucide-react";
import DavidDots from "./DavidDots";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const reduce = useReducedMotion();
  const anim = (i: number) =>
    reduce
      ? {}
      : { variants: fade, initial: "hidden" as const, animate: "show" as const, custom: i };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28"
    >
      {/* Signature background: the dot-matrix David */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 atlas-grid opacity-60" />
        {/* interactive David — reacts to the cursor anywhere on the hero */}
        <div className="absolute inset-y-0 right-0 h-full w-full opacity-40 md:w-[56%] md:opacity-100">
          <DavidDots />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-page px-5 sm:px-8">
        <motion.p
          {...anim(0)}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-label text-ink-soft backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          無知の知プラットフォーム
        </motion.p>

        <motion.h1
          {...anim(1)}
          className="max-w-4xl font-display text-[13vw] leading-[0.95] tracking-tight text-ink text-balance sm:text-7xl lg:text-8xl"
        >
          Map the
          <br />
          <span className="italic text-atlas">unknown.</span>
        </motion.h1>

        <motion.p
          {...anim(2)}
          className="mt-7 max-w-xl font-serifjp text-lg leading-relaxed text-ink-soft sm:text-xl"
        >
          人類知への、オルタナティブ。
          <br className="hidden sm:block" />
          答え<span className="font-mono text-sm text-ink-faint">（Answer）</span>
          ではなく、問い
          <span className="font-mono text-sm text-ink-faint">（Question）</span>
          をマッピングする。
        </motion.p>

        <motion.div {...anim(3)} className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-atlas"
          >
            Open Atlas
            <ArrowUpRight size={15} strokeWidth={2} />
          </a>
          <a
            href="#concept"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-atlas hover:text-atlas"
          >
            <Map size={15} strokeWidth={1.75} />
            View the map
          </a>
        </motion.div>

        {/* Twin quotes — the two poles of the brand */}
        <motion.div
          {...anim(4)}
          className="mt-16 grid max-w-3xl gap-5 border-t border-line pt-8 sm:grid-cols-2"
        >
          <figure>
            <blockquote className="font-display text-base italic leading-snug text-ink">
              “One of the really tough things is figuring out what questions to
              ask. Once you figure out the question, then the answer is
              relatively easy.”
            </blockquote>
            <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
              — Elon Musk
            </figcaption>
          </figure>
          <figure className="sm:border-l sm:border-line sm:pl-5">
            <blockquote className="font-display text-base italic leading-snug text-ink">
              “Ἓν οἶδα ὅτι οὐδὲν οἶδα.”
            </blockquote>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-soft">
              The only true wisdom is in knowing you know nothing.
            </p>
            <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
              — Socrates
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </section>
  );
}
