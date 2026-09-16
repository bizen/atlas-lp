import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ATTAINMENT_LABELS, BASIS_LABELS, FLAG_LABELS, getNeighbors, getQuestion, isSettled, KIND_LABELS,
  STATUS_LABELS, UNRESOLVED, type Approach, type Edge, type Question, type Summary,
} from "@/lib/atlas";

// How each edge reads from this page's question: [when it is the source, when it is the target].
const EDGE_LABELS: Record<string, [string, string]> = {
  prerequisite: ["解くために先に必要な問い", "この問いを前提とする問い"],
  implies: ["この問いが肯定的に解決すれば、成り立つ問い", "肯定的に解決すれば、この問いも成り立つ問い"],
  specializes: ["この問いを特殊な場合として含む、より一般的な問い", "この問いの特殊な場合"],
  refines: ["この問いが範囲を絞った、元の問い", "この問いの範囲を絞った問い"],
  superseded_by: ["この問いを置き換えた問い", "この問いが置き換えた問い"],
  related_to: ["関連する問い", "関連する問い"],
  contradicts: ["両方が肯定的に解決することはない問い", "両方が肯定的に解決することはない問い"],
};

const STRENGTH_LABELS: Record<string, string> = {
  equivalent: "問いと同値", weaker: "問いより弱い", stronger: "問いより強い",
  orthogonal: "問いとずれている", unknown: "強さは未評価",
};

const date = (unix?: number) => (unix ? new Date(unix * 1000).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) : "—");
const isUrl = (s: string) => /^https?:\/\//.test(s);
const sourceHref = (identifier: string) => identifier.replace(/^(https:\/\/github\.com\/[^@]+)@/, "$1/tree/");

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const q = await getQuestion(decodeURIComponent(params.id));
  return q ? { title: q.title_i18n?.ja ?? q.title, description: q.statement_i18n?.ja ?? q.statement } : {};
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ax-rule py-8">
      <h2 className="text-[12px] text-ax-muted">{label}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Sources({ items }: { items: Question["provenance"] }) {
  return (
    <ul className="space-y-2.5 text-[14px]">
      {items.map((p) => (
        <li key={p.identifier + p.locator} className="min-w-0">
          <span className="mr-2 font-jbmono text-[12px] text-ax-muted">{p.source_type}</span>
          {isUrl(p.identifier) ? (
            <a href={sourceHref(p.identifier)} className="break-all font-jbmono text-[13px] underline underline-offset-4 hover:opacity-70">{p.identifier}</a>
          ) : (
            <span className="break-all font-jbmono text-[13px]">{p.identifier}</span>
          )}
          {p.locator && <span className="mt-0.5 block text-[13px] text-ax-muted">{p.locator}</span>}
        </li>
      ))}
    </ul>
  );
}

function Diff({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      <p className="text-[12px] text-ax-muted">{label}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px] leading-[1.8]">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

/** One approach: who decides, what it changes about the question, how far it got, and what is closed. */
function ApproachCard({ a }: { a: Approach }) {
  const diff = a.fidelity_diff;
  const owesDiff = diff.preserved.length + diff.weakened.length + diff.added.length === 0;
  return (
    <li className="rounded-2xl border border-ax-rule bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[16px] font-bold">{a.name}</h3>
        <p className="text-[13px] text-ax-muted">{KIND_LABELS[a.kind] ?? a.kind}</p>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-[auto,1fr]">
        <dt className="text-ax-muted">到達状況</dt>
        <dd className={a.attainment.state === "adjudicated_resolved" ? "text-ax-verified" : ""}>
          {ATTAINMENT_LABELS[a.attainment.state] ?? a.attainment.state}
        </dd>
        <dt className="text-ax-muted">判定者</dt>
        <dd>{a.adjudicator}<span className="text-ax-muted"> · {BASIS_LABELS[a.adjudication_basis] ?? a.adjudication_basis}</span></dd>
        {a.formulation && (
          <>
            <dt className="text-ax-muted">定式化</dt>
            <dd>
              <span className="font-jbmono text-[13px] leading-[1.8]">{a.formulation.text}</span>
              <span className="mt-1 block text-[13px] text-ax-muted">{STRENGTH_LABELS[a.formulation.strength_relation] ?? a.formulation.strength_relation}</span>
              {a.formulation.constraints?.formal_framework && (
                <span className="mt-1 block font-jbmono text-[12px] text-ax-muted">{a.formulation.constraints.formal_framework}</span>
              )}
              {a.formulation.verification_endpoint && (
                <a href={a.formulation.verification_endpoint} className="mt-2 inline-block text-[13px] underline underline-offset-4 hover:opacity-70">
                  検証対象を見る
                </a>
              )}
            </dd>
          </>
        )}
      </dl>

      {owesDiff ? (
        <p className="mt-4 rounded-lg bg-ax-paper px-4 py-2.5 text-[13px] leading-relaxed text-ax-muted">
          差分（このアプローチが問いの何を保ち、何を弱めるか）はまだ書かれていません。人類審査で書きます。
        </p>
      ) : (
        <div className="mt-4 border-t border-ax-rule pt-3">
          <Diff label="保たれているもの" items={diff.preserved} />
          <Diff label="弱まっているもの" items={diff.weakened} />
          <Diff label="加えられた仮定・条件" items={diff.added} />
          {diff.notes && <p className="mt-3 text-[14px] leading-[1.9] text-ax-muted">{diff.notes}</p>}
        </div>
      )}

      {a.known_limits.length > 0 && (
        <div className="mt-4 border-t border-ax-rule pt-3">
          <p className="text-[12px] text-ax-muted">閉じた道</p>
          <ul className="mt-2 space-y-3">
            {a.known_limits.map((k) => (
              <li key={k.statement} className="text-[14px] leading-[1.9]">
                {k.statement}
                <span className="mt-1 block text-[13px] text-ax-muted">
                  {k.conditional_on ? `条件つき（${k.conditional_on}）— 前提が崩れれば道は開く` : "無条件"}
                </span>
                <Sources items={[k.source]} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.attainment.evidence.length > 0 && (
        <div className="mt-4 border-t border-ax-rule pt-3">
          <p className="text-[12px] text-ax-muted">証拠</p>
          <div className="mt-2"><Sources items={a.attainment.evidence} /></div>
        </div>
      )}

      {a.attainment.claims.length > 0 && (
        <div className="mt-4 border-t border-ax-rule pt-3">
          <p className="text-[12px] text-ax-muted">主張</p>
          <ul className="mt-2 space-y-1 text-[14px]">
            {a.attainment.claims.map((c) => (
              <li key={c.claimant + c.date}>
                {c.claimant}（{date(c.date)}）
                <span className="text-ax-muted"> · {c.adjudication_started ? "検証が始まっている" : "検証は未開始"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const [q, graph] = await Promise.all([getQuestion(id), getNeighbors(id)]);
  if (!q) notFound();
  if (id !== q.slug) redirect(`/open/q/${q.slug}`); // canonical URL uses the slug

  const nodes = new Map<string, Summary>((graph?.nodes ?? []).map((n) => [n.id, n]));
  const groups = new Map<string, { node: Summary; edge: Edge }[]>();
  for (const edge of graph?.edges ?? []) {
    const outgoing = edge.source === q.id;
    const other = nodes.get(outgoing ? edge.target : edge.source);
    if (!other || !EDGE_LABELS[edge.type]) continue;
    const label = EDGE_LABELS[edge.type][outgoing ? 0 : 1];
    groups.set(label, [...(groups.get(label) ?? []), { node: other, edge }]);
  }

  return (
    <article className="max-w-3xl">
      <a href={`/open?status=${q.curation_status}`} className="text-[13px] text-ax-muted hover:text-ax-ink">
        ← {STATUS_LABELS[q.curation_status] ?? q.curation_status}の問い
      </a>

      <p className="mt-8 flex flex-wrap items-center gap-2 text-[13px] font-medium">
        <span>{STATUS_LABELS[q.curation_status] ?? q.curation_status}</span>
        {q.flags.map((f) => (
          <a key={f} href={`/open?status=${q.curation_status}&flag=${f}`} className="rounded-full border border-ax-rule px-2 py-0.5 text-[12px] font-normal text-ax-muted hover:text-ax-ink">
            {FLAG_LABELS[f] ?? f}
          </a>
        ))}
      </p>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.7] tracking-[-0.01em] sm:text-[34px]">
        <span className={isSettled(q.approaches.map((a) => a.attainment.state)) ? "" : UNRESOLVED}>
          {q.title_i18n?.ja ?? q.title}
        </span>
      </h1>
      {q.title_i18n?.ja && <p className="mt-3 text-[15px] leading-relaxed text-ax-muted">{q.title}</p>}
      <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-jbmono text-[12px] text-ax-muted">
        {q.domain.map((d) => (
          <a key={d} href={`/open?status=${q.curation_status}&domain=${encodeURIComponent(d)}`} className="hover:text-ax-ink">{d}</a>
        ))}
      </p>

      {q.curation_status === "Screened" && (
        <p className="mt-8 rounded-lg border border-ax-rule bg-white px-4 py-3 text-[14px] leading-relaxed text-ax-muted">
          この問いは形式・安全性・重複の確認を通過し、人類審査を待っています。内容はまだ確定していません。
        </p>
      )}

      <div className="mt-10">
        {q.dissolution && (
          <Section label={`解消の記録 · ${date(q.dissolution.dissolved_at)}`}>
            <p className="text-[14px] leading-[1.9]"><span className="font-jbmono text-[13px]">{q.dissolution.reason}</span> · {q.dissolution.explanation}</p>
          </Section>
        )}
        {q.rejection && (
          <Section label="却下の理由">
            <p className="text-[14px] leading-[1.9]"><span className="font-jbmono text-[13px]">{q.rejection.code}</span> · {q.rejection.explanation}</p>
          </Section>
        )}

        <Section label="問題文">
          <p className="text-[16px] leading-[1.9]">{q.statement_i18n?.ja ?? q.statement}</p>
          {q.statement_i18n?.ja && <p className="mt-3 text-[14px] leading-[1.8] text-ax-muted">{q.statement}</p>}
        </Section>

        {q.background && (
          <Section label="背景">
            <p className="text-[14px] leading-[1.9] text-ax-muted">{q.background}</p>
          </Section>
        )}

        <Section label={`アプローチ · ${q.approaches.length} 件`}>
          <p className="mb-4 text-[13px] leading-[1.9] text-ax-muted">
            解決したかどうかは、問いではなくアプローチごとに決まります。Atlas は判定しません。外部の判定者が何をしたかを記録します。
            {q.approaches.length < 2 && "　この問いはまだアプローチが1件で、2件そろうまで人類審査を通れません。"}
          </p>
          <ul className="space-y-4">
            {q.approaches.map((a) => <ApproachCard key={a.id} a={a} />)}
          </ul>
        </Section>

        {groups.size > 0 && (
          <Section label="つながり">
            <div className="space-y-6">
              {[...groups].map(([label, items]) => (
                <div key={label}>
                  <p className="text-[13px] text-ax-muted">{label}</p>
                  <ul className="mt-2 space-y-3">
                    {items.map(({ node, edge }) => (
                      <li key={`${edge.type}-${node.id}`}>
                        <a href={`/open/q/${node.slug}`} className={`text-[15px] font-medium leading-[1.9] hover:opacity-70 ${isSettled(node.attainment) ? "" : UNRESOLVED}`}>
                          {node.title_i18n?.ja ?? node.title}
                        </a>
                        {edge.justification && <p className="mt-1 font-jbmono text-[12px] leading-[1.8] text-ax-muted">根拠: {edge.justification}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section label="出典">
          <Sources items={q.provenance} />
        </Section>

        <Section label="記録">
          <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-1.5 font-jbmono text-[12px]">
            <dt className="text-ax-muted">URI</dt><dd className="break-all">{q.uri}</dd>
            <dt className="text-ax-muted">登録</dt><dd>{date(q.created_at)}</dd>
            <dt className="text-ax-muted">最終レビュー</dt><dd>{date(q.last_reviewed_at)}</dd>
            <dt className="text-ax-muted">次回レビュー期限</dt><dd>{date(q.review_due_at)}</dd>
            <dt className="text-ax-muted">版</dt><dd className="break-all">{q.current_revision.slice(0, 12)}</dd>
            <dt className="text-ax-muted">ライセンス</dt><dd>{q.license}</dd>
            <dt className="text-ax-muted">立場</dt><dd>record_only（Atlas は判定しない）</dd>
          </dl>
        </Section>
      </div>
    </article>
  );
}
