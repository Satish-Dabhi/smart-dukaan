import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Session } from "next-auth";
import { SuspendedView } from "@/components/dashboard/suspended-view";
import { getSubscriptionInfo } from "@/lib/subscription";
import { getBusinessForDashboard } from "@/lib/get-business-for-dashboard";

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

  // Redirect customer role users directly to their orders screen
  if (session.user.role === "customer") {
    redirect(`/${locale}/account/orders`);
  }

  // Fetch business status + subscription info server-side
  let isSuspended = false;
  let businessName = "";
  let subscriptionInfo: ReturnType<typeof getSubscriptionInfo> | null = null;

  if (session.user.businessId && session.user.role !== "super_admin") {
    const business = await getBusinessForDashboard(session.user.businessId);

    if (business) {
      if (business.status === "suspended") {
        isSuspended = true;
        businessName = business.name;
      } else {
        subscriptionInfo = getSubscriptionInfo(business);
      }
    }
  }

  if (isSuspended) {
    const adminEmail = process.env.SMTP_USER || "admin@smartdukaan.com";
    return <SuspendedView businessName={businessName} adminEmail={adminEmail} locale={locale} />;
  }

  return (
    <DashboardShell
      locale={locale}
      session={session as Session}
      subscriptionInfo={subscriptionInfo}
    >
      {children}
    </DashboardShell>
  );
}
