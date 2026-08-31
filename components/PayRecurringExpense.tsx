"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function PayRecurringExpense({
  expenseId,
  expenseName,
  defaultAmount,
  isVariable,
  period,
  householdId,
  userId,
  displayName,
}: {
  expenseId: string;
  expenseName: string;
  defaultAmount: number;
  isVariable: boolean;
  period: string;
  householdId: string;
  userId: string;
  displayName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const value = Number(amount);
    if (!value || value <= 0) return;

    setLoading(true);
    setError(null);

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        household_id: householdId,
        user_id: userId,
        type: "odliv",
        category: "Fiksni",
        title: expenseName,
        amount: value,
        occurred_on: new Date().toISOString().slice(0, 10),
        person_name: displayName,
      })
      .select()
      .single();

    if (txError || !tx) {
      setError("Greška pri čuvanju.");
      setLoading(false);
      return;
    }

    const { error: payError } = await supabase.from("recurring_payments").insert({
      recurring_expense_id: expenseId,
      household_id: householdId,
      transaction_id: tx.id,
      amount: value,
      period,
    });

    setLoading(false);

    if (payError) {
      setError("Trošak je zabeležen u Odlivima, ali status plaćanja nije sačuvan.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-white bg-[var(--color-coral)] rounded-full px-3 py-1.5"
      >
        Plati
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        {isVariable ? (
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 rounded-lg border border-[var(--color-warm-gray)] px-2 py-1 text-xs outline-none"
          />
        ) : (
          <span className="text-xs font-semibold text-[var(--color-dark-gray)]">
            {Number(amount).toLocaleString("sr-RS")} RSD
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-xs font-semibold text-white bg-[var(--color-coral)] rounded-full px-3 py-1.5 disabled:opacity-60"
        >
          {loading ? "..." : "Potvrdi"}
        </button>
        <button onClick={() => setOpen(false)} className="text-[10px] text-[var(--color-medium-gray)]">
          Otkaži
        </button>
      </div>
      {error && <p className="text-[10px] text-[var(--color-dark-red)]">{error}</p>}
    </div>
  );
}
