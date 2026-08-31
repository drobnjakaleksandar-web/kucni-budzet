"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingClient() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [householdName, setHouseholdName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createHousehold(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: household, error: hhError } = await supabase
      .from("households")
      .insert({ name: householdName || "Naše domaćinstvo" })
      .select()
      .single();

    if (hhError || !household) {
      setError("Greška pri kreiranju domaćinstva. Pokušaj ponovo.");
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase.from("household_members").insert({
      household_id: household.id,
      user_id: user.id,
      display_name: (user.user_metadata?.display_name as string) || "Ja",
    });

    setLoading(false);

    if (memberError) {
      setError("Greška pri povezivanju sa domaćinstvom.");
      return;
    }

    router.push("/pocetna");
    router.refresh();
  }

  async function joinHousehold(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase.from("household_members").insert({
      household_id: code.trim(),
      user_id: user.id,
      display_name: (user.user_metadata?.display_name as string) || "Ja",
    });

    setLoading(false);

    if (memberError) {
      setError("Nevažeći kod, ili već pripadaš tom domaćinstvu. Proveri kod i pokušaj ponovo.");
      return;
    }

    router.push("/pocetna");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10">
      {mode === "choose" && (
        <>
          <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-[var(--color-dark-navy)] text-center mb-2">
            Dobrodošao/la!
          </h1>
          <p className="text-sm text-[var(--color-dark-gray)] text-center mb-8">
            Napravi novo domaćinstvo ili se pridruži postojećem pomoću koda koji ti je poslao partner.
          </p>

          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-3 bg-white border border-[var(--color-warm-gray)] rounded-2xl p-4 mb-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
              <Home size={18} className="text-[var(--color-teal)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-dark-navy)]">Napravi novo domaćinstvo</p>
              <p className="text-xs text-[var(--color-dark-gray)]">Ti si prvi — pozovi partnera posle</p>
            </div>
          </button>

          <button
            onClick={() => setMode("join")}
            className="flex items-center gap-3 bg-white border border-[var(--color-warm-gray)] rounded-2xl p-4 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-indigo)]/10 flex items-center justify-center">
              <Users size={18} className="text-[var(--color-indigo)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-dark-navy)]">Pridruži se domaćinstvu</p>
              <p className="text-xs text-[var(--color-dark-gray)]">Imam kod od partnera</p>
            </div>
          </button>
        </>
      )}

      {mode === "create" && (
        <form className="flex flex-col gap-4" onSubmit={createHousehold}>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-dark-navy)]">
            Ime domaćinstva
          </h1>
          <input
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder="npr. Markovići"
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-teal)]"
          />
          {error && <p className="text-xs text-[var(--color-dark-red)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-dark-navy)] text-white font-semibold text-sm py-3.5 disabled:opacity-60"
          >
            {loading ? "Kreiranje..." : "Nastavi"}
          </button>
          <button type="button" onClick={() => setMode("choose")} className="text-xs text-[var(--color-dark-gray)]">
            Nazad
          </button>
        </form>
      )}

      {mode === "join" && (
        <form className="flex flex-col gap-4" onSubmit={joinHousehold}>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-dark-navy)]">
            Unesi kod domaćinstva
          </h1>
          <p className="text-xs text-[var(--color-dark-gray)] -mt-2">
            Kod dobijaš od partnera — nalazi se u Podešavanjima njegove aplikacije.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nalepi kod ovde"
            className="w-full rounded-xl border border-[var(--color-warm-gray)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-teal)]"
          />
          {error && <p className="text-xs text-[var(--color-dark-red)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-dark-navy)] text-white font-semibold text-sm py-3.5 disabled:opacity-60"
          >
            {loading ? "Povezivanje..." : "Pridruži se"}
          </button>
          <button type="button" onClick={() => setMode("choose")} className="text-xs text-[var(--color-dark-gray)]">
            Nazad
          </button>
        </form>
      )}
    </div>
  );
}
