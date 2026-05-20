import { auth } from "@/auth";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function requireBusinessAuth() {
  const [session, locale] = await Promise.all([auth(), getLocale()]);
  const businessId = session?.user?.businessId;
  if (!businessId) {
    redirect(`/${locale}/auth/login`);
  }
  return { businessId, session: session! };
}
