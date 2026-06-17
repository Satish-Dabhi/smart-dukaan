"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallButton() {
  const { canInstall, isInstalled, install } = usePWAInstall();

  if (isInstalled || !canInstall) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={install}
      className="rounded-lg shrink-0"
      title="Install SmartDukaan App"
      aria-label="Install SmartDukaan App"
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}
