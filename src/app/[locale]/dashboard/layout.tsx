import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Session } from "next-auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { SuspendedView } from "@/components/dashboard/suspended-view";

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

  // Real-time store status suspension check on server-side
  let isSuspended = false;
  let businessName = "";

  if (session.user.businessId && session.user.role !== "super_admin") {
    await connectDB();
    const business = await Business.findById(session.user.businessId).select("status name").lean();
    if (business && business.status === "suspended") {
      isSuspended = true;
      businessName = business.name;
    }
  }

  if (isSuspended) {
    const adminEmail = process.env.SMTP_USER || "admin@smartdukaan.com";
    return <SuspendedView businessName={businessName} adminEmail={adminEmail} locale={locale} />;
  }

  return (
    <DashboardShell locale={locale} session={session as Session}>
      {children}
    </DashboardShell>
  );
}
