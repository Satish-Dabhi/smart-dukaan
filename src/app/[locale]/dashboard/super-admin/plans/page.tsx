import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { SuperAdminPlans } from "@/components/dashboard/super-admin-plans";

export const metadata = { title: "Plan Management — SmartDukaan Admin" };

export default async function AdminPlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user || session.user.role !== "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  return <SuperAdminPlans />;
}
