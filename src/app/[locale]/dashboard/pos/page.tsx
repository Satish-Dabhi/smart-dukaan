import { Suspense } from "react";
import { getCachedSession } from "@/lib/auth-cache";
import { Metadata } from "next";
import { POSSystem } from "@/components/pos/pos-system";

export const metadata: Metadata = { title: "POS Billing" };

async function POSContent() {
  const session = await getCachedSession();
  return <POSSystem businessId={session?.user?.businessId} />;
}

export default function POSPage() {
  return (
    <Suspense>
      <POSContent />
    </Suspense>
  );
}
