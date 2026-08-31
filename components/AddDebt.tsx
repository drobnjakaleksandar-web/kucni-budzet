"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AddDebt({ householdId }: { householdId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<"duguju" | "duguju_nam">("duguju");
  const [total, setTotal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const totalValue = Number(total);
    if (!name.trim() || !totalValue || totalValue <= 0) return;

    setLoading(true);
    const { error } = await supabase.from("debts").insert({
      household_id: householdId,
      name: name.trim(),
      direction,
      total_amount: totalValue,
      paid_amount: 0,
      next_due_date: dueDate || null,
      linked_to_expenses: true,
    });
    setLoading(false);

    if (!error) {
      setOpen(false);
      setName("");
      setTotal("");
      setDueDate("");
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-[var(--color-indigo)]/40 text-[var(--color-indigo)] text-sm font-semibold rounded-2xl py-3.5"
      >
        <Plus size={16} /> Dodaj novi dug
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection("duguju")}
          className="flex-1 text-xs font-semibold rounded-full py-2 border"
          style={
            direction === "duguju"
              ? { backgroundColor: "var(--color-indigo)", borderColor: "var(--color-indigo)", color: "white" }
              : { borderColor: "var(--color-warm-gray)", color: "var(--color-dark-gray)" }
          }
        >
          Mi dugujemo
        </button>
        <button
          type="button"
          onClick={() => setDirection("duguju_nam")}
          className="flex-1 text-xs font-semibold rounded-full py-2 border"
          style={
            direction === "duguju_nam"
              ? { backgroundColor: "var(--color-teal)", borderColor: "var(--color-teal)", color: "white" }
              : { borderColor: "var(--color-warm-gray)", color: "var(--color-dark-gray)" }
          }
        >
          Duguju nama
        </button>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naziv (npr. Banka - kes kredit)"
        className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-indigo)]"
      />
      <input
        type="number"
        inputMode="decimal"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        placeholder="Ukupan iznos (RSD)"
        className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-indigo)]"
      />
      <div>
        <label className="text-[11px] font-semibold text-[var(--color-dark-gray)] mb-1 block">
          Datum dospeća sledeće rate (opciono)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-indigo)]"
        />
        <p className="text-[10px] text-[var(--color-medium-gray)] mt-1">
          Ostavi prazno ako dug nema fiksni raspored otplate.
        </p>
      </div>
      <div className="flex gap-2">
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
          className="flex-1 rounded-xl bg-[var(--color-indigo)] text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {loading ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </div>
    </form>
  );
}
