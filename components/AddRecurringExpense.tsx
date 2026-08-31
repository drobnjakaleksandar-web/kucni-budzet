"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AddRecurringExpense({ householdId }: { householdId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [isVariable, setIsVariable] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const amountValue = Number(amount);
    if (!name.trim() || !amountValue || amountValue <= 0) return;

    setLoading(true);
    const { error } = await supabase.from("recurring_expenses").insert({
      household_id: householdId,
      name: name.trim(),
      category: "Fiksni",
      default_amount: amountValue,
      due_day: dueDay ? Number(dueDay) : null,
      is_variable: isVariable,
    });
    setLoading(false);

    if (!error) {
      setOpen(false);
      setName("");
      setAmount("");
      setDueDay("");
      setIsVariable(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-[var(--color-coral)]/40 text-[var(--color-coral)] text-sm font-semibold rounded-2xl py-3.5"
      >
        <Plus size={16} /> Dodaj fiksni trošak
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 flex flex-col gap-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naziv (npr. Netflix, Struja, Telefon)"
        className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-coral)]"
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[11px] text-[var(--color-dark-gray)] mb-1 block">
            {isVariable ? "Prosečan iznos" : "Iznos (RSD)"}
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-coral)]"
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
            placeholder="npr. 5"
            className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-coral)]"
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

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-[var(--color-warm-gray)] text-sm font-semibold py-2.5 text-[var(--color-dark-gray)]"
        >
          Otkaži
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-[var(--color-coral)] text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {loading ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </div>
    </form>
  );
}
