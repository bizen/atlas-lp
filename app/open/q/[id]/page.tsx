import type { Metadata } from "next";
import { Check } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { FLAG_LABELS, getNeighbors, getQuestion, isOpen, STATUS_LABELS, UNRESOLVED, type Edge, type Question, type Summary } from "@/lib/atlas";

// How each edge reads from this page's question: [when it is the source, when it is the target].
const EDGE_LABELS: Record<string, [string, string]> = {
  prerequisite: ["解くために先に必要な問い", "この問いを前提とする問い"],
  implies: ["この問いが肯定的に解決すれば、成り立つ問い", "肯定的に解決すれば、この問いも成り立つ問い"],
  specializes: ["この問いを特殊な場合として含む、より一般的な問い", "この問いの特殊な場合"],
  refines: ["この問いが基準を厳密にした、元の問い", "この問いの基準を厳密にした問い"],
  superseded_by: ["この問いを置き換えた問い", "この問いが置き換えた問い"],
  related_to: ["関連する問い", "関連する問い"],
  contradicts: ["両方が肯定的に解決することはない問い", "両方が肯定的に解決することはない問い"],
};

const CRITERIA_LABELS: Record<string, string> = {
  Formal_Proof: "形式証明",
  Deterministic_Code: "決定的なコード",
  Empirical_Oracle: "実証的な判定",
  Expert_Consensus: "専門家の合意",
};

const VERIFIED_LABELS: Record<string, string> = { automated_suite: "自動検証", human_review: "人類審査", both: "自動検証と人類審査" };

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
      <a href={`/open?status=${q.status}`} className="text-[13px] text-ax-muted hover:text-ax-ink">← {STATUS_LABELS[q.status] ?? q.status}の問い</a>

      <p className="mt-8 flex flex-wrap items-center gap-2 text-[13px] font-medium">
        <span>{STATUS_LABELS[q.status] ?? q.status}</span>
        {q.flags.map((f) => (
          <a key={f} href={`/open?status=${q.status}&flag=${f}`} className="rounded-full border border-ax-rule px-2 py-0.5 text-[12px] font-normal text-ax-muted hover:text-ax-ink">
            {FLAG_LABELS[f] ?? f}
          </a>
        ))}
      </p>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.7] tracking-[-0.01em] sm:text-[34px]">
        <span className={isOpen(q.status) ? UNRESOLVED : ""}>{q.title_i18n?.ja ?? q.title}</span>
      </h1>
      {q.title_i18n?.ja && <p className="mt-3 text-[15px] leading-relaxed text-ax-muted">{q.title}</p>}
      <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-jbmono text-[12px] text-ax-muted">
        {q.domain.map((d) => (
          <a key={d} href={`/open?status=${q.status}&domain=${encodeURIComponent(d)}`} className="hover:text-ax-ink">{d}</a>
        ))}
      </p>

      {q.status === "Screened" && (
        <p className="mt-8 rounded-lg border border-ax-rule bg-white px-4 py-3 text-[14px] leading-relaxed text-ax-muted">
          この問いは形式・安全性・重複の確認を通過し、人類審査を待っています。内容はまだ確定していません。
        </p>
      )}

      <div className="mt-10">
        {q.resolution && (
          <Section label={`解決の記録 · ${date(q.resolution.resolved_at)} · 確認: ${VERIFIED_LABELS[q.resolution.verified_by] ?? q.resolution.verified_by}`}>
            {q.resolution.evidence.some((e) => /lean/i.test(`${e.identifier} ${e.locator ?? ""}`)) && (
              <p className="mb-4 flex items-center gap-1.5 text-[14px] text-ax-verified">
                <Check size={15} strokeWidth={2.5} /> Lean 4 の証明が公開済み
              </p>
            )}
            {q.resolution.notes && <p className="mb-5 text-[14px] leading-[1.9] text-ax-muted">{q.resolution.notes}</p>}
            <Sources items={q.resolution.evidence} />
          </Section>
        )}
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

        <Section label="解決の基準">
          <ul className="space-y-3">
            {q.resolution_criteria.map((c, i) => (
              <li key={i} className="rounded-2xl border border-ax-rule bg-white p-5 sm:p-6">
                <p className="text-[13px] font-medium">{CRITERIA_LABELS[c.type] ?? c.type}</p>
                <p className="mt-2 font-jbmono text-[13px] leading-[1.8] text-ax-muted">{c.specification}</p>
                {c.verification_endpoint && (
                  <a href={c.verification_endpoint} className="mt-3 inline-block text-[13px] underline underline-offset-4 hover:opacity-70">
                    検証対象を見る
                  </a>
                )}
              </li>
            ))}
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
                        <a href={`/open/q/${node.slug}`} className={`text-[15px] font-medium leading-[1.9] hover:opacity-70 ${isOpen(node.status) ? UNRESOLVED : ""}`}>
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

        {(q.constraints.formal_framework || q.constraints.assumptions?.length || q.constraints.resource_bounds) && (
          <Section label="前提条件">
            <dl className="space-y-2 text-[14px] leading-[1.8]">
              {q.constraints.formal_framework && <div><dt className="inline text-ax-muted">形式体系: </dt><dd className="inline font-jbmono text-[13px]">{q.constraints.formal_framework}</dd></div>}
              {q.constraints.resource_bounds && <div><dt className="inline text-ax-muted">資源の制約: </dt><dd className="inline">{q.constraints.resource_bounds}</dd></div>}
              {q.constraints.assumptions?.map((a) => <div key={a}><dt className="inline text-ax-muted">仮定: </dt><dd className="inline">{a}</dd></div>)}
            </dl>
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
          </dl>
        </Section>
      </div>
    </article>
  );
}
