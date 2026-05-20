import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { SuperAdminManager } from "@/components/dashboard/super-admin-manager";

export const unstable_instant = false;

export default async function SuperAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user || session.user.role !== "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Super Admin Console
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of the system users, business entities, and active subscriptions.
        </p>
      </div>

      <SuperAdminManager locale={locale} />
    </div>
  );
}
