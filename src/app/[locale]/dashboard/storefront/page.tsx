import { Suspense } from "react";
import { getCachedSession as auth } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { StorefrontManager } from "@/components/dashboard/storefront-manager";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Storefront" };

async function StorefrontContent({ locale }: { locale: string }) {
  const session = await auth();
  const businessId = session?.user?.businessId;

  if (!businessId) {
    redirect(`/${locale}/dashboard/settings`);
  }

  await connectDB();
  const business = await Business.findById(businessId).lean();

  if (!business) {
    redirect(`/${locale}/dashboard/settings`);
  }

  // Safely serialize database model for client rendering
  const serializedBusiness = JSON.parse(JSON.stringify(business));

  return <StorefrontManager business={serializedBusiness} locale={locale} />;
}

export default async function StorefrontPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense>
      <StorefrontContent locale={locale} />
    </Suspense>
  );
}
