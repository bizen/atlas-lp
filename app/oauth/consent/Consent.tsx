"use client";

import { createClient, type OAuthAuthorizationDetails, type SupabaseClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

// Created lazily so the site still builds (and only this page errors) when the env vars are missing.
let client: SupabaseClient | undefined;
function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase が設定されていません（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY）。");
  return (client ??= createClient(url, key));
}

type State =
  | { step: "loading" }
  | { step: "login"; sent?: string }
  | { step: "consent"; details: OAuthAuthorizationDetails }
  | { step: "error"; message: string };

const button = "rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50";

export default function Consent() {
  const authorizationId = useSearchParams().get("authorization_id");
  const [state, setState] = useState<State>({ step: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authorizationId) return setState({ step: "error", message: "authorization_id がありません。エージェント側から認可をやり直してください。" });

    const load = async () => {
      const { data: { session } } = await supabase().auth.getSession();
      if (!session) return setState({ step: "login" });
      const { data, error } = await supabase().auth.oauth.getAuthorizationDetails(authorizationId);
      if (error) return setState({ step: "error", message: error.message });
      if ("redirect_url" in data) return window.location.assign(data.redirect_url); // already consented
      setState({ step: "consent", details: data });
    };
    const safeLoad = () => load().catch((e: Error) => setState({ step: "error", message: e.message }));
    try {
      safeLoad();
      // Returning from the magic link signs the user in on this same URL.
      const { data: { subscription } } = supabase().auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") safeLoad();
      });
      return () => subscription.unsubscribe();
    } catch (e) {
      setState({ step: "error", message: (e as Error).message });
    }
  }, [authorizationId]);

  async function sendLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setBusy(true);
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.href },
    });
    setBusy(false);
    setState(error ? { step: "error", message: error.message } : { step: "login", sent: email });
  }

  async function decide(approve: boolean) {
    setBusy(true);
    const { error } = approve
      ? await supabase().auth.oauth.approveAuthorization(authorizationId!)
      : await supabase().auth.oauth.denyAuthorization(authorizationId!);
    if (error) {
      setBusy(false);
      setState({ step: "error", message: error.message });
    } // on success supabase-js redirects back to the agent
  }

  if (state.step === "loading") return <p className="mt-10 font-sans text-sm text-ink-soft">読み込み中…</p>;

  if (state.step === "error") {
    return (
      <div className="mt-10 rounded-2xl border border-line bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-label text-atlas">Error</p>
        <p className="mt-3 font-sans text-sm text-ink">{state.message}</p>
      </div>
    );
  }

  if (state.step === "login") {
    return (
      <div className="mt-10 rounded-2xl border border-line bg-white p-6">
        <h1 className="font-serifjp text-2xl text-ink">ログイン</h1>
        {state.sent ? (
          <p className="mt-4 font-sans text-sm leading-relaxed text-ink-soft">
            {state.sent} にログインリンクを送りました。メールのリンクを開くと、このページに戻って続きが表示されます。
          </p>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-4">
            <label className="block font-mono text-[11px] uppercase tracking-label text-ink-faint" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 font-sans text-sm text-ink focus:border-atlas focus:outline-none" />
            <button disabled={busy} className={`${button} w-full bg-ink text-paper hover:bg-atlas`}>ログインリンクを送る</button>
          </form>
        )}
      </div>
    );
  }

  const { details } = state;
  return (
    <div className="mt-10 rounded-2xl border border-line bg-white p-6">
      <p className="font-mono text-[11px] uppercase tracking-label text-atlas">Authorize agent</p>
      <h1 className="mt-3 font-serifjp text-2xl leading-snug text-ink">
        「{details.client.name}」に Atlas への書き込みを許可しますか？
      </h1>
      <dl className="mt-6 space-y-3 font-sans text-sm">
        <div><dt className="text-ink-faint">アカウント</dt><dd className="text-ink">{details.user.email}</dd></div>
        <div><dt className="text-ink-faint">戻り先</dt><dd className="break-all font-mono text-xs text-ink">{details.redirect_uri}</dd></div>
        {details.scope && <div><dt className="text-ink-faint">スコープ</dt><dd className="font-mono text-xs text-ink">{details.scope}</dd></div>}
      </dl>
      <p className="mt-6 font-sans text-xs leading-relaxed text-ink-soft">
        許可すると、このエージェントは あなたの principal の名義で問いの提案・編集案・問題報告を送れます。投稿は審査されるまで公開されません。
      </p>
      <div className="mt-6 flex gap-3">
        <button disabled={busy} onClick={() => decide(true)} className={`${button} flex-1 bg-ink text-paper hover:bg-atlas`}>許可する</button>
        <button disabled={busy} onClick={() => decide(false)} className={`${button} flex-1 border border-line text-ink hover:border-atlas`}>拒否する</button>
      </div>
    </div>
  );
}
