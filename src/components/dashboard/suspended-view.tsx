"use client";

import { signOut } from "next-auth/react";
import { ShieldAlert, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuspendedViewProps {
  businessName: string;
  adminEmail: string;
  locale: string;
}

export function SuspendedView({ businessName, adminEmail, locale }: SuspendedViewProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 relative overflow-hidden p-4">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="max-w-md w-full z-10">
        <div className="backdrop-blur-xl bg-slate-950/70 border border-red-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
          {/* Animated Lock Icon */}
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-30 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/35 flex items-center justify-center text-red-500 relative">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-2">Store Suspended</h1>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Your SmartDukaan shop{" "}
            <strong className="text-red-400 font-semibold">{businessName || "Store"}</strong> has
            been suspended by the system administration. During the suspension, your storefront is
            offline and dashboard features are locked.
          </p>

          {/* Contact Details Card */}
          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-5 mb-6 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              How to Resolve
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Please contact the main administrator to discuss status reinstatement or appeal this
              suspension.
            </p>
            <a
              href={`mailto:${adminEmail}?subject=Suspension Appeal — ${encodeURIComponent(businessName)}`}
              className="flex items-center gap-2.5 text-xs text-violet-400 font-bold hover:text-violet-300 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-950/50 border border-violet-900/50 flex items-center justify-center">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{adminEmail}</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <a
              href={`mailto:${adminEmail}?subject=Suspension Appeal — ${encodeURIComponent(businessName)}`}
              className="block w-full"
            >
              <Button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 gap-2">
                <Mail className="w-4 h-4" />
                Contact Administrator
              </Button>
            </a>

            <button
              onClick={handleLogout}
              className="w-full h-11 rounded-xl border border-slate-850 hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
