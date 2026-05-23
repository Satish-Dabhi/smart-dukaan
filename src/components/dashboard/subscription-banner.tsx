"use client";

import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubscriptionBannerProps {
  plan: string;
  status: "trial" | "expired" | "active" | "suspended";
  daysRemaining: number | null;
  locale: string;
}

export function SubscriptionBanner({ plan, status, daysRemaining, locale }: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Only show for trial (any stage) or expired
  if (status === "active" || status === "suspended" || dismissed) return null;

  const isExpired = status === "expired";
  const isUrgent = isExpired || (daysRemaining !== null && daysRemaining <= 3);
  const isWarning = !isExpired && daysRemaining !== null && daysRemaining <= 7;

  const billingUrl = `/${locale}/dashboard/billing`;

  return (
    <div
      className={cn(
        "relative py-2.5 px-4 sm:px-6 text-sm font-medium transition-all",
        isExpired
          ? "bg-red-600 text-white"
          : isUrgent
          ? "bg-amber-500 text-white"
          : isWarning
          ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800"
          : "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300 border-b border-sky-200 dark:border-sky-800"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">
            {isExpired ? (
              <>
                Your free trial has ended.{" "}
                <span className="font-bold">Upgrade to restore full access.</span>
              </>
            ) : daysRemaining !== null && daysRemaining <= 1 ? (
              <>
                <span className="font-bold">Last day of your trial!</span> Upgrade today to avoid interruption.
              </>
            ) : (
              <>
                Free trial:{" "}
                <span className="font-bold">
                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining.
                </span>{" "}
                {isWarning ? "Upgrade soon to avoid interruption." : "Explore plans anytime."}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={billingUrl}
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg transition-colors",
              isExpired || isUrgent
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 dark:bg-amber-300/10"
            )}
          >
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </Link>
          {!isExpired && (
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
