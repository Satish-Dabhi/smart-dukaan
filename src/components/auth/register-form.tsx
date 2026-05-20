"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff, Phone, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

export function RegisterForm() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (isOtpSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOtpSent, countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${locale}/dashboard` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error(t("passwordMinLength") || "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      toast.success("Registration initiated! Please verify your email.");
      setIsOtpSent(true);
      setCountdown(60);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ email: form.email, otp: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Email verified successfully! Logging you in...");

      // Auto-login since verification succeeded and we have credentials
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: `/${locale}/dashboard`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8"
    >
      <AnimatePresence mode="wait">
        {!isOtpSent ? (
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("register")}</h1>
              <p className="text-gray-500 text-sm mt-1">{t("registerSubtitle")}</p>
            </div>

            <Button
              variant="outline"
              className="w-full gap-3 h-11 mb-6 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={handleGoogle}
              loading={googleLoading}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("continueWithGoogle")}
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">{t("orSignUpWith")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t("fullName")}</label>
                <Input
                  placeholder={t("fullNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  startIcon={<User className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t("email")}</label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  startIcon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t("phone")}</label>
                <Input
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  startIcon={<Phone className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t("password")}</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordMinLength")}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  startIcon={<Lock className="w-4 h-4" />}
                  endIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
                {t("register")}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {t("haveAccount")}{" "}
              <Link href={`/${locale}/auth/login`} className="text-violet-600 font-semibold hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4 text-violet-600">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
              <p className="text-gray-500 text-sm mt-2">
                We've sent a 6-digit OTP code to <strong className="text-gray-800 dark:text-gray-200">{form.email}</strong>. Enter it below to verify your account.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    ref={(el) => { if (el) otpRefs.current[index] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-11 text-center text-lg font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-850 text-foreground focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all focus:scale-105"
                    required
                  />
                ))}
              </div>

              <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
                Verify & Complete Sign Up
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
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-violet-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Resend Code
                  </button>
                )}
              </p>

              <button
                onClick={() => setIsOtpSent(false)}
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
