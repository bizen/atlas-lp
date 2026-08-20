import Reveal from "./Reveal";
import { ArrowUpRight } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="relative border-t border-line bg-paper">
      <div className="mx-auto max-w-page px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white via-mist to-white p-10 text-center sm:p-16">
            <div
              className="pointer-events-none absolute inset-0 atlas-grid opacity-50"
              aria-hidden
            />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-label text-atlas">
                Join the frontier
              </p>
              <h2 className="mx-auto mt-6 max-w-2xl font-serifjp text-3xl leading-tight text-ink text-balance sm:text-[2.6rem] sm:leading-[1.2]">
                あなたの問いが、
                <br className="hidden sm:block" />
                人類の地図を一つ広げる。
              </h2>
              <p className="mx-auto mt-5 max-w-lg font-sans text-[15px] leading-relaxed text-ink-soft">
                Atlas Alt
                は、答えではなく問いを共有する場所。最初の問いを、この地図に刻んでください。
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#top"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-atlas"
                >
                  Open Atlas
                  <ArrowUpRight size={15} strokeWidth={2} />
                </a>
                <a
                  href="#concept"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-7 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-atlas hover:text-atlas"
                >
                  Read the concept
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
