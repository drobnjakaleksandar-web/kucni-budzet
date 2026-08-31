"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AddSavingsGoal({ householdId }: { householdId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const targetValue = Number(target);
    if (!name.trim() || !targetValue || targetValue <= 0) return;

    setLoading(true);
    const { error } = await supabase.from("savings_goals").insert({
      household_id: householdId,
      name: name.trim(),
      target_amount: targetValue,
      current_amount: 0,
      status: "active",
    });
    setLoading(false);

    if (!error) {
      setOpen(false);
      setName("");
      setTarget("");
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-1 border-2 border-dashed border-[var(--color-coral)]/40 text-[var(--color-coral)] text-sm font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-1.5"
      >
        <Plus size={16} /> Dodaj novu korpu
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 flex flex-col gap-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naziv korpe (npr. Novi telefon)"
        className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-coral)]"
      />
      <input
        type="number"
        inputMode="decimal"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Ciljani iznos (RSD)"
        className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-coral)]"
      />
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
          className="flex-1 rounded-xl bg-[var(--color-coral)] text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {loading ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </div>
    </form>
  );
}
