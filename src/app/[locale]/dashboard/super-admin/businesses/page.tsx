import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { SuperAdminManager } from "@/components/dashboard/super-admin-manager";

export const unstable_instant = false;

export default async function AdminBusinessesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user || session.user.role !== "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  return <SuperAdminManager locale={locale} mode="businesses" />;
}
