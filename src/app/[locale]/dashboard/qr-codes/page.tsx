import { Suspense } from "react";
import { Metadata } from "next";
import { QRCodesManager } from "@/components/dashboard/qr-codes-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "QR Codes" };

async function QRCodesContent() {
  const session = await auth();
  return <QRCodesManager businessId={session?.user?.businessId} />;
}

export default function QRCodesPage() {
  return (
    <Suspense>
      <QRCodesContent />
    </Suspense>
  );
}
