import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function requireBusinessAuth() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // Super admins don't have a businessId — send them to their admin dashboard
  if (session.user.role === "super_admin") {
    redirect(`/${locale}/dashboard`);
  }

  const businessId = session.user.businessId;
  if (!businessId) {
    redirect(`/${locale}/auth/login`);
  }

  return { businessId, session: session! };
}
