"use client";

import { useSubscription } from "@/lib/subscription-context";
import { Lock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { IPlanFeatures } from "@/models/Plan";
import { cn } from "@/lib/utils";

interface PlanGateProps {
  feature: keyof IPlanFeatures;
  children: React.ReactNode;
  message?: string;
  className?: string;
  /** When true, renders a full-page style locked card instead of overlaying children */
  asPage?: boolean;
}

export function PlanGate({ feature, children, message, className, asPage = false }: PlanGateProps) {
  const info = useSubscription();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const features = info?.features;
  const isExpiredOrSuspended = info?.isExpired || info?.status === "suspended";

  let hasAccess = true;
  if (features) {
    const value = features[feature];
    if (typeof value === "boolean") {
      hasAccess = value;
    } else {
      hasAccess = value === -1 || (value as number) > 0;
    }
  }

  if (isExpiredOrSuspended) {
    hasAccess = false;
  }

  if (hasAccess) return <>{children}</>;

  if (asPage) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[60vh] text-center p-8",
          className
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Feature Locked</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          {message ?? "This feature is not included in your current plan. Upgrade to unlock it."}
        </p>
        <Link
          href={`/${locale}/dashboard/billing`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all"
        >
          <Zap className="w-4 h-4" />
          View Plans
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="opacity-20 pointer-events-none select-none blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px] rounded-xl">
        <div className="text-center p-4 max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">Plan Upgrade Required</p>
          <p className="text-xs text-muted-foreground mb-3">
            {message ?? "Upgrade your plan to access this feature."}
          </p>
          <Link
            href={`/${locale}/dashboard/billing`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Upgrade Plan <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Inline disabled chip shown next to feature labels in settings/storefront */
export function FeatureLockBadge({
  feature,
  label,
}: {
  feature: keyof IPlanFeatures;
  label: string;
}) {
  const info = useSubscription();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const features = info?.features;
  let hasAccess = true;
  if (features) {
    const value = features[feature];
    hasAccess = typeof value === "boolean" ? value : value === -1 || (value as number) > 0;
  }

  if (hasAccess) return null;

  return (
    <Link
      href={`/${locale}/dashboard/billing`}
      className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
      title={`${label} requires a plan upgrade`}
    >
      <Lock className="w-2.5 h-2.5" />
      Upgrade
    </Link>
  );
}
