import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";

export default async function SuperAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getCachedSession();

  if (!session?.user || session.user.role !== "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  // The old /super-admin route now redirects to the admin dashboard
  redirect(`/${locale}/dashboard`);
}
