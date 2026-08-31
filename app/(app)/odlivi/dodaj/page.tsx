import AddTransactionForm from "@/components/AddTransactionForm";
import { getCurrentHousehold } from "@/lib/get-household";

export default async function DodajOdlivPage() {
  const { householdId, displayName, user } = await getCurrentHousehold();

  return (
    <AddTransactionForm
      type="odliv"
      householdId={householdId}
      displayName={displayName}
      userId={user.id}
    />
  );
}
