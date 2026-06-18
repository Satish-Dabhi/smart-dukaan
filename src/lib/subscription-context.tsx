"use client";

import { createContext, useContext } from "react";
import type { IPlanFeatures } from "@/models/Plan";
import type { SubscriptionInfo } from "@/lib/subscription";

type SubscriptionContextValue = SubscriptionInfo | null;

export const SubscriptionContext = createContext<SubscriptionContextValue>(null);

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}

export function useFeature(feature: keyof IPlanFeatures): boolean {
  const info = useContext(SubscriptionContext);
  if (!info?.features) return false;
  const value = info.features[feature];
  if (typeof value === "boolean") return value;
  return value === -1 || (value as number) > 0;
}
