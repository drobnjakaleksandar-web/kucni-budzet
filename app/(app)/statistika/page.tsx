import { PieChart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getCurrentHousehold } from "@/lib/get-household";

const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];

export default async function StatistikaPage() {
  const { supabase, householdId } = await getCurrentHousehold();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);

  const { data: rows } = await supabase
    .from("transactions")
    .select("type, amount, occurred_on")
    .eq("household_id", householdId)
    .gte("occurred_on", sixMonthsAgo);

  const byMonth: { key: string; label: string; income: number; expenses: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    byMonth.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: shortMonthNames[d.getMonth()], income: 0, expenses: 0 });
  }
  const byKey = Object.fromEntries(byMonth.map((m) => [m.key, m]));

  (rows ?? []).forEach((t) => {
    const d = new Date(t.occurred_on);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey[key];
    if (!bucket) return;
    if (t.type === "priliv") bucket.income += Number(t.amount);
    else bucket.expenses += Number(t.amount);
  });

  const max = Math.max(...byMonth.flatMap((m) => [m.income, m.expenses]), 1);

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Statistika <PieChart size={18} className="text-[var(--color-dark-navy)]" />
        </h1>
      </header>

      <section className="px-5 mt-3">
        <div className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4">
          <p className="text-xs font-semibold text-[var(--color-dark-gray)] mb-4">
            Pregled Prihodi vs Rashodi (6 meseci)
          </p>
          {max <= 1 ? (
            <p className="text-sm text-[var(--color-dark-gray)] text-center py-10">
              Još nema podataka za prikaz. Dodaj par transakcija pa se graf popunjava.
            </p>
          ) : (
            <>
              <div className="flex items-end justify-between gap-2" style={{ height: 144 }}>
                {byMonth.map((m) => (
                  <div key={m.key} className="flex-1 flex items-end justify-center gap-1">
                    <div
                      className="w-2.5 rounded-t-sm bg-[var(--color-teal)]"
                      style={{ height: Math.max(2, Math.round((m.income / max) * 140)) }}
                    />
                    <div
                      className="w-2.5 rounded-t-sm bg-[var(--color-coral)]"
                      style={{ height: Math.max(2, Math.round((m.expenses / max) * 140)) }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {byMonth.map((m) => (
                  <span key={m.key} className="text-[10px] text-[var(--color-medium-gray)] flex-1 text-center">
                    {m.label}
                  </span>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-4 mt-4 pt-3 border-t border-[var(--color-warm-gray)]">
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-dark-gray)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]" /> Prihodi
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-dark-gray)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-coral)]" /> Rashodi
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h2 className="text-sm font-bold text-[var(--color-dark-navy)] mb-2">Istorija po mesecima</h2>
        <div className="flex flex-col gap-2.5">
          {[...byMonth].reverse().map((m) => (
            <div
              key={m.key}
              className="w-full bg-white rounded-2xl border border-[var(--color-warm-gray)] px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-dark-navy)]">{m.label}</p>
                <p className="text-[11px] text-[var(--color-dark-gray)]">
                  Prihodi: {(m.income / 1000).toFixed(0)}k | Rashodi: {(m.expenses / 1000).toFixed(0)}k
                </p>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: m.income - m.expenses >= 0 ? "#115E59" : "#D94E34" }}
              >
                {m.income - m.expenses >= 0 ? "+" : ""}
                {(m.income - m.expenses).toLocaleString("sr-RS")} RSD
              </span>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
