import { Metadata } from "next";
import { CategoriesManager } from "@/components/dashboard/categories-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const session = await auth();
  const businessId = session?.user?.businessId;

  return <CategoriesManager businessId={businessId} />;
}
