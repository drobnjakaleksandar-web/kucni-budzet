import { Transaction, SavingsGoal, Debt, MonthSummary } from "./types";

export const currentMonth = "Avgust 2026";

export const transactions: Transaction[] = [
  { id: "t1", type: "priliv", category: "Plata", title: "Plata — Ana", amount: 185000, date: "2026-08-15", person: "Ana" },
  { id: "t2", type: "priliv", category: "Honorar", title: "Freelance — Marko", amount: 65000, date: "2026-08-15", person: "Marko" },
  { id: "t3", type: "priliv", category: "Vanredno", title: "Povraćaj poreza", amount: 35000, date: "2026-08-10", person: "Ana" },
  { id: "t4", type: "odliv", category: "Namirnice", title: "Namirnice — Maxi", amount: 12500, date: "2026-08-14", person: "Ana" },
  { id: "t5", type: "odliv", category: "Transport", title: "Gorivo — NIS Petrol", amount: 6200, date: "2026-08-12", person: "Marko" },
  { id: "t6", type: "odliv", category: "Fiksni", title: "Komunalije (Infostan)", amount: 14800, date: "2026-08-10", person: "Ana" },
  { id: "t7", type: "odliv", category: "Zabava", title: "Restoran — Ručak", amount: 4500, date: "2026-08-08", person: "Marko" },
];

export const savingsGoals: SavingsGoal[] = [
  { id: "s1", name: "More 2026", icon: "beach", target: 120000, current: 45000, status: "active" },
  { id: "s2", name: "Rezerva za vanredne situacije", icon: "reserve", target: 50000, current: 12000, status: "active" },
  { id: "s3", name: "Rata za kredit", icon: "custom", target: 30000, current: 30000, status: "completed" },
];

export const debts: Debt[] = [
  { id: "d1", name: "Banka - keš kredit", direction: "duguju", totalAmount: 300000, paidAmount: 150000, nextDueDate: "2026-09-15", linkedToExpenses: true },
  { id: "d2", name: "Markov otac - za auto", direction: "duguju", totalAmount: 100000, paidAmount: 60000, nextDueDate: "2026-09-12" },
  { id: "d3", name: "Petar - pozajmica za skijanje", direction: "duguju_nam", totalAmount: 20000, paidAmount: 8000, nextDueDate: "2026-10-01" },
  { id: "d4", name: "Sara - udeo za rođendan", direction: "duguju_nam", totalAmount: 5000, paidAmount: 2000, nextDueDate: "2026-09-15" },
];

export const monthHistory: MonthSummary[] = [
  { month: "Mart", income: 260000, expenses: 190000 },
  { month: "Apr", income: 255000, expenses: 210000 },
  { month: "Maj", income: 270000, expenses: 185000 },
  { month: "Jun", income: 280000, expenses: 175000 },
  { month: "Jul", income: 270000, expenses: 195000 },
  { month: "Avg", income: 285000, expenses: 178500 },
];

export function formatRSD(amount: number): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${Math.abs(amount).toLocaleString("sr-RS")} RSD`;
}
