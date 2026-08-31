"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DeleteTransaction({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    setLoading(false);
    if (!error) router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[10px] font-semibold text-white bg-[var(--color-dark-red)] rounded-full px-2 py-1"
        >
          Obriši
        </button>
        <button onClick={() => setConfirming(false)} className="text-[10px] text-[var(--color-medium-gray)]">
          Ne
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-[var(--color-medium-gray)] p-1" aria-label="Obriši">
      <Trash2 size={13} />
    </button>
  );
}
