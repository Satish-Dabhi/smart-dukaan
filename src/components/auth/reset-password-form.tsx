"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";

export function ResetPasswordForm() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("New reset code sent!");
      setCountdown(60);
      setOtp(Array(6).fill(""));
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
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Password reset successfully! Please log in.");
      router.push(`/${locale}/auth/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter the 6-digit code sent to{" "}
          <strong className="text-gray-800 dark:text-gray-200">{email}</strong> and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* OTP inputs */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block text-center">
            Verification Code
          </label>
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
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-12 text-center text-lg font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-850 text-foreground focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all focus:scale-105"
                required
              />
            ))}
          </div>
          <p className="text-center mt-2 text-sm text-gray-500">
            {countdown > 0 ? (
              <span className="font-semibold text-gray-600 dark:text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-violet-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Resend Code
              </button>
            )}
          </p>
        </div>

        {/* New password */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            New Password
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            Confirm New Password
          </label>
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
          Reset Password
        </Button>
      </form>

      <div className="mt-5 text-center">
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
