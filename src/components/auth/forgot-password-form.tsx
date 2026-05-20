"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

export function ForgotPasswordForm() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(true);
      toast.success("Reset code sent! Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 max-w-md w-full mx-auto"
    >
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4 text-violet-600">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
        <p className="text-gray-500 text-sm mt-2">
          {sent
            ? "If that email is registered, a 6-digit reset code has been sent."
            : "Enter your email and we'll send you a reset code."}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              startIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <Button type="submit" className="w-full h-11 mt-2" loading={loading} variant="gradient">
            Send Reset Code
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check <strong className="text-gray-900 dark:text-white">{email}</strong> for your code, then click below to set a new password.
          </p>
          <Link
            href={`/${locale}/auth/reset-password?email=${encodeURIComponent(email)}`}
            className="block"
          >
            <Button className="w-full h-11" variant="gradient">
              Enter Reset Code
            </Button>
          </Link>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-sm text-violet-600 hover:underline"
          >
            Try a different email
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/auth/login`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
