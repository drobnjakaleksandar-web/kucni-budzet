"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AddDebtPayment({
  debtId,
  debtName,
  direction,
  paidAmount,
  totalAmount,
  actionLabel,
  actionColor,
  householdId,
  userId,
  displayName,
}: {
  debtId: string;
  debtName: string;
  direction: "duguju" | "duguju_nam";
  paidAmount: number;
  totalAmount: number;
  actionLabel: string;
  actionColor: string;
  householdId: string;
  userId: string;
  displayName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const value = Number(amount);
    if (!value || value <= 0) return;

    setLoading(true);
    setError(null);

    const newPaid = Math.min(paidAmount + value, totalAmount);

    const { error: debtError } = await supabase.from("debts").update({ paid_amount: newPaid }).eq("id", debtId);

    if (debtError) {
      setError("Greška pri čuvanju.");
      setLoading(false);
      return;
    }

    // Mi dugujemo -> placanje je ODLIV (novac izlazi iz budzeta)
    // Duguju nama -> naplata je PRILIV (novac ulazi u budzet)
    const txType = direction === "duguju" ? "odliv" : "priliv";
    const txTitle = direction === "duguju" ? `Otplata: ${debtName}` : `Naplata: ${debtName}`;

    const { error: txError } = await supabase.from("transactions").insert({
      household_id: householdId,
      user_id: userId,
      type: txType,
      category: "Otplata duga",
      title: txTitle,
      amount: value,
      occurred_on: new Date().toISOString().slice(0, 10),
      person_name: displayName,
    });

    setLoading(false);

    if (txError) {
      setError("Rata je sačuvana, ali nije upisana u Odlive/Prilive.");
    }

    setOpen(false);
    setAmount("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-white rounded-full px-3 py-1.5 shrink-0"
        style={{ backgroundColor: actionColor }}
      >
        {actionLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-16 rounded-lg border border-[var(--color-warm-gray)] px-2 py-1 text-xs outline-none"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-xs font-semibold text-white rounded-full px-2.5 py-1.5 disabled:opacity-60"
          style={{ backgroundColor: actionColor }}
        >
          OK
        </button>
      </div>
      {error && <p className="text-[10px] text-[var(--color-dark-red)]">{error}</p>}
    </div>
  );
}
