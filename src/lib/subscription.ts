import type { PlanId } from "./plans";
import { PLANS } from "./plans";

export type SubscriptionStatus = "active" | "trial" | "expired" | "suspended";

export interface SubscriptionInfo {
  plan: PlanId;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpired: boolean;
  features: (typeof PLANS)[PlanId]["features"];
}

interface BusinessForSubscription {
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date | null;
  status?: string;
}

export function getSubscriptionInfo(business: BusinessForSubscription): SubscriptionInfo {
  const plan = (business.subscriptionPlan as PlanId) ?? "trial";
  const planConfig = PLANS[plan] ?? PLANS.trial;
  const expiresAt = business.subscriptionExpiresAt ?? null;
  const now = new Date();

  const isSuspended = business.status === "suspended";
  const isExpired = expiresAt != null && expiresAt < now;

  let status: SubscriptionStatus;
  if (isSuspended) {
    status = "suspended";
  } else if (isExpired) {
    status = "expired";
  } else if (plan === "trial") {
    status = "trial";
  } else {
    status = "active";
  }

  let daysRemaining: number | null = null;
  if (expiresAt && !isExpired) {
    daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    plan,
    status,
    expiresAt,
    daysRemaining,
    isExpired,
    features: planConfig.features,
  };
}

export function trialExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}
