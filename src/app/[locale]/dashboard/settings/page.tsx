import { Suspense } from "react";
import { Metadata } from "next";
import { BusinessSettings } from "@/components/dashboard/business-settings";
import { getCachedSession } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Settings" };

async function SettingsContent() {
  const session = await getCachedSession();
  return <BusinessSettings userId={session?.user?.id} />;
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
