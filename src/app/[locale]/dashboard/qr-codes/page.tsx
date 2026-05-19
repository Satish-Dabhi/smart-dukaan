import { Metadata } from "next";
import { QRCodesManager } from "@/components/dashboard/qr-codes-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "QR Codes" };

export default async function QRCodesPage() {
  const session = await auth();
  const businessId = session?.user?.businessId;
  return <QRCodesManager businessId={businessId} />;
}
