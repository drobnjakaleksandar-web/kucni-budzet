"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Mail, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("Pogrešan email ili lozinka. Proveri podatke i pokušaj ponovo.");
      return;
    }

    router.push("/pocetna");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-dark-navy)] flex items-center justify-center mb-5">
          <Wallet size={24} className="text-white" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-[var(--color-dark-navy)]">
          Kućni Budžet
        </h1>
        <p className="text-sm text-[var(--color-dark-gray)] mt-1">Zajedničke finansije pod kontrolom</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">
            Email adresa
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-medium-gray)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tvoj@email.com"
              className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white pl-10 pr-4 py-3 text-sm text-[var(--color-dark-navy)] outline-none focus:border-[var(--color-teal)]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">
            Lozinka
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-medium-gray)]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesi lozinku"
              className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white pl-10 pr-4 py-3 text-sm text-[var(--color-dark-navy)] outline-none focus:border-[var(--color-teal)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-[var(--color-dark-red)] bg-[var(--color-dark-red)]/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-[var(--color-dark-navy)] text-white font-semibold text-sm py-3.5 active:opacity-90 disabled:opacity-60"
        >
          {loading ? "Prijavljivanje..." : "Prijavi se"}
        </button>

        <Link
          href="/signup"
          className="text-center text-xs text-[var(--color-dark-gray)] underline underline-offset-2"
        >
          Nemaš nalog? Registruj se
        </Link>
      </form>
    </div>
  );
}
