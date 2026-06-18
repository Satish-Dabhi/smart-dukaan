import type { IPlanFeatures } from "@/models/Plan";
import { DEFAULT_PLANS } from "./plans";

export type SubscriptionStatus = "active" | "trial" | "expired" | "suspended";

export interface SubscriptionInfo {
  plan: string;
  planName: string;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpired: boolean;
  features: IPlanFeatures;
}

interface BusinessForSubscription {
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date | null;
  status?: string;
}

const FALLBACK_FEATURES: IPlanFeatures = DEFAULT_PLANS[0].features;

function getFallbackFeatures(slug: string): IPlanFeatures {
  return DEFAULT_PLANS.find((p) => p.slug === slug)?.features ?? FALLBACK_FEATURES;
}

export function getSubscriptionInfo(
  business: BusinessForSubscription,
  planFeatures?: IPlanFeatures,
  planName?: string
): SubscriptionInfo {
  const plan = business.subscriptionPlan ?? "trial";
  const features = planFeatures ?? getFallbackFeatures(plan);
  const resolvedPlanName = planName ?? DEFAULT_PLANS.find((p) => p.slug === plan)?.name ?? plan;
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
    planName: resolvedPlanName,
    status,
    expiresAt,
    daysRemaining,
    isExpired,
    features,
  };
}

export function trialExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}
