"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { categoriesByType } from "@/lib/categories";

export default function EditTransaction({
  id,
  type,
  initialCategory,
  initialTitle,
  initialAmount,
  initialDate,
}: {
  id: string;
  type: "priliv" | "odliv";
  initialCategory: string;
  initialTitle: string;
  initialAmount: number;
  initialDate: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState(String(initialAmount));
  const [date, setDate] = useState(initialDate);
  const [loading, setLoading] = useState(false);

  const categories = categoriesByType[type];
  const accentColor = type === "priliv" ? "var(--color-teal)" : "var(--color-coral)";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim() || !value || value <= 0) return;

    setLoading(true);
    const { error } = await supabase
      .from("transactions")
      .update({ category, title: title.trim(), amount: value, occurred_on: date })
      .eq("id", id);
    setLoading(false);

    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[var(--color-medium-gray)] p-1" aria-label="Izmeni">
        <Pencil size={13} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center">
      <form onSubmit={handleSave} className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 flex flex-col gap-3">
        <p className="text-sm font-bold text-[var(--color-dark-navy)] mb-1">
          Izmeni {type === "priliv" ? "priliv" : "odliv"}
        </p>

        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className="text-xs font-semibold rounded-full px-3 py-1.5 border"
              style={
                category === c
                  ? { backgroundColor: accentColor, borderColor: accentColor, color: "white" }
                  : { borderColor: "var(--color-warm-gray)", color: "var(--color-dark-gray)" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-warm-gray)] px-3 py-2.5 text-sm outline-none"
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
            className="flex-1 rounded-xl text-white text-sm font-semibold py-3 disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </form>
    </div>
  );
}
