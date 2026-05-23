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
