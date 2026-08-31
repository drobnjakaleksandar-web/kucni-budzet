import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  // Vec ima domacinstvo - ne dozvoljavamo pravljenje jos jednog
  if (membership) {
    redirect("/pocetna");
  }

  return <OnboardingClient />;
}
