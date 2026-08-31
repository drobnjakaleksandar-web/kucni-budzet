import { Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import TransactionItem, { TxDisplay } from "@/components/TransactionItem";
import { getCurrentHousehold } from "@/lib/get-household";
import { formatRSD } from "@/lib/mock-data";

export default async function PriliviPage() {
  const { supabase, householdId } = await getCurrentHousehold();

  const { data: rows } = await supabase
    .from("transactions")
    .select("*")
    .eq("household_id", householdId)
    .eq("type", "priliv")
    .order("occurred_on", { ascending: false });

  const income = rows ?? [];
  const total = income.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Prilivi <TrendingUp size={18} className="text-[var(--color-teal)]" />
        </h1>
        <span className="text-sm font-bold text-[var(--color-teal)] bg-[var(--color-teal)]/10 rounded-full px-3 py-1.5">
          {formatRSD(total)}
        </span>
      </header>

      <div className="px-5 mt-4 flex flex-col gap-2.5">
        {income.length === 0 && (
          <p className="text-sm text-[var(--color-dark-gray)] text-center py-10">
            Još nema unetih priliva. Dodaj prvi klikom na dugme ispod.
          </p>
        )}
        {income.map((tx) => {
          const display: TxDisplay = {
            id: tx.id,
            type: "priliv",
            category: tx.category,
            title: tx.title,
            amount: Number(tx.amount),
            date: tx.occurred_on,
            person: tx.person_name,
          };
          return <TransactionItem key={tx.id} tx={display} />;
        })}
      </div>

      <Link
        href="/prilivi/dodaj"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[var(--color-teal)] flex items-center justify-center shadow-lg z-40"
      >
        <Plus size={22} className="text-white" />
      </Link>

      <BottomNav />
    </div>
  );
}
