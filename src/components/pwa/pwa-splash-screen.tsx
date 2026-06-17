"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PWASplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    return isStandalone && !sessionStorage.getItem("pwa_splash");
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem("pwa_splash", "1");
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => setVisible(false), 2350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none",
        "bg-gradient-to-br from-violet-600 via-violet-500 to-pink-600",
        "transition-opacity duration-500",
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-black/30 ring-4 ring-white/20">
          <Image
            src="/icons/web-app-manifest-192x192.png"
            width={96}
            height={96}
            alt="SmartDukaan"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-white font-black text-3xl tracking-tight">SmartDukaan</h1>
          <p className="text-white/70 text-sm mt-1.5 font-medium tracking-wide">
            Your Business, Smarter
          </p>
        </div>
      </div>

      <div className="absolute bottom-16">
        <div className="w-6 h-6 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
