import { HandCoins, Info, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";
import AddDebtPayment from "@/components/AddDebtPayment";
import AddDebt from "@/components/AddDebt";
import EditDebt from "@/components/EditDebt";
import DeleteDebt from "@/components/DeleteDebt";
import { getCurrentHousehold } from "@/lib/get-household";
import { formatRSD } from "@/lib/mock-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sr-RS", { day: "2-digit", month: "short", year: "numeric" });
}

function isDueSoon(iso: string | null) {
  if (!iso) return false;
  const due = new Date(iso);
  const now = new Date();
  const diffDays = (due.getTime() - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

type Debt = {
  id: string;
  name: string;
  direction: "duguju" | "duguju_nam";
  total_amount: number;
  paid_amount: number;
  next_due_date: string | null;
  linked_to_expenses: boolean;
};

export default async function DugoviPage() {
  const { supabase, householdId, user, displayName } = await getCurrentHousehold();

  const { data: rows } = await supabase
    .from("debts")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  const debts = (rows ?? []) as Debt[];
  const weOwe = debts.filter((d) => d.direction === "duguju");
  const owedToUs = debts.filter((d) => d.direction === "duguju_nam");
  const totalOwe = weOwe.reduce((s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)), 0);
  const totalOwed = owedToUs.reduce((s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)), 0);

  const dueSoonCount = debts.filter(
    (d) => Number(d.paid_amount) < Number(d.total_amount) && isDueSoon(d.next_due_date)
  ).length;

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] flex items-center gap-1.5">
          Dugovi <HandCoins size={18} className="text-[var(--color-indigo)]" />
        </h1>
        <p className="text-xs text-[var(--color-dark-gray)] mt-0.5">Upravljaj starim dugovima</p>
      </header>

      <div className="px-5 mt-3">
        {dueSoonCount > 0 && (
          <div className="flex items-center gap-2 bg-[var(--color-red)]/10 text-[var(--color-dark-red)] text-xs font-semibold rounded-xl px-3 py-2.5 mb-3">
            <AlertTriangle size={14} />
            {dueSoonCount === 1 ? "1 rata dospeva" : `${dueSoonCount} rate dospevaju`} u narednih 7 dana
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 mb-5">
          <p className="text-xs text-[var(--color-dark-gray)]">Neto stanje dugova</p>
          <p
            className="font-[family-name:var(--font-display)] font-extrabold text-2xl mt-1"
            style={{ color: totalOwe - totalOwed <= 0 ? "#115E59" : "#D94E34" }}
          >
            {formatRSD(-(totalOwe - totalOwed))}
          </p>
          <div className="flex justify-between mt-3">
            <div>
              <p className="text-[11px] text-[var(--color-dark-gray)]">Ukupno dugujemo</p>
              <p className="text-sm font-bold text-[var(--color-dark-navy)]">{totalOwe.toLocaleString("sr-RS")} RSD</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[var(--color-dark-gray)]">Ukupno nam duguju</p>
              <p className="text-sm font-bold text-[var(--color-dark-navy)]">{totalOwed.toLocaleString("sr-RS")} RSD</p>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-bold text-[var(--color-dark-navy)] mb-2">
          Naši dugovi (Dugujemo) <span className="text-[var(--color-medium-gray)] font-normal">· {weOwe.length}</span>
        </h2>
        <div className="flex flex-col gap-2.5 mb-5">
          {weOwe.length === 0 && <p className="text-xs text-[var(--color-dark-gray)]">Nema unetih dugova.</p>}
          {weOwe.map((d) => (
            <DebtCard
              key={d.id}
              debt={d}
              actionLabel="Uplati"
              actionColor="var(--color-indigo)"
              householdId={householdId}
              userId={user.id}
              displayName={displayName}
            />
          ))}
        </div>

        <h2 className="text-sm font-bold text-[var(--color-dark-navy)] mb-2">
          Duguju nam <span className="text-[var(--color-medium-gray)] font-normal">· {owedToUs.length}</span>
        </h2>
        <div className="flex flex-col gap-2.5 mb-4">
          {owedToUs.length === 0 && <p className="text-xs text-[var(--color-dark-gray)]">Niko nam ne duguje.</p>}
          {owedToUs.map((d) => (
            <DebtCard
              key={d.id}
              debt={d}
              actionLabel="Naplati"
              actionColor="var(--color-teal)"
              householdId={householdId}
              userId={user.id}
              displayName={displayName}
            />
          ))}
        </div>

        <AddDebt householdId={householdId} />

        <div className="flex items-start gap-2 text-[11px] text-[var(--color-dark-gray)] bg-[var(--color-warm-gray)]/50 rounded-xl px-3 py-2.5 mt-4">
          <Info size={14} className="shrink-0 mt-0.5" />
          Svaka uplata/naplata duga se automatski beleži kao stavka u Odlivima ili Prilivima.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function DebtCard({
  debt,
  actionLabel,
  actionColor,
  householdId,
  userId,
  displayName,
}: {
  debt: Debt;
  actionLabel: string;
  actionColor: string;
  householdId: string;
  userId: string;
  displayName: string;
}) {
  const total = Number(debt.total_amount);
  const paid = Number(debt.paid_amount);
  const pct = Math.round((paid / total) * 100);
  const dueSoon = isDueSoon(debt.next_due_date) && paid < total;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 relative">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-semibold text-[var(--color-dark-navy)] pr-2">{debt.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <AddDebtPayment
            debtId={debt.id}
            debtName={debt.name}
            direction={debt.direction}
            paidAmount={paid}
            totalAmount={total}
            actionLabel={actionLabel}
            actionColor={actionColor}
            householdId={householdId}
            userId={userId}
            displayName={displayName}
          />
          <EditDebt
            debtId={debt.id}
            initialName={debt.name}
            initialTotal={total}
            initialPaid={paid}
            initialDueDate={debt.next_due_date}
          />
          <DeleteDebt debtId={debt.id} />
        </div>
      </div>
      {debt.next_due_date ? (
        <p className={`text-[11px] mb-2 ${dueSoon ? "text-[var(--color-dark-red)] font-semibold" : "text-[var(--color-dark-gray)]"}`}>
          Sledeća rata: {formatDate(debt.next_due_date)} {dueSoon && "· uskoro dospeva"}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--color-medium-gray)] mb-2">Bez fiksnog datuma otplate</p>
      )}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[var(--color-dark-gray)]">Otplaćeno {pct}%</span>
        <span className="text-xs font-semibold text-[var(--color-dark-gray)]">
          {paid.toLocaleString("sr-RS")} / {total.toLocaleString("sr-RS")}
        </span>
      </div>
      <ProgressBar value={paid} max={total} color={actionColor} />
    </div>
  );
}
