import { Suspense } from "react";
import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import type { Session } from "next-auth";

async function DashboardHeaderServer({ locale }: { locale: string }) {
  const session = await getCachedSession();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  return <DashboardHeader session={session as Session} locale={locale} />;
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <DashboardSidebar locale={locale} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<div className="h-16 shrink-0 border-b border-border bg-card" />}>
          <DashboardHeaderServer locale={locale} />
        </Suspense>
        <main className="flex-1 overflow-auto p-4 sm:p-6 page-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
