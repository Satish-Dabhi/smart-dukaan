import { getCachedSession as auth } from "@/lib/auth-cache";
import { Metadata } from "next";
import { POSSystem } from "@/components/pos/pos-system";

export const metadata: Metadata = { title: "POS Billing" };

export default async function POSPage() {
  const session = await auth();
  const businessId = session?.user?.businessId;

  return <POSSystem businessId={businessId} />;
}
