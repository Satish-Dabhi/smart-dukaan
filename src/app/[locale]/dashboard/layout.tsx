import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Session } from "next-auth";

export const unstable_instant = false;

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <DashboardShell locale={locale} session={session as Session}>
      {children}
    </DashboardShell>
  );
}
