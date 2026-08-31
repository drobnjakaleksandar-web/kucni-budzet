import { ShoppingCart, Fuel, Building2, Coffee, Landmark, Briefcase, Receipt, PiggyBank, HandCoins, ShoppingBag, Shirt, HeartPulse, Package } from "lucide-react";
import { formatRSD } from "@/lib/mock-data";
import EditTransaction from "./EditTransaction";
import DeleteTransaction from "./DeleteTransaction";

const iconMap: Record<string, React.ElementType> = {
  Plata: Landmark,
  Honorar: Briefcase,
  Vanredno: Receipt,
  Namirnice: ShoppingCart,
  Transport: Fuel,
  Fiksni: Building2,
  Zabava: Coffee,
  Zdravlje: HeartPulse,
  Razno: Package,
  "Sitni troškovi": ShoppingBag,
  Garderoba: Shirt,
  "Duguju nam": HandCoins,
  "Prebačeno u štednju": PiggyBank,
  "Vraćeno iz štednje": PiggyBank,
  "Otplata duga": HandCoins,
  "Naplata duga": HandCoins,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sr-RS", { day: "2-digit", month: "long" });
}

export interface TxDisplay {
  id: string;
  type: "priliv" | "odliv";
  category: string;
  title: string;
  amount: number;
  date: string;
  person: string;
}

export default function TransactionItem({ tx, editable = true }: { tx: TxDisplay; editable?: boolean }) {
  const Icon = iconMap[tx.category] ?? Receipt;
  const isIncome = tx.type === "priliv";

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-[var(--color-warm-gray)]">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isIncome ? "bg-[var(--color-teal)]/10" : "bg-[var(--color-coral)]/15"
          }`}
        >
          <Icon size={16} className={isIncome ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-dark-navy)] truncate">{tx.title}</p>
          <p className="text-xs text-[var(--color-dark-gray)] truncate">
            {formatDate(tx.date)} · {tx.person}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <span
          className={`text-sm font-bold font-[family-name:var(--font-display)] ${
            isIncome ? "text-[var(--color-teal)]" : "text-[var(--color-dark-red)]"
          }`}
        >
          {formatRSD(isIncome ? tx.amount : -tx.amount)}
        </span>
        {editable && (
          <div className="flex items-center">
            <EditTransaction
              id={tx.id}
              type={tx.type}
              initialCategory={tx.category}
              initialTitle={tx.title}
              initialAmount={tx.amount}
              initialDate={tx.date}
            />
            <DeleteTransaction id={tx.id} />
          </div>
        )}
      </div>
    </div>
  );
}
