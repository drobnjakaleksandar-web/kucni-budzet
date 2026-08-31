import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import InviteCode from "@/components/InviteCode";

export default async function PodesavanjaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: household } = membership
    ? await supabase.from("households").select("name").eq("id", membership.household_id).maybeSingle()
    : { data: null };

  const displayName = membership?.display_name || user.email;
  const initials = (displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-2 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[var(--color-coral)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-coral)]">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-dark-navy)]">{displayName}</p>
          <p className="text-xs text-[var(--color-dark-gray)]">{user.email}</p>
        </div>
      </header>

      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl border border-[var(--color-warm-gray)] p-4 mb-4">
          <p className="text-sm font-bold text-[var(--color-dark-navy)] mb-1">
            {household?.name || "Domaćinstvo"}
          </p>
          <p className="text-xs text-[var(--color-dark-gray)] mb-3">
            Pošalji ovaj kod partneru — on ga unosi pri registraciji da se pridruži istom domaćinstvu.
          </p>
          {membership && <InviteCode code={membership.household_id} />}
        </div>

        <LogoutButton />
      </section>

      <BottomNav />
    </div>
  );
}
