import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// React.cache memoizuje ovaj poziv unutar JEDNOG zahteva - i layout i stranica
// ga mogu pozvati bez dupliranja mrezih poziva ka Supabase-u (brzina!)
export const getCurrentHousehold = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, display_name")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  return { supabase, user, householdId: membership.household_id, displayName: membership.display_name };
});
