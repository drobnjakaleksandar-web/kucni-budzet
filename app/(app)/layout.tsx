import { getCurrentHousehold } from "@/lib/get-household";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ovo ce iskoristiti React.cache - ako stranica ispod takodje pozove
  // getCurrentHousehold, koristi se isti rezultat bez novog mrežnog poziva
  await getCurrentHousehold();

  return <>{children}</>;
}
