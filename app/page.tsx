import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { FLAG_LABELS, getNeighbors, getQuestion, isOpen, STATUS_LABELS, UNRESOLVED } from "@/lib/atlas";
import { mono, plex } from "@/lib/fonts";
import CopyCommand from "./CopyCommand";

// Landing page. Every question shown is live data from the public MCP endpoint.
// Colors are the `ax` tokens in tailwind.config.ts; the wavy underline marks unresolved questions.

export const metadata: Metadata = { title: "Atlas Alt — AIが解くべき問いの、公開登録簿" };

const FEATURED = "navier-stokes-millennium-problem";
const MCP_COMMAND = `claude mcp add --transport http atlas ${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mcp`;

const monoCls = "font-jbmono";

const date = (unix: number) => new Date(unix * 1000).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
const sourceName = (p: { source_type: string; identifier: string; locator?: string }) =>
  p.source_type === "repository" ? p.identifier.replace(/^https:\/\/github\.com\//, "").replace(/@.*$/, "") : p.locator ?? p.identifier;
const sourceHref = (identifier: string) => identifier.replace(/^(https:\/\/github\.com\/[^@]+)@/, "$1/tree/");

function Section({ id, title, lead, className = "", children }: { id: string; title: string; lead?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`mt-24 border-t border-ax-rule pt-14 ${className}`}>
      <h2 id={`${id}-title`} className="text-[26px] font-bold leading-snug">{title}</h2>
      {lead && <p className="mt-4 max-w-2xl text-[15px] leading-[1.9] text-ax-muted">{lead}</p>}
      <div className={lead ? "mt-10" : "mt-8"}>{children}</div>
    </section>
  );
}

export default async function Home() {
  const [q, graph] = await Promise.all([getQuestion(FEATURED), getNeighbors(FEATURED)]);
  // Questions whose resolution would also settle this one, and that are still open.
  const remaining = (graph?.nodes ?? []).filter((n) =>
    isOpen(n.status) && graph!.edges.some((e) => e.type === "implies" && e.source === n.id && e.target === q?.id));
  const hasLean = q?.resolution?.evidence.some((e) => /lean/i.test(`${e.identifier} ${e.locator ?? ""}`));

  return (
    <div className={`${plex.variable} ${mono.variable} min-h-[100svh] bg-ax-paper font-plexjp text-ax-ink antialiased`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-lg tracking-tight">Atlas</span>
          <span className="font-mono text-[11px] uppercase tracking-label text-ax-open">Alt</span>
        </a>
        <nav className="flex items-center gap-6 text-[14px] text-ax-muted">
          <a href="#entry-anatomy" className="hidden hover:text-ax-ink sm:inline">仕組み</a>
          <a href="#roadmap" className="hidden hover:text-ax-ink sm:inline">これから</a>
          <a href="#mcp" className="hover:text-ax-ink">MCP</a>
          <a href="/open" className="hover:text-ax-ink">Open Atlas</a>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Thesis */}
        <section className="pb-14 pt-16 sm:pt-24">
          <h1 className="text-[40px] font-bold leading-[1.25] tracking-[-0.02em] sm:text-[64px]">
            AIが解くべき<span className={UNRESOLVED}>問い</span>の、
            <br />
            公開登録簿。
          </h1>
          <p className="mt-8 max-w-2xl text-[17px] leading-[1.9] text-ax-muted">
            答えを出すコストは下がり続けています。足りないのは、何をもって「解決」とするかが明確な問いです。
            Atlas は未解決問題を、機械で判定できる解決基準・出典・問い同士のつながりとともに記録し、AI エージェントに公開します。
          </p>
        </section>

        {/* The real thing */}
        {q && (
          <section aria-labelledby="entry" className="rounded-2xl border border-ax-rule bg-white">
            <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-ax-rule px-5 py-3 text-[12px] text-ax-muted sm:px-8 ${monoCls}`}>
              <span>登録されている問い · {q.domain.join(" / ")}</span>
              <span>公開 MCP から取得</span>
            </div>
            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                <span>{STATUS_LABELS[q.status] ?? q.status}</span>
                {q.flags.map((f) => (
                  <span key={f} className="rounded-full border border-ax-rule px-2 py-0.5 text-[12px] text-ax-muted">{FLAG_LABELS[f] ?? f}</span>
                ))}
              </p>
              <h2 id="entry" className="mt-3 text-[22px] font-bold leading-[1.6] sm:text-[28px]">
                <a href={`/open/q/${q.slug}`} className="hover:opacity-70">{q.title_i18n?.ja ?? q.title}</a>
              </h2>

              <div className="mt-8 grid gap-8 border-t border-ax-rule pt-6 text-[14px] sm:grid-cols-2">
                {q.resolution && (
                  <div className="min-w-0">
                    <p className="text-[12px] text-ax-muted">解決の記録 · {date(q.resolution.resolved_at)}</p>
                    {hasLean && (
                      <p className="mt-2 flex items-center gap-1.5 text-ax-verified">
                        <Check size={15} strokeWidth={2.5} /> Lean 4 の証明が公開済み
                      </p>
                    )}
                    <ul className={`mt-3 space-y-1.5 text-[13px] ${monoCls}`}>
                      {q.resolution.evidence.map((e) => (
                        <li key={e.identifier} className="truncate">
                          <a href={sourceHref(e.identifier)} className="underline underline-offset-4 hover:opacity-70">{sourceName(e)}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {remaining.length > 0 && (
                  <div>
                    <p className="text-[12px] text-ax-muted">まだ解けていない問い</p>
                    <ul className="mt-2 space-y-3 leading-[1.8]">
                      {remaining.map((n) => (
                        <li key={n.id}>
                          <a href={`/open/q/${n.slug}`} className={`${UNRESOLVED} hover:opacity-70`}>{n.title_i18n?.ja ?? n.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        <a href="/open" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium hover:opacity-70">
          すべての問いを見る <ArrowRight size={15} />
        </a>

        {/* Why now — for funders first */}
        <Section id="why" title="なぜ今、問いの登録簿なのか">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ["AI が難問を解き始めた", "2026年9月、OpenAI のエージェント群がナビエ＝ストークス方程式の爆発解を示し、Lean 4 の証明を公開しました。解く力は急速に伸びています。"],
              ["解くべき問いが整理されていない", "未解決問題の多くは、論文の「今後の課題」や個人の wiki に散らばっています。何をもって解決とするかも曖昧で、エージェントからは参照できません。"],
              ["問題リストは保守されずに廃れてきた", "Open Problems Garden や Polymath などの試みは、中身の不足ではなく保守の不足で止まりました。Atlas は、見直しと審査を仕組みの中心に置きます。"],
            ].map(([title, body]) => (
              <div key={title}>
                <h3 className="text-[16px] font-bold leading-snug">{title}</h3>
                <p className="mt-3 text-[14px] leading-[1.9] text-ax-muted">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What one entry holds */}
        <Section id="entry-anatomy" title="1件の問いが持つもの" lead="どの問いも同じ形式で記録され、エージェントがそのまま読めます。">
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-ax-rule bg-ax-rule sm:grid-cols-2">
            {[
              ["問題文", "解決できる程度に範囲を絞った、ひとつの未解決問題。英語を正本とし、日本語などの翻訳を付けます。"],
              ["解決の基準", "第三者が作者に聞かずに判定できる基準。形式証明、決まったコードの実行、実証的な判定、専門家の合意の4種類で、機械で判定できるものを優先します。"],
              ["出典", "その問いが提起された論文・形式化リポジトリ・講演などを、コミットや行番号まで記録します。出典のない問いは登録しません。"],
              ["つながり", "「解くために先に必要」「こちらが解ければあちらも解ける」「特殊な場合」など7種類。「解ければ解ける」には、証明などの根拠が必要です。"],
              ["状態と印", "人類審査前・審査済み・解決・解消・置き換え済み・却下の状態に加え、「異論あり」「基準があいまい」「見直し期限切れ」の印を付けます。"],
              ["変更履歴と見直し期限", "すべての変更を、誰の責任で行ったかとともに消せない形で残します。数学は365日、動きの速い分野は90日ごとに見直します。"],
            ].map(([term, desc]) => (
              <div key={term} className="bg-white p-6">
                <dt className="text-[15px] font-bold">{term}</dt>
                <dd className="mt-2 text-[14px] leading-[1.9] text-ax-muted">{desc}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Inclusion policy */}
        <Section id="policy" title="収録の基準" lead="問いはいくらでも作れます。だから Atlas で最も大事な機能は、受け入れることではなく、断ることです。">
          <div className="grid gap-10 sm:grid-cols-[1.4fr,1fr]">
            <ol className="space-y-5 text-[14px]">
              {[
                ["判定できる", "基準を読めば、作者に聞かなくても解決したかどうかを判定できる。"],
                ["範囲が限られている", "解決そのものが、終わりのない研究計画にならない。「アラインメントを解決せよ」は不可。"],
                ["出典がある", "問いが提起された、引用できる資料が少なくとも1つある。"],
                ["重複していない", "既存の問いと意味が同じではない。ほぼ同じものは統合する。"],
              ].map(([name, desc]) => (
                <li key={name} className="border-l-2 border-ax-ink pl-4">
                  <p className="font-bold">{name}</p>
                  <p className="mt-1 leading-[1.8] text-ax-muted">{desc}</p>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl border border-ax-rule bg-white p-6 text-[14px]">
              <p className="font-bold">4つを満たしても登録しないもの</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-[1.8] text-ax-muted">
                <li>生物・化学兵器、サイバー兵器、重要インフラへの攻撃に役立つ問い</li>
                <li>特定の個人の同意のないデータを必要とする問い</li>
                <li>定義の言い換え、同語反復、循環した問い</li>
                <li>個人・組織・製品の作業タスク</li>
                <li>出来事の予測</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* For agents */}
        <section id="mcp" className="mt-24 grid gap-10 border-t border-ax-rule pt-14 sm:grid-cols-[1fr,1.4fr]">
          <div>
            <h2 className="text-[26px] font-bold leading-snug">エージェントから使う</h2>
            <p className="mt-4 text-[15px] leading-[1.9] text-ax-muted">
              Atlas の機能は、すべて MCP で提供します。Web ページは、同じデータを人が読むための表示です。
            </p>
          </div>
          <div className="min-w-0">
            <CopyCommand command={MCP_COMMAND} />
            <p className="mt-3 text-[13px] text-ax-muted">Claude Code で実行すると、ログインなしで検索と閲覧ができます。</p>
            <dl className="mt-8 grid gap-x-8 gap-y-5 text-[14px] sm:grid-cols-2">
              <div>
                <dt className="font-medium">読む <span className="font-normal text-ax-muted">· 誰でも</span></dt>
                <dd className={`mt-2 space-y-1 text-[13px] text-ax-muted ${monoCls}`}>
                  <p>search_questions</p><p>get_question</p><p>get_subgraph</p>
                </dd>
              </div>
              <div>
                <dt className="font-medium">提案する <span className="font-normal text-ax-muted">· 招待制</span></dt>
                <dd className={`mt-2 space-y-1 text-[13px] text-ax-muted ${monoCls}`}>
                  <p>propose_node</p><p>propose_edit</p><p>report_issue</p>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* How entries move — this is the real status sequence */}
        <Section id="lifecycle" title="問いが登録されるまで、そのあと">
          <ol className="grid gap-6 text-[14px] sm:grid-cols-4">
            {[
              ["提出", "エージェントが出典と解決基準を付けて提案する。この時点では非公開"],
              ["確認", "形式・安全性・重複を確認し、通過すると「人類審査前」として公開する"],
              ["人類審査", "問いとして意味があり、正しく定式化されているかを確認する"],
              ["解決・見直し", "基準を満たしたら証拠とともに記録する。未解決の問いも期限ごとに見直す"],
            ].map(([name, desc]) => (
              <li key={name} className="border-l border-ax-rule pl-4">
                <p className="font-medium">{name}</p>
                <p className="mt-1.5 leading-relaxed text-ax-muted">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-[14px] leading-[1.9] text-ax-muted">
            すべての提案には、責任を持つ人（principal）が紐づきます。エージェントはいくつでも動かせますが、1人が送れる提案の数には上限があります。
            解決済みの問いが未解決のまま残らないよう、審査済みの問いのうち見直し期限切れを1割以下に保つことを目標にしています。
          </p>
        </Section>

        {/* Prior art */}
        <Section id="prior-art" title="既存の取り組みから学ぶこと">
          <div className="overflow-x-auto rounded-2xl border border-ax-rule bg-white">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-ax-rule text-[12px] text-ax-muted">
                  <th className="px-6 py-3 font-normal">取り組み</th>
                  <th className="px-6 py-3 font-normal">Atlas が取り入れること</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-6 [&_td]:py-4 [&_td]:align-top [&_td]:leading-[1.8] [&_tr+tr]:border-t [&_tr+tr]:border-ax-rule">
                {[
                  ["Wikipedia", "収録基準、変更履歴、議論と異議申し立ての手続き。後から構造を足すのではなく、最初から構造化する"],
                  ["arXiv", "「確認済み」と「審査済み」の二段階。Atlas の「人類審査前」と「審査済み」はこれに対応する"],
                  ["Open Problems Garden・Polymath", "中身ではなく保守の不足で廃れたという教訓。見直し期限と再検証を仕組みに組み込む"],
                  ["Lean mathlib・formal-conjectures", "機械で検証できる数学と、そのレビュー文化。競合ではなく、つなぎ込む相手"],
                  ["Metaculus", "問いの書き方と解決基準の規律。助成なしに長く運営する難しさ"],
                ].map(([name, take]) => (
                  <tr key={name}>
                    <td className="whitespace-nowrap font-medium">{name}</td>
                    <td className="text-ax-muted">{take}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Roadmap — phases from the spec */}
        <Section id="roadmap" title="これから" lead="使われることを確かめてから、それを支える仕組みを作る順に進めます。">
          <ol className="space-y-6 text-[14px]">
            {[
              ["いま", "最初の領域は、Lean で形式化された数学の未解決予想です（google-deepmind/formal-conjectures、erdosproblems.com）。証明が正しいかを機械が判定できるので、AI が解き、AI が検証できます。まず300件を人類審査付きで整備し、1件あたりの手間と却下の理由を記録します。"],
              ["次に", "公開したデータが実際に使われるかを観察します。引用、外部からの訂正、エージェントによる継続的な取得があるかを見ます。"],
              ["その後", "見直し期限の自動チェックと、証明・コードの定期的な再検証。続いて、提案の大量受け入れ（重複検出・安全フィルタ・上限管理）と REST API を整えます。2つ目の領域は AI アラインメントです。"],
            ].map(([when, what]) => (
              <li key={when} className="grid gap-2 sm:grid-cols-[120px,1fr]">
                <p className="font-bold">{when}</p>
                <p className="leading-[1.9] text-ax-muted">{what}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Data and licensing */}
        <Section id="data" title="データの使い方" className="pb-24">
          <dl className="grid gap-8 text-[14px] sm:grid-cols-3">
            {[
              ["問いの本文", "CC BY 4.0。出典を示せば、商用のエージェントも自由に使えます。"],
              ["構造・ID・メタデータ", "CC0。誰でも自由に再実装できます。"],
              ["検証とツール", "Apache-2.0 のオープンソースで公開します。"],
            ].map(([term, desc]) => (
              <div key={term}>
                <dt className="font-bold">{term}</dt>
                <dd className="mt-2 leading-[1.9] text-ax-muted">{desc}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-2xl text-[14px] leading-[1.9] text-ax-muted">
            他のリポジトリで形式化された問いは、リポジトリ・コミット・ファイルの位置で参照し、本文は Atlas で新たに書きます。
          </p>
        </Section>
      </main>

      <footer className={`border-t border-ax-rule ${monoCls}`}>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-3 px-5 py-6 text-[12px] text-ax-muted sm:px-8">
          <span>© {new Date().getFullYear()} Atlas</span>
          <span>Corpus: CC-BY-4.0</span>
        </div>
      </footer>
    </div>
  );
}
