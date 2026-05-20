"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";

export function VerifyEmailForm() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Verification code resent successfully!");
      setCountdown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      toast.success("Email verified successfully! You can now log in.");
      router.push(`/${locale}/auth/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
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
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
        <p className="text-gray-500 text-sm mt-2">
          We have sent a 6-digit OTP to <strong className="text-gray-800 dark:text-gray-200">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-xs mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => { if (el) inputRefs.current[index] = el; }}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-12 text-center text-lg font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-850 text-foreground focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all focus:scale-105"
              required
            />
          ))}
        </div>

        <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
          Verify Account
        </Button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          {countdown > 0 ? (
            <span className="font-semibold text-gray-600 dark:text-gray-400">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-violet-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Resend Code
            </button>
          )}
        </p>

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
