import AddTransactionForm from "@/components/AddTransactionForm";
import { getCurrentHousehold } from "@/lib/get-household";

export default async function DodajPrilivPage() {
  const { householdId, displayName, user } = await getCurrentHousehold();

  return (
    <AddTransactionForm
      type="priliv"
      householdId={householdId}
      displayName={displayName}
      userId={user.id}
    />
  );
}
