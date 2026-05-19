import { Metadata } from "next";
import { BusinessSettings } from "@/components/dashboard/business-settings";
import { getCachedSession } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getCachedSession();
  return <BusinessSettings userId={session?.user?.id} />;
}
