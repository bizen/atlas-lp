"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-ax-rule bg-white">
      <code className="flex-1 overflow-x-auto whitespace-nowrap px-4 py-3 font-jbmono text-[13px] text-ax-ink">
        <span className="select-none text-ax-muted">$ </span>
        {command}
      </code>
      <button
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 border-l border-ax-rule px-4 text-[13px] text-ax-ink hover:bg-ax-paper"
        aria-label="コマンドをコピー"
      >
        {copied ? <Check size={14} className="text-ax-verified" /> : <Copy size={14} />}
        {copied ? "コピーしました" : "コピー"}
      </button>
    </div>
  );
}
