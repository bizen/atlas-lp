import Reveal from "./Reveal";
import { BookText, Compass } from "lucide-react";

export default function Concept() {
  return (
    <section id="concept" className="relative border-t border-line bg-white">
      <div className="mx-auto max-w-page px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-label text-atlas">
            Sector 01 · Concept
          </p>
          <h2 className="mt-5 max-w-3xl font-serifjp text-3xl leading-tight text-ink text-balance sm:text-[2.7rem] sm:leading-[1.2]">
            「知識」から「課題」へ。
            <br />
            人類の未解決問題をマッピングする。
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr,1fr]">
          <Reveal delay={0.05}>
            <div className="space-y-6 font-sans text-[15px] leading-[1.9] text-ink-soft sm:text-base">
              <p>
                これまで Wikipedia は、人類の「知識
                <span className="font-mono text-sm text-ink-faint">（Answer）</span>
                」を百科的に集約してきました。しかし、AI
                が瞬時に解答を生成する時代において、真に価値を持つのは「問い
                <span className="font-mono text-sm text-ink-faint">
                  （Question）
                </span>
                」です。
              </p>
              <p>
                Atlas Alt
                は、学問的な未解決問題、イノベーションのトレードオフ、地政学的課題、哲学的問題など、既存のプラットフォームが扱えなかった
                <span className="text-ink">「未知の縁（フチ）」</span>
                を能動的に取り扱う、新しい人類の共有地
                <span className="font-mono text-sm text-ink-faint">
                  （Commons）
                </span>
                です。
              </p>
              <p>
                問いをマッピングし、AI と人類のコンセンサスを平滑化する。それが、
                答えの時代の次に来る、共有アーキテクチャの姿です。
              </p>
            </div>
          </Reveal>

          {/* Answer vs Question — the pivot the whole brand turns on */}
          <Reveal delay={0.1}>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-line bg-paper p-6">
                <div className="flex items-center gap-2.5 text-ink-faint">
                  <BookText size={18} strokeWidth={1.75} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
                    The old commons
                  </span>
                </div>
                <p className="mt-4 font-display text-2xl text-ink">Answer</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">
                  既知を集約する百科事典。AI が瞬時に再現できる、確定した知識。
                </p>
              </div>

              <div className="relative rounded-2xl border border-atlas/30 bg-gradient-to-br from-mist to-white p-6">
                <div className="flex items-center gap-2.5 text-atlas">
                  <Compass size={18} strokeWidth={1.75} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
                    Atlas Alt
                  </span>
                </div>
                <p className="mt-4 font-display text-2xl italic text-atlas">
                  Question
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">
                  未知の縁をマッピングする地図。人類にしか立てられない、次の問い。
                </p>
                <span className="pointer-events-none absolute right-5 top-5 font-mono text-3xl text-atlas/25">
                  ?
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
