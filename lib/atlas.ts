// Read-only access to the Atlas corpus through the public MCP endpoint, so the site shows exactly
// what agents see (public statuses only) and needs no database credentials.

export const STATUS_LABELS: Record<string, string> = {
  Validated: "審査済み",
  Screened: "人類審査前",
  Resolved: "解決",
  Dissolved: "問いとして解消",
  Superseded: "置き換え済み",
  Rejected: "却下",
};
export const FLAG_LABELS: Record<string, string> = { contested: "異論あり", criteria_weak: "基準があいまい", stale: "見直し期限切れ" };

// Unresolved questions (still open for solving) get the wavy underline.
export const isOpen = (status: string) => status === "Screened" || status === "Validated";
export const UNRESOLVED = "underline decoration-wavy decoration-ax-open decoration-[1.5px] underline-offset-[6px]";

type Provenance = { source_type: string; identifier: string; locator?: string; extracted_by: string; extraction_model?: string };

export type Edge = { source: string; type: string; target: string; justification?: string };
export type Summary = { id: string; slug: string; title: string; title_i18n?: Record<string, string>; domain: string[]; status: string; flags: string[] };
export type Question = Summary & {
  uri: string;
  statement: string;
  statement_i18n?: Record<string, string>;
  background?: string;
  constraints: { formal_framework?: string; assumptions?: string[]; resource_bounds?: string };
  resolution_criteria: { type: string; specification: string; verification_endpoint?: string; consensus_protocol?: string }[];
  provenance: Provenance[];
  resolution?: { resolved_at: number; evidence: Provenance[]; verified_by: string; notes?: string };
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

export const searchQuestions = (args: { query: string; domain?: string; status?: string; flags?: string[]; cursor?: string; limit?: number }) =>
  call<{ results: Summary[]; next_cursor?: string }>("search_questions", args);

export const getQuestion = (id: string) => call<Question>("get_question", { id });

export const getNeighbors = (id: string) =>
  call<{ nodes: Summary[]; edges: Edge[] }>("get_subgraph", {
    id,
    depth: 1,
    max_nodes: 200,
    edge_types: ["prerequisite", "specializes", "superseded_by", "refines", "implies", "related_to", "contradicts"],
  });
