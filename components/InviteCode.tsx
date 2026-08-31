"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between gap-2 rounded-xl border border-[var(--color-warm-gray)] bg-[var(--color-off-white)] px-3 py-3"
    >
      <span className="text-xs font-mono text-[var(--color-dark-gray)] truncate">{code}</span>
      {copied ? (
        <Check size={16} className="text-[var(--color-teal)] shrink-0" />
      ) : (
        <Copy size={16} className="text-[var(--color-medium-gray)] shrink-0" />
      )}
    </button>
  );
}
