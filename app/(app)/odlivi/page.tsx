import { Plus, TrendingDown, Repeat, Clock, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import TransactionItem, { TxDisplay } from "@/components/TransactionItem";
import PayRecurringExpense from "@/components/PayRecurringExpense";
import ConvertToDebt from "@/components/ConvertToDebt";
import { getCurrentHousehold } from "@/lib/get-household";
import { formatRSD } from "@/lib/mock-data";

const monthNames = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];

const categoryColors: Record<string, string> = {
  Namirnice: "#115E59",
  Transport: "#5850EC",
  Fiksni: "#D4836A",
  Zabava: "#D45D5D",
  Zdravlje: "#D94E34",
  Razno: "#878E99",
  "Sitni troškovi": "#878E99",
  Garderoba: "#D94E34",
  "Duguju nam": "#5850EC",
  "Prebačeno u štednju": "#D4836A",
  "Otplata duga": "#5850EC",
};

export default async function OdliviPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { supabase, householdId, user, displayName } = await getCurrentHousehold();
  const params = await searchParams;
  const offset = Math.min(0, Number(params.m ?? 0) || 0);

  const now = new Date();
  const viewedDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const monthStart = viewedDate.toISOString().slice(0, 10);
  const monthEnd = new Date(viewedDate.getFullYear(), viewedDate.getMonth() + 1, 1).toISOString().slice(0, 10);
  const monthLabel = `${monthNames[viewedDate.getMonth()]} ${viewedDate.getFullYear()}`;
  const isCurrentMonth = offset === 0;

  const today = now.getDate();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [{ data: rows }, { data: recurringRows }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .eq("type", "odliv")
      .gte("occurred_on", monthStart)
      .lt("occurred_on", monthEnd)
      .order("occurred_on", { ascending: false }),
    supabase
      .from("recurring_expenses")
      .select("*")
      .eq("household_id", householdId)
      .order("due_day", { ascending: true, nullsFirst: false }),
    supabase.from("recurring_payments").select("*").eq("household_id", householdId).eq("period", period),
  ]);

  const expenses = rows ?? [];
  const total = expenses.reduce((s, t) => s + Number(t.amount), 0);

  // Pregled po kategorijama za prikazani mesec
  const byCategory = new Map<string, { total: number; count: number }>();
  expenses.forEach((tx) => {
    const entry = byCategory.get(tx.category) ?? { total: 0, count: 0 };
    entry.total += Number(tx.amount);
    entry.count += 1;
    byCategory.set(tx.category, entry);
  });
  const categorySummary = Array.from(byCategory.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);

  // Grupisanje liste po kategoriji (za sazimanje sitnih stavki)
  const grouped = new Map<string, typeof expenses>();
  expenses.forEach((tx) => {
    const arr = grouped.get(tx.category) ?? [];
    arr.push(tx);
    grouped.set(tx.category, arr);
  });
  const groupedList = Array.from(grouped.entries()).sort(
    (a, b) => b[1].reduce((s, t) => s + Number(t.amount), 0) - a[1].reduce((s, t) => s + Number(t.amount), 0)
  );

  const recurring = recurringRows ?? [];
  const paidByExpense = new Map((paymentRows ?? []).map((p) => [p.recurring_expense_id, p]));

  const dueForPayment = isCurrentMonth
    ? recurring.filter((e) => !paidByExpense.has(e.id) && (e.due_day === null || e.due_day <= today))
    : [];
  const upcoming = isCurrentMonth
    ? recurring.filter((e) => !paidByExpense.has(e.id) && e.due_day !== null && e.due_day > today)
    : [];

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Odlivi <TrendingDown size={18} className="text-[var(--color-coral)]" />
        </h1>
        <span className="text-sm font-bold text-[var(--color-dark-red)] bg-[var(--color-dark-red)]/10 rounded-full px-3 py-1.5">
          {formatRSD(-total)}
        </span>
      </header>

      <div className="px-5 mt-2 flex items-center justify-between">
        <Link
          href={`/odlivi?m=${offset - 1}`}
          className="w-8 h-8 rounded-full bg-white border border-[var(--color-warm-gray)] flex items-center justify-center"
        >
          <ChevronLeft size={16} className="text-[var(--color-dark-navy)]" />
        </Link>
        <span className="text-sm font-bold text-[var(--color-dark-navy)]">{monthLabel}</span>
        {isCurrentMonth ? (
          <span className="w-8 h-8" />
        ) : (
          <Link
            href={`/odlivi?m=${offset + 1}`}
            className="w-8 h-8 rounded-full bg-white border border-[var(--color-warm-gray)] flex items-center justify-center"
          >
            <ChevronRight size={16} className="text-[var(--color-dark-navy)]" />
          </Link>
        )}
      </div>

      {dueForPayment.length > 0 && (
        <section className="px-5 mt-3">
          <p className="text-xs font-bold text-[var(--color-dark-navy)] mb-2 flex items-center gap-1.5">
            <Repeat size={13} className="text-[var(--color-coral)]" /> Za plaćanje
          </p>
          <div className="flex flex-col gap-2 mb-1">
            {dueForPayment.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl border border-[var(--color-coral)]/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-dark-navy)]">{exp.name}</p>
                    <p className="text-[11px] text-[var(--color-dark-gray)]">
                      {exp.due_day ? `Dospeva ${exp.due_day}. u mesecu` : "Bez fiksnog datuma"}
                      {exp.is_variable && " · unesi tačan iznos"}
                    </p>
                  </div>
                  <PayRecurringExpense
                    expenseId={exp.id}
                    expenseName={exp.name}
                    defaultAmount={Number(exp.default_amount)}
                    isVariable={exp.is_variable}
                    period={period}
                    householdId={householdId}
                    userId={user.id}
                    displayName={displayName}
                  />
                </div>
                <div className="mt-1.5">
                  <ConvertToDebt
                    expenseId={exp.id}
                    expenseName={exp.name}
                    amount={Number(exp.default_amount)}
                    period={period}
                    householdId={householdId}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="px-5 mt-3">
          <p className="text-xs font-bold text-[var(--color-dark-gray)] mb-2 flex items-center gap-1.5">
            <Clock size={13} /> Uskoro dospeva
          </p>
          <div className="flex flex-col gap-2">
            {upcoming.map((exp) => (
              <div key={exp.id} className="bg-[var(--color-off-white)] rounded-2xl border border-dashed border-[var(--color-warm-gray)] px-4 py-2.5 flex items-center justify-between">
                <p className="text-sm text-[var(--color-dark-gray)]">{exp.name}</p>
                <p className="text-[11px] text-[var(--color-medium-gray)]">{exp.due_day}. u mesecu</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="px-5 mt-4">
        <Link href="/fiksni" className="text-xs font-semibold text-[var(--color-coral)]">
          Upravljaj fiksnim troškovima →
        </Link>
      </div>

      {categorySummary.length > 0 && (
        <section className="px-5 mt-4">
          <p className="text-xs font-bold text-[var(--color-dark-navy)] mb-2">Po kategorijama — {monthLabel}</p>
          <div className="grid grid-cols-2 gap-2">
            {categorySummary.map((c) => (
              <div key={c.category} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] px-3.5 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColors[c.category] ?? "#878E99" }}
                  />
                  <span className="text-[11px] font-semibold text-[var(--color-dark-gray)] truncate">{c.category}</span>
                </div>
                <p className="text-sm font-bold text-[var(--color-dark-navy)]">{c.total.toLocaleString("sr-RS")} RSD</p>
                <p className="text-[10px] text-[var(--color-medium-gray)]">{c.count} {c.count === 1 ? "stavka" : "stavki"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 mt-5">
        <p className="text-xs font-bold text-[var(--color-dark-navy)] mb-2">Sve transakcije</p>
        {expenses.length === 0 && (
          <p className="text-sm text-[var(--color-dark-gray)] text-center py-10">
            Nema troškova u ovom mesecu.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {groupedList.map(([category, txs]) => {
            const categoryTotal = txs.reduce((s, t) => s + Number(t.amount), 0);
            // Mala kategorija (1-2 stavke) - prikazi direktno bez sazimanja
            if (txs.length <= 2) {
              return (
                <div key={category} className="flex flex-col gap-2">
                  {txs.map((tx) => {
                    const display: TxDisplay = {
                      id: tx.id,
                      type: "odliv",
                      category: tx.category,
                      title: tx.title,
                      amount: Number(tx.amount),
                      date: tx.occurred_on,
                      person: tx.person_name,
                    };
                    return <TransactionItem key={tx.id} tx={display} />;
                  })}
                </div>
              );
            }

            return (
              <details key={category} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColors[category] ?? "#878E99" }}
                    />
                    <span className="text-sm font-semibold text-[var(--color-dark-navy)]">{category}</span>
                    <span className="text-[11px] text-[var(--color-medium-gray)]">({txs.length})</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-dark-red)]">
                      {formatRSD(-categoryTotal)}
                    </span>
                    <ChevronDown size={15} className="text-[var(--color-medium-gray)] transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="px-3 pb-3 flex flex-col gap-2">
                  {txs.map((tx) => {
                    const display: TxDisplay = {
                      id: tx.id,
                      type: "odliv",
                      category: tx.category,
                      title: tx.title,
                      amount: Number(tx.amount),
                      date: tx.occurred_on,
                      person: tx.person_name,
                    };
                    return <TransactionItem key={tx.id} tx={display} />;
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {isCurrentMonth && (
        <Link
          href="/odlivi/dodaj"
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[var(--color-coral)] flex items-center justify-center shadow-lg z-40"
        >
          <Plus size={22} className="text-white" />
        </Link>
      )}

      <BottomNav />
    </div>
  );
}
