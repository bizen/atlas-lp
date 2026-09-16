// Read-only access to the Atlas corpus through the public MCP endpoint, so the site shows exactly
// what agents see (public statuses only) and needs no database credentials.
//
// v3: a node is a question, and whether it is answered is recorded per approach, never on the node.

/** Where the record stands in Atlas's own workflow — never whether the question is answered. */
export const STATUS_LABELS: Record<string, string> = {
  Screened: "人類審査前",
  Validated: "審査済み",
  Dissolved: "問いとして解消",
  Superseded: "置き換え済み",
  Rejected: "却下",
};

/** What an external adjudicator has done with one approach. Atlas records this; it never decides it. */
export const ATTAINMENT_LABELS: Record<string, string> = {
  not_attempted: "未着手",
  in_progress: "進行中",
  claimed: "主張あり（検証は未開始）",
  under_adjudication: "検証中",
  adjudicated_resolved: "解決と判定",
  adjudicated_refuted: "否定と判定",
  proven_insufficient: "この道では到達できないと証明済み",
  question_rejection: "問いそのものを否定する立場",
  unverified: "Atlas 未確認",
  unadjudicated: "判定者なし・判定がつかない",
};

export const KIND_LABELS: Record<string, string> = {
  formal_proof_system: "形式証明",
  peer_reviewed_proof: "査読付きの証明",
  computational: "計算による判定",
  empirical_replication: "実験の再現",
  expert_consensus: "専門家の合意",
  barrier_result: "閉じた道（障壁）",
  question_rejection: "問いの否定",
};

export const BASIS_LABELS: Record<string, string> = {
  typecheck: "型検査",
  peer_review: "査読",
  replication: "再現",
  execution: "実行",
  consensus: "合意",
  citation: "引用",
  none: "判定手続きなし",
};

export const FLAG_LABELS: Record<string, string> = { contested: "異論あり", stale: "見直し期限切れ" };

/** A question is settled once some approach has been adjudicated; until then it keeps the wavy underline. */
export const isSettled = (attainment: string[] = []) =>
  attainment.includes("adjudicated_resolved") || attainment.includes("adjudicated_refuted");
export const UNRESOLVED = "underline decoration-wavy decoration-ax-open decoration-[1.5px] underline-offset-[6px]";

type Provenance = { source_type: string; identifier: string; locator?: string; extracted_by: string; extraction_model?: string };

export type Edge = { source: string; type: string; target: string; justification?: string };

export type Summary = {
  id: string; slug: string; title: string; title_i18n?: Record<string, string>; domain: string[];
  curation_status: string; flags: string[]; approach_count: number; attainment: string[];
};

export type Approach = {
  id: string;
  name: string;
  kind: string;
  adjudicator: string;
  adjudication_basis: string;
  formulation?: {
    text: string;
    artifact_ref?: string;
    strength_relation: string;
    verification_endpoint?: string;
    constraints?: { resource_bounds?: string; formal_framework?: string; assumptions?: string[] };
  };
  fidelity_diff: { preserved: string[]; weakened: string[]; added: string[]; notes?: string };
  attainment: {
    state: string;
    claims: { claimant: string; date: number; source: Provenance; adjudication_started: boolean }[];
    evidence: Provenance[];
  };
  adjudication_cost: { who: string; effort: string; elapsed?: string; basis: string };
  known_limits: {
    statement: string; closure_type: string; conditional_on: string | null;
    effect: string; effect_sources: Provenance[]; source: Provenance;
  }[];
  contested: { is: boolean; sources: Provenance[] };
  last_verified_at: number;
};

export type Question = Summary & {
  uri: string;
  statement: string;
  statement_i18n?: Record<string, string>;
  background?: string;
  approaches: Approach[];
  provenance: Provenance[];
  dissolution?: { dissolved_at: number; reason: string; explanation: string };
  rejection?: { code: string; explanation: string };
  license: string;
  created_at: number;
  last_reviewed_at?: number;
  review_due_at: number;
  current_revision: string;
};

const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mcp`;

// Returns null when the tool reports an error (e.g. no public question with that id).
async function call<T>(name: string, args: object): Promise<T | null> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Atlas MCP ${name}: HTTP ${res.status}`);
  const { result, error } = await res.json();
  if (error) throw new Error(`Atlas MCP ${name}: ${error.message}`);
  if (result.isError) return null;
  return JSON.parse(result.content[0].text) as T;
}

export const searchQuestions = (args: {
  query: string; domain?: string; curation_status?: string; attainment?: string;
  flags?: string[]; cursor?: string; limit?: number;
}) => call<{ results: Summary[]; next_cursor?: string }>("search_questions", args);

export const getQuestion = (id: string) => call<Question>("get_question", { id });

export const getNeighbors = (id: string) =>
  call<{ nodes: Summary[]; edges: Edge[] }>("get_subgraph", {
    id,
    depth: 1,
    max_nodes: 200,
    edge_types: ["prerequisite", "specializes", "superseded_by", "refines", "implies", "related_to", "contradicts"],
  });
