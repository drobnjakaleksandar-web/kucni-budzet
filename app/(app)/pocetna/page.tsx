import { Plus, Trophy, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";
import TransactionItem, { TxDisplay } from "@/components/TransactionItem";
import { getCurrentHousehold } from "@/lib/get-household";
import { formatRSD } from "@/lib/mock-data";

const monthNames = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { supabase, householdId, displayName } = await getCurrentHousehold();
  const params = await searchParams;
  const offset = Math.min(0, Number(params.m ?? 0) || 0); // ne dozvoljavamo buducnost

  const now = new Date();
  const viewedDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const monthStart = viewedDate.toISOString().slice(0, 10);
  const monthEndDate = new Date(viewedDate.getFullYear(), viewedDate.getMonth() + 1, 1);
  const monthEnd = monthEndDate.toISOString().slice(0, 10);
  const monthLabel = `${monthNames[viewedDate.getMonth()]} ${viewedDate.getFullYear()}`;
  const isCurrentMonth = offset === 0;

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);

  const [{ data: txRows }, { data: goalRows }, { data: trendRows }, { data: allTimeRows }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .gte("occurred_on", monthStart)
      .lt("occurred_on", monthEnd)
      .order("occurred_on", { ascending: false }),
    supabase.from("savings_goals").select("*").eq("household_id", householdId).order("created_at", { ascending: true }).limit(3),
    supabase
      .from("transactions")
      .select("type, amount, occurred_on")
      .eq("household_id", householdId)
      .gte("occurred_on", sixMonthsAgo),
    supabase.from("transactions").select("type, amount").eq("household_id", householdId),
  ]);

  const transactions = txRows ?? [];
  const income = transactions.filter((t) => t.type === "priliv").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter((t) => t.type === "odliv").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;

  // Stvarno, kumulativno stanje - sve od pocetka, nezavisno od pregledanog meseca
  const realBalance = (allTimeRows ?? []).reduce(
    (s, t) => s + (t.type === "priliv" ? Number(t.amount) : -Number(t.amount)),
    0
  );

  const goals = goalRows ?? [];

  // Trend poslednjih 6 meseci (uvek od "sada", ne od pregledanog meseca)

  const trendByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendByMonth[`${d.getFullYear()}-${d.getMonth()}`] = 0;
  }
  (trendRows ?? []).forEach((t) => {
    const d = new Date(t.occurred_on);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in trendByMonth) {
      trendByMonth[key] += t.type === "priliv" ? Number(t.amount) : -Number(t.amount);
    }
  });
  const trendValues = Object.values(trendByMonth);

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)]">
            Zdravo, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-[var(--color-dark-gray)] mt-0.5">Vaš zajednički budžet</p>
        </div>
        <Link
          href="/podesavanja"
          className="w-9 h-9 rounded-full bg-white border border-[var(--color-warm-gray)] flex items-center justify-center shrink-0"
          aria-label="Podešavanja"
        >
          <Settings size={16} className="text-[var(--color-dark-navy)]" />
        </Link>
      </header>

      <section className="px-5 mt-3">
        <div className="bg-[var(--color-dark-navy)] rounded-3xl p-5">
          <p className="text-xs text-white/60">Trenutno stanje</p>
          <p
            className="font-[family-name:var(--font-display)] font-extrabold text-3xl mt-1"
            style={{ color: realBalance >= 0 ? "#5EEAD4" : "#FCA5A5" }}
          >
            {formatRSD(realBalance)}
          </p>
          <p className="text-[11px] text-white/50 mt-1">Sve od početka, nezavisno od meseca ispod</p>
        </div>
      </section>

      <div className="px-5 mt-3 flex items-center justify-between">
        <Link
          href={`/pocetna?m=${offset - 1}`}
          className="w-8 h-8 rounded-full bg-white border border-[var(--color-warm-gray)] flex items-center justify-center"
        >
          <ChevronLeft size={16} className="text-[var(--color-dark-navy)]" />
        </Link>
        <span className="text-sm font-bold text-[var(--color-dark-navy)]">{monthLabel}</span>
        {isCurrentMonth ? (
          <span className="w-8 h-8" />
        ) : (
          <Link
            href={`/pocetna?m=${offset + 1}`}
            className="w-8 h-8 rounded-full bg-white border border-[var(--color-warm-gray)] flex items-center justify-center"
          >
            <ChevronRight size={16} className="text-[var(--color-dark-navy)]" />
          </Link>
        )}
      </div>

      <section className="px-5 mt-3">
        <div className="bg-white rounded-3xl border border-[var(--color-warm-gray)] p-5">
          <p className="text-xs text-[var(--color-dark-gray)]">
            {isCurrentMonth ? "Bilans ovog meseca" : "Bilans tog meseca"}
          </p>
          <p
            className="font-[family-name:var(--font-display)] font-extrabold text-3xl mt-1"
            style={{ color: balance >= 0 ? "#115E59" : "#D94E34" }}
          >
            {formatRSD(balance)}
          </p>

          <div className="flex justify-between mt-4">
            <div>
              <p className="text-[11px] text-[var(--color-dark-gray)]">Prihodi (+)</p>
              <p className="text-sm font-bold text-[var(--color-dark-navy)]">{income.toLocaleString("sr-RS")} RSD</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[var(--color-dark-gray)]">Rashodi (-)</p>
              <p className="text-sm font-bold text-[var(--color-dark-navy)]">{expenses.toLocaleString("sr-RS")} RSD</p>
            </div>
          </div>

          {isCurrentMonth && (
            <div className="mt-4 pt-4 border-t border-[var(--color-warm-gray)]">
              <p className="text-[11px] text-[var(--color-dark-gray)] mb-2">Trend kretanja bilansa (6 meseci)</p>
              <MiniTrend values={trendValues} />
            </div>
          )}
        </div>
      </section>

      {isCurrentMonth ? (
        <section className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-dark-navy)] flex items-center gap-1.5">
              Štedne korpe <Trophy size={15} className="text-[var(--color-coral)]" />
            </h2>
            <Link href="/stednja" className="text-xs font-semibold text-[var(--color-teal)]">
              Prikaži sve
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {goals.length === 0 && (
              <p className="text-sm text-[var(--color-dark-gray)] bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 text-center">
                Nemaš još štednih korpi.
              </p>
            )}
            {goals.map((goal) => {
              const current = Number(goal.current_amount);
              const target = Number(goal.target_amount);
              return (
                <div key={goal.id} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[var(--color-dark-navy)]">{goal.name}</span>
                    <span className="text-xs font-bold text-[var(--color-coral)]">
                      {goal.status === "completed" ? "Kompletirano" : `${Math.round((current / target) * 100)}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[var(--color-dark-gray)]">Napredak</span>
                    <span className="text-xs font-semibold text-[var(--color-dark-gray)]">
                      {current.toLocaleString("sr-RS")} / {target.toLocaleString("sr-RS")}
                    </span>
                  </div>
                  <ProgressBar value={current} max={target} color={goal.status === "completed" ? "#115E59" : "#D45D5D"} />
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="px-5 mt-6">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-dark-navy)] mb-3">
            Transakcije — {monthLabel}
          </h2>
          <div className="flex flex-col gap-2.5">
            {transactions.length === 0 && (
              <p className="text-sm text-[var(--color-dark-gray)] text-center py-6">Nema transakcija u tom mesecu.</p>
            )}
            {transactions.map((tx) => {
              const display: TxDisplay = {
                id: tx.id,
                type: tx.type,
                category: tx.category,
                title: tx.title,
                amount: Number(tx.amount),
                date: tx.occurred_on,
                person: tx.person_name,
              };
              return <TransactionItem key={tx.id} tx={display} />;
            })}
          </div>
        </section>
      )}

      {isCurrentMonth && (
        <Link
          href="/odlivi/dodaj"
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[var(--color-dark-navy)] flex items-center justify-center shadow-lg z-40"
        >
          <Plus size={22} className="text-white" />
        </Link>
      )}

      <BottomNav />
    </div>
  );
}

function MiniTrend({ values }: { values: number[] }) {
  const max = Math.max(...values.map((v) => Math.abs(v)), 1);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 16 - (v / max) * 14;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#115E59" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
