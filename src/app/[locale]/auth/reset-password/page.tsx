import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
