"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { categoriesByType } from "@/lib/categories";

export default function AddTransactionForm({
  type,
  householdId,
  displayName,
  userId,
}: {
  type: "priliv" | "odliv";
  householdId: string;
  displayName: string;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const categories = categoriesByType[type];
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accentColor = type === "priliv" ? "var(--color-teal)" : "var(--color-coral)";
  const backHref = type === "priliv" ? "/prilivi" : "/odlivi";
  const isLending = type === "odliv" && category === "Duguju nam";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!title.trim() || !numericAmount || numericAmount <= 0) {
      setError("Popuni naziv i validan iznos.");
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from("transactions").insert({
      household_id: householdId,
      user_id: userId,
      type,
      category,
      title: title.trim(),
      amount: numericAmount,
      occurred_on: date,
      note: note.trim() || null,
      person_name: displayName,
    });

    if (insertError) {
      setLoading(false);
      setError("Greška pri čuvanju. Pokušaj ponovo.");
      return;
    }

    // Ako je pozajmica - automatski napravi i dug (Duguju nam) da se moze pratiti/naplatiti
    if (isLending) {
      await supabase.from("debts").insert({
        household_id: householdId,
        name: title.trim(),
        direction: "duguju_nam",
        total_amount: numericAmount,
        paid_amount: 0,
      });
    }

    setLoading(false);
    router.push(backHref);
    router.refresh();
  }

  return (
    <div className="pb-10 px-5 pt-6">
      <button
        onClick={() => router.push(backHref)}
        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-dark-gray)] mb-5"
      >
        <ArrowLeft size={16} /> Nazad
      </button>

      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] mb-6">
        Novi {type === "priliv" ? "priliv" : "odliv"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">Kategorija</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className="text-xs font-semibold rounded-full px-4 py-2 border"
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
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">Naziv</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isLending ? "npr. Pozajmica — Petar" : type === "priliv" ? "npr. Plata — avgust" : "npr. Namirnice — Maxi"}
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">Iznos (RSD)</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-2xl font-bold outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">
            Napomena (opciono)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dodatni detalj..."
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--color-dark-red)] bg-[var(--color-dark-red)]/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {isLending && (
          <p className="text-xs text-[var(--color-indigo)] bg-[var(--color-indigo)]/10 rounded-lg px-3 py-2">
            Ovo se odbija iz budžeta kao odliv i automatski se pojavljuje kao dug u sekciji Dugovi ("Duguju nam").
            Kad ti vrate novac, u Dugovima klikneš "Naplati" i to se upisuje kao priliv.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl text-white font-semibold text-sm py-3.5 disabled:opacity-60"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? "Čuvanje..." : "Sačuvaj"}
        </button>
      </form>
    </div>
  );
}
