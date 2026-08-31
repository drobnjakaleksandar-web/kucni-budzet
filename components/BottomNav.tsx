"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, TrendingDown, PiggyBank, HandCoins, PieChart } from "lucide-react";

const items = [
  { href: "/pocetna", label: "Početna", icon: Home, color: "text-[var(--color-dark-navy)]" },
  { href: "/prilivi", label: "Prilivi", icon: TrendingUp, color: "text-[var(--color-teal)]" },
  { href: "/odlivi", label: "Odlivi", icon: TrendingDown, color: "text-[var(--color-coral)]" },
  { href: "/stednja", label: "Štednja", icon: PiggyBank, color: "text-[#D4836A]" },
  { href: "/dugovi", label: "Dugovi", icon: HandCoins, color: "text-[var(--color-indigo)]" },
  { href: "/statistika", label: "Statistika", icon: PieChart, color: "text-[var(--color-dark-navy)]" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] bg-white border-t border-[var(--color-warm-gray)] px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 z-40">
      <ul className="flex items-stretch justify-between">
        {items.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-1 relative"
              >
                {active && (
                  <span className="absolute -top-2 h-0.5 w-5 rounded-full bg-[var(--color-teal)]" />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={active ? color : "text-[var(--color-medium-gray)]"}
                />
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-[var(--color-dark-navy)]" : "text-[var(--color-medium-gray)]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
