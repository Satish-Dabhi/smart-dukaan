"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("pwa_banner_dismissed")
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay to avoid showing banner on first page interaction
    const t = setTimeout(() => setMounted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa_banner_dismissed", "1");
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setDismissed(true);
  };

  if (isInstalled || !canInstall || dismissed || !mounted) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50",
        "bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 p-4"
      )}
      style={{ animation: "slideUp 0.4s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(1rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md">
          <Image
            src="/icons/web-app-manifest-192x192.png"
            width={44}
            height={44}
            alt="SmartDukaan"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">Install SmartDukaan</p>
          <p className="text-xs text-muted-foreground mt-0.5">Fast access from your home screen</p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1 h-8 text-xs">
          Not now
        </Button>
        <Button
          size="sm"
          onClick={handleInstall}
          className="flex-1 h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0"
        >
          <Download className="w-3 h-3 mr-1.5" />
          Install
        </Button>
      </div>
    </div>
  );
}
