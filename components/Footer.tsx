import { MODULES } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-page px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr,1fr]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg tracking-tight text-ink">
                Atlas
              </span>
              <span className="font-mono text-[11px] uppercase tracking-label text-atlas">
                Alt
              </span>
            </div>
            <p className="mt-4 max-w-sm font-serifjp text-sm leading-relaxed text-ink-soft">
              人類知への、オルタナティブ。無知の知プラットフォーム。
            </p>
          </div>

          <nav aria-label="Modules">
            <p className="font-mono text-[11px] uppercase tracking-label text-ink-faint">
              Modules
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MODULES.map((m) => (
                <li key={m.coord}>
                  <a
                    href="#cta"
                    className="font-sans text-sm text-ink-soft transition-colors hover:text-atlas"
                  >
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ink-faint">
            © {new Date().getFullYear()} Atlas Alt. All rights reserved.
          </p>
          <p className="font-mono text-[11px] tracking-[0.1em] text-ink-faint">
            Mapping the edge of the unknown.
          </p>
        </div>
      </div>
    </footer>
  );
}
