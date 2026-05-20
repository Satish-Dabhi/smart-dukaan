import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Verify Email" };

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
