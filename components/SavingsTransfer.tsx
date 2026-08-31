"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SavingsTransfer({
  goalId,
  goalName,
  currentAmount,
  targetAmount,
  householdId,
  userId,
  displayName,
}: {
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  householdId: string;
  userId: string;
  displayName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"none" | "deposit" | "withdraw">("none");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const value = Number(amount);
    if (!value || value <= 0) return;

    if (mode === "withdraw" && value > currentAmount) {
      setError("Nemaš toliko ušteđeno u ovoj korpi.");
      return;
    }

    setError(null);
    setLoading(true);

    const newAmount =
      mode === "deposit" ? currentAmount + value : Math.max(0, currentAmount - value);

    const { error: goalError } = await supabase
      .from("savings_goals")
      .update({
        current_amount: newAmount,
        status: newAmount >= targetAmount ? "completed" : "active",
      })
      .eq("id", goalId);

    if (goalError) {
      setError("Greška pri čuvanju.");
      setLoading(false);
      return;
    }

    const txType = mode === "deposit" ? "odliv" : "priliv";
    const txTitle =
      mode === "deposit" ? `Prebačeno u štednju: ${goalName}` : `Vraćeno iz štednje: ${goalName}`;

    await supabase.from("transactions").insert({
      household_id: householdId,
      user_id: userId,
      type: txType,
      category: mode === "deposit" ? "Prebačeno u štednju" : "Vraćeno iz štednje",
      title: txTitle,
      amount: value,
      occurred_on: new Date().toISOString().slice(0, 10),
      person_name: displayName,
    });

    setLoading(false);
    setMode("none");
    setAmount("");
    router.refresh();
  }

  if (mode === "none") {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={() => setMode("deposit")}
          className="text-xs font-semibold text-[var(--color-teal)] bg-[var(--color-teal)]/10 rounded-full px-3 py-1.5"
        >
          Uplati
        </button>
        {currentAmount > 0 && (
          <button
            onClick={() => setMode("withdraw")}
            className="text-xs font-semibold text-[var(--color-dark-red)] bg-[var(--color-dark-red)]/10 rounded-full px-3 py-1.5"
          >
            Povuci
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-20 rounded-lg border border-[var(--color-warm-gray)] px-2 py-1 text-xs outline-none"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-xs font-semibold text-white rounded-full px-3 py-1.5 disabled:opacity-60"
          style={{ backgroundColor: mode === "deposit" ? "var(--color-teal)" : "var(--color-dark-red)" }}
        >
          OK
        </button>
        <button onClick={() => { setMode("none"); setError(null); }} className="text-[10px] text-[var(--color-medium-gray)]">
          Otkaži
        </button>
      </div>
      {error && <p className="text-[10px] text-[var(--color-dark-red)]">{error}</p>}
    </div>
  );
}
