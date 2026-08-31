"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function EditRecurringExpense({
  expenseId,
  initialName,
  initialAmount,
  initialDueDay,
  initialIsVariable,
}: {
  expenseId: string;
  initialName: string;
  initialAmount: number;
  initialDueDay: number | null;
  initialIsVariable: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [amount, setAmount] = useState(String(initialAmount));
  const [dueDay, setDueDay] = useState(initialDueDay ? String(initialDueDay) : "");
  const [isVariable, setIsVariable] = useState(initialIsVariable);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const amountValue = Number(amount);
    if (!name.trim() || !amountValue || amountValue <= 0) return;

    setLoading(true);
    const { error } = await supabase
      .from("recurring_expenses")
      .update({
        name: name.trim(),
        default_amount: amountValue,
        due_day: dueDay ? Number(dueDay) : null,
        is_variable: isVariable,
      })
      .eq("id", expenseId);
    setLoading(false);

    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[var(--color-medium-gray)] p-1" aria-label="Izmeni">
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center">
      <form onSubmit={handleSave} className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 flex flex-col gap-3">
        <p className="text-sm font-bold text-[var(--color-dark-navy)] mb-1">Izmeni fiksni trošak</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">
              {isVariable ? "Prosečan iznos" : "Iznos (RSD)"}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="w-24">
            <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">Dan u mesecu</label>
            <input
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--color-dark-gray)]">
          <input
            type="checkbox"
            checked={isVariable}
            onChange={(e) => setIsVariable(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-coral)]"
          />
          Cifra se menja svakog meseca (npr. struja, telefon)
        </label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border border-[var(--color-warm-gray)] text-sm font-semibold py-3 text-[var(--color-dark-gray)]"
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-[var(--color-coral)] text-white text-sm font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </form>
    </div>
  );
}
