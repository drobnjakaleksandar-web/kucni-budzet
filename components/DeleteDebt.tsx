"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DeleteDebt({ debtId }: { debtId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase.from("debts").delete().eq("id", debtId);
    setLoading(false);
    if (!error) {
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[var(--color-medium-gray)] p-1"
        aria-label="Obriši dug"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  return (
    <div className="absolute right-4 top-11 z-10 bg-white border border-[var(--color-warm-gray)] rounded-xl shadow-lg p-3 w-52">
      <p className="text-xs font-semibold text-[var(--color-dark-navy)] mb-2">Zašto brišeš ovaj dug?</p>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-left text-xs rounded-lg px-2.5 py-2 bg-[var(--color-off-white)] text-[var(--color-dark-navy)]"
        >
          Oprošteno
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-left text-xs rounded-lg px-2.5 py-2 bg-[var(--color-off-white)] text-[var(--color-dark-navy)]"
        >
          Otplaćeno drugom uslugom
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-left text-xs rounded-lg px-2.5 py-2 bg-[var(--color-off-white)] text-[var(--color-dark-navy)]"
        >
          Greškom dodato
        </button>
      </div>
      <button onClick={() => setOpen(false)} className="text-[10px] text-[var(--color-medium-gray)] mt-2">
        Otkaži
      </button>
    </div>
  );
}
