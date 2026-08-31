"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Ako Supabase trazi potvrdu emaila, nema jos aktivne sesije
    if (!data.session) {
      setCheckEmail(true);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
        <Mail size={40} className="text-[var(--color-teal)] mb-4" />
        <h1 className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-dark-navy)] mb-2">
          Proveri svoj email
        </h1>
        <p className="text-sm text-[var(--color-dark-gray)]">
          Poslali smo ti link za potvrdu naloga na <strong>{email}</strong>. Klikni na njega, pa se vrati ovde i
          prijavi se.
        </p>
        <Link href="/login" className="mt-6 text-sm font-semibold text-[var(--color-teal)]">
          Nazad na prijavu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-dark-navy)] flex items-center justify-center mb-5">
          <Wallet size={24} className="text-white" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-[var(--color-dark-navy)]">
          Napravi nalog
        </h1>
        <p className="text-sm text-[var(--color-dark-gray)] mt-1">Prvi korak ka zajedničkom budžetu</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-[var(--color-dark-gray)] mb-1.5 block">Ime</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-medium-gray)]" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tvoje ime"
              className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white pl-10 pr-4 py-3 text-sm text-[var(--color-dark-navy)] outline-none focus:border-[var(--color-teal)]"
            />
          </div>
        </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Najmanje 6 karaktera"
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
          {loading ? "Kreiranje naloga..." : "Registruj se"}
        </button>

        <Link href="/login" className="text-center text-xs text-[var(--color-dark-gray)] underline underline-offset-2">
          Već imaš nalog? Prijavi se
        </Link>
      </form>
    </div>
  );
}
