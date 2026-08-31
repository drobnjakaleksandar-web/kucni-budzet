"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ConvertToDebt({
  expenseId,
  expenseName,
  amount,
  period,
  householdId,
}: {
  expenseId: string;
  expenseName: string;
  amount: number;
  period: string;
  householdId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    setLoading(true);

    const { error: debtError } = await supabase.from("debts").insert({
      household_id: householdId,
      name: `${expenseName} (neplaćeno)`,
      direction: "duguju",
      total_amount: amount,
      paid_amount: 0,
    });

    if (debtError) {
      setLoading(false);
      return;
    }

    // Oznaci ovaj period kao "resen" (bez pravljenja odliva) da ne ostane visi u "Za placanje"
    await supabase.from("recurring_payments").insert({
      recurring_expense_id: expenseId,
      household_id: householdId,
      transaction_id: null,
      amount: 0,
      period,
    });

    setLoading(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-[10px] text-[var(--color-indigo)] underline">
        Prebaci u dug
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleConvert}
        disabled={loading}
        className="text-[10px] font-semibold text-white bg-[var(--color-indigo)] rounded-full px-2 py-1"
      >
        {loading ? "..." : "Da, prebaci"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-[10px] text-[var(--color-medium-gray)]">
        Ne
      </button>
    </div>
  );
}
