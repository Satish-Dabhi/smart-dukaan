import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Authentication Error" };

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. It may have been used already or expired.",
  OAuthSignin: "Could not sign in with this provider.",
  OAuthCallback: "Could not complete sign in.",
  OAuthCreateAccount: "Could not create account.",
  EmailCreateAccount: "Could not create account with this email.",
  Callback: "An error occurred during authentication.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Please sign in using your original method.",
  SessionRequired: "You must be signed in to access this page.",
  Default: "An unexpected error occurred during authentication.",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = errorMessages[error ?? "Default"] ?? errorMessages.Default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Authentication Error
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">{message}</p>
      <div className="flex gap-3">
        <Link href="/auth/login">
          <Button variant="gradient">Try Again</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense>
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  );
}
