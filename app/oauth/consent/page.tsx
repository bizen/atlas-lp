import type { Metadata } from "next";
import { Suspense } from "react";
import Consent from "./Consent";

export const metadata: Metadata = {
  title: "Authorize an agent — Atlas",
  robots: { index: false, follow: false },
};

// Supabase Auth OAuth 2.1 server sends users here (Site URL + Authorization Path) with ?authorization_id=…
export default function ConsentPage() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-5 py-16">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-lg tracking-tight text-ink">Atlas</span>
        <span className="font-mono text-[11px] uppercase tracking-label text-atlas">Alt</span>
      </div>
      <Suspense>
        <Consent />
      </Suspense>
    </main>
  );
}
