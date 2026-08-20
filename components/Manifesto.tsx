import Reveal from "./Reveal";

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative overflow-hidden border-t border-line bg-ink text-paper"
    >
      {/* faint frontier grid on the dark field */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #4CC9F0 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative mx-auto max-w-page px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-label text-cyan">
            無知の知 · The known unknown
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <blockquote className="mx-auto mt-8 max-w-4xl font-display text-3xl leading-tight text-balance sm:text-5xl sm:leading-[1.15]">
            知の地図の価値は、塗りつぶされた面ではなく、
            <span className="italic text-cyan"> まだ白いその縁にある。</span>
          </blockquote>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-8 max-w-xl font-serifjp text-base leading-relaxed text-paper/70">
            自らの無知を知ること。それは、人類が次に問うべき場所を知ることでもある。
            Atlas Alt は、その縁を照らし続けます。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
