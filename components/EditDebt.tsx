"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function EditDebt({
  debtId,
  initialName,
  initialTotal,
  initialPaid,
  initialDueDate,
}: {
  debtId: string;
  initialName: string;
  initialTotal: number;
  initialPaid: number;
  initialDueDate: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [total, setTotal] = useState(String(initialTotal));
  const [paid, setPaid] = useState(String(initialPaid));
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const totalValue = Number(total);
    const paidValue = Number(paid);
    if (!name.trim() || !totalValue || totalValue <= 0 || paidValue < 0) return;

    setLoading(true);
    const { error } = await supabase
      .from("debts")
      .update({
        name: name.trim(),
        total_amount: totalValue,
        paid_amount: Math.min(paidValue, totalValue),
        next_due_date: dueDate || null,
      })
      .eq("id", debtId);
    setLoading(false);

    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[var(--color-medium-gray)] p-1" aria-label="Izmeni dug">
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center">
      <form
        onSubmit={handleSave}
        className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 flex flex-col gap-3"
      >
        <p className="text-sm font-bold text-[var(--color-dark-navy)] mb-1">Izmeni dug</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">Ukupno</label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">Otplaćeno</label>
            <input
              type="number"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">Datum dospeća (opciono)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
          />
        </div>
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
            className="flex-1 rounded-xl bg-[var(--color-indigo)] text-white text-sm font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </form>
    </div>
  );
}
