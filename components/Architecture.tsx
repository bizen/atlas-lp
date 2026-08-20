import Reveal from "./Reveal";
import { MODULES } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";

export default function Architecture() {
  return (
    <section id="architecture" className="relative border-t border-line bg-white">
      <div className="mx-auto max-w-page px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[1fr,1.2fr] lg:items-end">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-label text-atlas">
              Sector 03 · Architecture
            </p>
            <h2 className="mt-5 font-serifjp text-3xl leading-tight text-ink text-balance sm:text-[2.5rem]">
              AI と人類のコンセンサスを、
              <br className="hidden sm:block" />
              平滑化する。
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="font-sans text-[15px] leading-[1.9] text-ink-soft sm:text-base">
              問いを起票し、帰結を予測し、貢献を証明し、意味と倫理を認証する。
              オープンからクローズド、そして事業化まで——複数のモジュールが連動して、
              答えの時代の先にある共有アーキテクチャを形づくります。
            </p>
          </Reveal>
        </div>

        <div className="mt-14 divide-y divide-line border-y border-line">
          {MODULES.map((m, i) => (
            <Reveal key={m.coord} delay={i * 0.05}>
              <a
                href="#cta"
                className="group grid grid-cols-[auto,1fr,auto] items-center gap-5 py-6 sm:gap-8 sm:py-7"
              >
                <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint">
                  {m.coord}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink transition-colors group-hover:text-atlas sm:text-2xl">
                    {m.name}
                  </h3>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-soft">
                    {m.desc}
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-all group-hover:border-atlas group-hover:bg-atlas group-hover:text-paper">
                  <ArrowUpRight size={16} strokeWidth={2} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
