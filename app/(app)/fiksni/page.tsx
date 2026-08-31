import Link from "next/link";
import { ArrowLeft, CheckCircle2, Repeat } from "lucide-react";
import { getCurrentHousehold } from "@/lib/get-household";
import AddRecurringExpense from "@/components/AddRecurringExpense";
import PayRecurringExpense from "@/components/PayRecurringExpense";
import EditRecurringExpense from "@/components/EditRecurringExpense";
import DeleteRecurringExpense from "@/components/DeleteRecurringExpense";
import BottomNav from "@/components/BottomNav";

export default async function FiksniPage() {
  const { supabase, householdId, user, displayName } = await getCurrentHousehold();

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const { data: expenseRows } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("household_id", householdId)
    .order("due_day", { ascending: true, nullsFirst: false });

  const { data: paymentRows } = await supabase
    .from("recurring_payments")
    .select("*")
    .eq("household_id", householdId)
    .eq("period", period);

  const expenses = expenseRows ?? [];
  const paymentsByExpense = new Map((paymentRows ?? []).map((p) => [p.recurring_expense_id, p]));

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2">
        <Link href="/odlivi" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-dark-gray)] mb-3">
          <ArrowLeft size={14} /> Nazad na Odlive
        </Link>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Fiksni troškovi <Repeat size={17} className="text-[var(--color-coral)]" />
        </h1>
        <p className="text-xs text-[var(--color-dark-gray)] mt-0.5">
          Pretplate i redovni računi — plaćanje se automatski beleži kao odliv.
        </p>
      </header>

      <section className="px-5 mt-4 flex flex-col gap-2.5">
        {expenses.length === 0 && (
          <p className="text-sm text-[var(--color-dark-gray)] text-center py-6">
            Nema još fiksnih troškova. Dodaj Netflix, struju, telefon...
          </p>
        )}

        {expenses.map((exp) => {
          const payment = paymentsByExpense.get(exp.id);
          const paid = Boolean(payment);

          return (
            <div key={exp.id} className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-dark-navy)]">{exp.name}</p>
                  <p className="text-[11px] text-[var(--color-dark-gray)] mt-0.5">
                    {exp.due_day ? `Dospeva ${exp.due_day}. u mesecu` : "Bez fiksnog datuma"}
                    {exp.is_variable && " · iznos varira"}
                    {!exp.is_variable && ` · ${Number(exp.default_amount).toLocaleString("sr-RS")} RSD`}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {paid ? (
                    payment!.transaction_id ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-teal)] bg-[var(--color-teal)]/10 rounded-full px-3 py-1.5">
                        <CheckCircle2 size={13} /> {Number(payment!.amount).toLocaleString("sr-RS")} RSD
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[var(--color-indigo)] bg-[var(--color-indigo)]/10 rounded-full px-3 py-1.5">
                        Prebačeno u dug
                      </span>
                    )
                  ) : (
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
                  )}
                  <EditRecurringExpense
                    expenseId={exp.id}
                    initialName={exp.name}
                    initialAmount={Number(exp.default_amount)}
                    initialDueDay={exp.due_day}
                    initialIsVariable={exp.is_variable}
                  />
                  <DeleteRecurringExpense expenseId={exp.id} />
                </div>
              </div>
            </div>
          );
        })}

        <AddRecurringExpense householdId={householdId} />
      </section>

      <BottomNav />
    </div>
  );
}
