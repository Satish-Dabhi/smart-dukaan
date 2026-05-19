import { Metadata } from "next";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const session = await auth();
  const businessId = session?.user?.businessId;

  return <ProductsManager businessId={businessId} />;
}
