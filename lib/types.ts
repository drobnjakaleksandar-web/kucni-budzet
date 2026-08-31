export type Person = "Ana" | "Marko";

export type TransactionType = "priliv" | "odliv";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  date: string; // ISO date
  person: Person;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: "beach" | "reserve" | "custom";
  target: number;
  current: number;
  status: "active" | "completed";
}

export interface Debt {
  id: string;
  name: string;
  direction: "duguju" | "duguju_nam"; // we owe / owed to us
  totalAmount: number;
  paidAmount: number;
  nextDueDate?: string;
  linkedToExpenses?: boolean;
}

export interface MonthSummary {
  month: string; // "Jul 2026"
  income: number;
  expenses: number;
}
