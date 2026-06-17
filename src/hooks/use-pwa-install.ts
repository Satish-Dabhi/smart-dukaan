"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __pwa_prompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  });
  const [canInstall, setCanInstall] = useState(
    () => typeof window !== "undefined" && !isInstalled && !!window.__pwa_prompt
  );

  useEffect(() => {
    if (isInstalled) return;

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      window.__pwa_prompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleInstalled = () => {
      window.__pwa_prompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [isInstalled]);

  const install = useCallback(async () => {
    const p = window.__pwa_prompt;
    if (!p) return false;
    await p.prompt();
    const { outcome } = await p.userChoice;
    if (outcome === "accepted") {
      window.__pwa_prompt = null;
      setCanInstall(false);
    }
    return outcome === "accepted";
  }, []);

  return { canInstall, isInstalled, install };
}
