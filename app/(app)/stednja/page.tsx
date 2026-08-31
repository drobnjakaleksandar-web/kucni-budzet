import { PiggyBank, CheckCircle2, XCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";
import SavingsTransfer from "@/components/SavingsTransfer";
import AddSavingsGoal from "@/components/AddSavingsGoal";
import { getCurrentHousehold } from "@/lib/get-household";

export default async function StednjaPage() {
  const { supabase, householdId, user, displayName } = await getCurrentHousehold();

  const { data: rows } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  const goals = rows ?? [];
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Štednja <PiggyBank size={18} className="text-[var(--color-coral)]" />
        </h1>
      </header>

      <section className="flex flex-col items-center mt-4 mb-6">
        <div className="w-28 h-28 rounded-full bg-[var(--color-coral)]/10 flex items-center justify-center mb-3">
          <PiggyBank size={48} className="text-[var(--color-coral)]" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-[var(--color-dark-gray)]">Ukupno ušteđeno</p>
        <p className="font-[family-name:var(--font-display)] font-extrabold text-3xl text-[var(--color-dark-navy)]">
          {totalSaved.toLocaleString("sr-RS")} RSD
        </p>
      </section>

      <section className="px-5 flex flex-col gap-3">
        {goals.length === 0 && (
          <p className="text-sm text-[var(--color-dark-gray)] text-center py-6">
            Još nema štednih korpi. Napravi prvu ispod.
          </p>
        )}
        {goals.map((goal) => {
          const current = Number(goal.current_amount);
          const target = Number(goal.target_amount);
          return (
            <div key={goal.id} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--color-dark-navy)] flex items-center gap-1.5">
                  {goal.status === "completed" ? (
                    <CheckCircle2 size={15} className="text-[var(--color-teal)]" />
                  ) : (
                    <XCircle size={15} className="text-[var(--color-red)]" />
                  )}
                  {goal.name}
                </span>
                <SavingsTransfer
                  goalId={goal.id}
                  goalName={goal.name}
                  currentAmount={current}
                  targetAmount={target}
                  householdId={householdId}
                  userId={user.id}
                  displayName={displayName}
                />
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

        <AddSavingsGoal householdId={householdId} />
      </section>

      <BottomNav />
    </div>
  );
}
