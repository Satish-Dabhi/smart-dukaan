"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff, Phone, ShoppingBag, LogIn } from "lucide-react";

type Tab = "register" | "login";

export function CustomerAuthForm() {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//") ? rawCallback : "/";

  const [tab, setTab] = useState<Tab>("register");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Account already exists. Please sign in instead.");
          setLoginForm((p) => ({ ...p, email: registerForm.email }));
          setTab("login");
          return;
        }
        throw new Error(json.error || "Registration failed");
      }

      toast.success("Account created! Signing you in...");
      const result = await signIn("credentials", {
        email: registerForm.email,
        password: registerForm.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Sign-in after registration failed");

      window.location.href = callbackUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8"
    >
      {/* Context banner */}
      <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 rounded-xl px-4 py-3 mb-6">
        <ShoppingBag className="w-5 h-5 text-violet-600 shrink-0" />
        <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
          Create an account or sign in to complete your order
        </p>
      </div>

      {/* Google OAuth */}
      <Button
        variant="outline"
        className="w-full gap-3 h-11 mb-6 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={handleGoogleSignIn}
        loading={googleLoading}
        type="button"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            tab === "register"
              ? "bg-white dark:bg-gray-900 text-violet-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <User className="w-4 h-4" />
          Create Account
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            tab === "login"
              ? "bg-white dark:bg-gray-900 text-violet-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "register" ? (
          <motion.form
            key="register"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your full name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                required
                startIcon={<User className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                required
                startIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
                startIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                required
                startIcon={<Lock className="w-4 h-4" />}
                endIcon={
                  <button type="button" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
              Create Account & Continue
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                required
                startIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                required
                startIcon={<Lock className="w-4 h-4" />}
                endIcon={
                  <button type="button" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button type="submit" className="w-full h-11" loading={loading} variant="gradient">
              Sign In & Continue
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
