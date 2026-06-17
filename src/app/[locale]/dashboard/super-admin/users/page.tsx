import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { SuperAdminManager } from "@/components/dashboard/super-admin-manager";

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user || session.user.role !== "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  return <SuperAdminManager locale={locale} mode="users" />;
}
