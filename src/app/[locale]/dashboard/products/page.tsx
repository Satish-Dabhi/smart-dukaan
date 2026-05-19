import { Suspense } from "react";
import { Metadata } from "next";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Products" };

async function ProductsContent() {
  const session = await auth();
  return <ProductsManager businessId={session?.user?.businessId} />;
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
