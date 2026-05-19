import { Suspense } from "react";
import { Metadata } from "next";
import { CategoriesManager } from "@/components/dashboard/categories-manager";
import { getCachedSession as auth } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "Categories" };

async function CategoriesContent() {
  const session = await auth();
  return <CategoriesManager businessId={session?.user?.businessId} />;
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesContent />
    </Suspense>
  );
}
