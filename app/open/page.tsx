import { ATTAINMENT_LABELS, FLAG_LABELS, isSettled, searchQuestions, STATUS_LABELS, UNRESOLVED } from "@/lib/atlas";

type Params = { q?: string; status?: string; domain?: string; flag?: string; attainment?: string; cursor?: string };

const DEFAULT_STATUS = "Validated";

const STATUS_NOTES: Record<string, string> = {
  Screened: "形式・安全性・重複の確認を通過し、人類審査を待っている問いです。論文でいうプレプリントにあたります。",
  Validated: "人類審査を通過した問いです。アプローチが2つ以上あり、それぞれに判定者と差分が書かれています。",
  Dissolved: "前提の誤りなどにより、問いとして成り立たなくなったものです。",
  Superseded: "より良い定式化の問いに置き換えられたものです。",
  Rejected: "収録基準を満たさなかった提案です。理由とともに記録を残しています。",
};

// The states worth filtering on: what has been settled, and which roads are closed.
const ATTAINMENT_FILTERS = ["adjudicated_resolved", "proven_insufficient", "unadjudicated", "not_attempted"];

const field = "rounded-lg border border-ax-rule bg-white px-3 py-2 text-[14px] text-ax-ink focus:border-ax-ink focus:outline-none";

export default async function OpenIndex({ searchParams }: { searchParams: Params }) {
  const { q = "", domain, flag, attainment, cursor } = searchParams;
  const status = searchParams.status && STATUS_LABELS[searchParams.status] ? searchParams.status : DEFAULT_STATUS;
  const flags = flag && FLAG_LABELS[flag] ? [flag] : undefined;

  // Domains across every public status, so the filter offers all of them.
  const [page, ...everything] = await Promise.all([
    searchQuestions({ query: q, curation_status: status, domain, flags, attainment, cursor, limit: 50 }),
    ...Object.keys(STATUS_LABELS).map((s) => searchQuestions({ query: "", curation_status: s, limit: 50 })),
  ]);
  const domains = [...new Set(everything.flatMap((p) => p?.results.flatMap((r) => r.domain) ?? []))].sort();
  const results = page?.results ?? [];

  const href = (change: Partial<Params>) => {
    const merged: Params = { q: q || undefined, status, domain, flag, attainment, ...change };
    const entries = Object.entries(merged).filter((e): e is [string, string] => !!e[1] && !(e[0] === "status" && e[1] === DEFAULT_STATUS));
    return `/open${entries.length ? "?" + new URLSearchParams(entries) : ""}`;
  };

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] sm:text-[44px]">
        <span className={UNRESOLVED}>問い</span>の一覧
      </h1>
      <p className="mt-4 max-w-2xl text-[14px] leading-[1.9] text-ax-muted">
        どの問いも、複数のアプローチとその判定者とともに記録されています。解決したかどうかはアプローチごとに決まります。
      </p>

      <nav aria-label="状態" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-ax-rule text-[14px]">
        {Object.entries(STATUS_LABELS).map(([s, label]) => (
          <a
            key={s}
            href={href({ status: s, cursor: undefined })}
            aria-current={s === status ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 ${s === status ? "border-ax-ink font-medium" : "border-transparent text-ax-muted hover:text-ax-ink"}`}
          >
            {label}
          </a>
        ))}
      </nav>
      <p className="mt-4 max-w-2xl text-[14px] leading-[1.9] text-ax-muted">{STATUS_NOTES[status]}</p>

      <form action="/open" className="mt-6 flex flex-wrap items-end gap-3 text-[14px]">
        {status !== DEFAULT_STATUS && <input type="hidden" name="status" value={status} />}
        <label className="flex flex-col gap-1.5 text-[12px] text-ax-muted">
          キーワード
          <input name="q" type="search" defaultValue={q} className={`w-44 ${field}`} />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ax-muted">
          分野
          <select name="domain" defaultValue={domain ?? ""} className={field}>
            <option value="">すべて</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ax-muted">
          アプローチの状態
          <select name="attainment" defaultValue={attainment ?? ""} className={field}>
            <option value="">指定なし</option>
            {ATTAINMENT_FILTERS.map((a) => <option key={a} value={a}>{ATTAINMENT_LABELS[a]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ax-muted">
          印
          <select name="flag" defaultValue={flag ?? ""} className={field}>
            <option value="">指定なし</option>
            {Object.entries(FLAG_LABELS).map(([f, label]) => <option key={f} value={f}>{label}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-ax-ink px-4 py-2 font-medium text-white hover:opacity-80">絞り込む</button>
        {(q || domain || flag || attainment) && (
          <a href={href({ q: undefined, domain: undefined, flag: undefined, attainment: undefined, cursor: undefined })} className="py-2 text-ax-muted underline underline-offset-4 hover:text-ax-ink">
            条件をクリア
          </a>
        )}
      </form>

      <p className="mt-10 font-jbmono text-[12px] text-ax-muted">{results.length}{page?.next_cursor ? "+" : ""} 件</p>
      <ul className="mt-3 overflow-hidden rounded-2xl border border-ax-rule bg-white">
        {results.map((r) => (
          <li key={r.id} className="border-t border-ax-rule px-5 py-6 first:border-t-0 sm:px-8">
            {r.flags.length > 0 && (
              <p className="mb-2 flex flex-wrap gap-2">
                {r.flags.map((f) => (
                  <span key={f} className="rounded-full border border-ax-rule px-2 py-0.5 text-[12px] text-ax-muted">{FLAG_LABELS[f] ?? f}</span>
                ))}
              </p>
            )}
            <a href={`/open/q/${r.slug}`} className={`text-[17px] font-bold leading-[1.9] hover:opacity-70 ${isSettled(r.attainment) ? "" : UNRESOLVED}`}>
              {r.title_i18n?.ja ?? r.title}
            </a>
            <p className="mt-2 text-[13px] leading-[1.8] text-ax-muted">
              アプローチ {r.approach_count} 件
              {r.attainment.length > 0 && <> · {r.attainment.map((a) => ATTAINMENT_LABELS[a] ?? a).join(" / ")}</>}
            </p>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-jbmono text-[12px] text-ax-muted">
              {r.domain.map((d) => (
                <a key={d} href={href({ domain: d, cursor: undefined })} className="hover:text-ax-ink">{d}</a>
              ))}
            </p>
          </li>
        ))}
        {results.length === 0 && <li className="px-5 py-8 text-[14px] text-ax-muted sm:px-8">この条件に当てはまる問いはありません。条件を変えてみてください。</li>}
      </ul>

      {page?.next_cursor && (
        <a href={href({ cursor: page.next_cursor })} className="mt-6 inline-block text-[14px] font-medium hover:opacity-70">
          次の50件 →
        </a>
      )}
    </>
  );
}
