import Reveal from "./Reveal";
import FrontierMap from "./FrontierMap";
import { FlaskConical, Scale, Globe2, BrainCircuit } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Sector = {
  coord: string;
  icon: LucideIcon;
  title: string;
  en: string;
  desc: string;
};

const SECTORS: Sector[] = [
  {
    coord: "N 40° · E 12°",
    icon: FlaskConical,
    title: "学問的未解決問題",
    en: "Open Problems",
    desc: "証明されていない予想、再現できない現象。学問のフロンティアに残された問い。",
  },
  {
    coord: "N 34° · W 118°",
    icon: Scale,
    title: "イノベーションのトレードオフ",
    en: "Trade-offs",
    desc: "進歩が生む二律背反。何を得て、何を手放すのか——技術が突きつける選択。",
  },
  {
    coord: "N 50° · E 30°",
    icon: Globe2,
    title: "地政学的課題",
    en: "Geopolitics",
    desc: "国家と資源、境界と共存。単一の正解を持たない、世界規模のジレンマ。",
  },
  {
    coord: "N 37° · E 23°",
    icon: BrainCircuit,
    title: "哲学的問題",
    en: "Philosophy",
    desc: "意識とは、正義とは、善く生きるとは。人類が問い続けてきた根源の問い。",
  },
];

export default function Sectors() {
  return (
    <section id="sectors" className="relative overflow-hidden border-t border-line bg-paper">
      {/* the map of the unknown, centred beneath the territories */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-70">
        <FrontierMap />
      </div>
      <div className="relative z-10 mx-auto max-w-page px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-label text-atlas">
            Sector 02 · Territories
          </p>
          <h2 className="mt-5 max-w-2xl font-serifjp text-3xl leading-tight text-ink text-balance sm:text-[2.5rem]">
            既存の地図が空白のままにした、
            <br className="hidden sm:block" />
            未知の縁を取り扱う。
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line/70 backdrop-blur-sm sm:grid-cols-2">
          {SECTORS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="h-full">
              <article className="group flex h-full flex-col bg-white/80 p-7 backdrop-blur-sm transition-colors hover:bg-mist/70 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-atlas transition-colors group-hover:border-atlas/40">
                    <s.icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint">
                    {s.coord}
                  </span>
                </div>
                <h3 className="mt-6 font-serifjp text-xl text-ink">{s.title}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-atlas">
                  {s.en}
                </p>
                <p className="mt-4 font-sans text-sm leading-relaxed text-ink-soft">
                  {s.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
