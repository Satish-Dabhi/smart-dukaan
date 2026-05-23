import { Suspense } from "react";
import { CustomerAuthForm } from "@/components/auth/customer-auth-form";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in to place your order" };

export default function CustomerAuthPage() {
  return (
    <Suspense>
      <CustomerAuthForm />
    </Suspense>
  );
}
