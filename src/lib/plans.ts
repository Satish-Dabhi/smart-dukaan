import type { IPlanFeatures } from "@/models/Plan";

export type PlanId = string;

export type PlanFeatures = IPlanFeatures;

export interface Plan {
  id: string;
  slug: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  durationDays: number | null;
  description: string;
  isTrial: boolean;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeatures;
}

// Default plan definitions — used to seed the DB on first run.
// The DB is the source of truth; these are only the initial values.
export const DEFAULT_PLANS: Omit<Plan, "id">[] = [
  {
    slug: "trial",
    name: "Free Trial",
    priceMonthly: 0,
    priceYearly: 0,
    durationDays: 30,
    description: "Full access for 30 days — no credit card required",
    isTrial: true,
    isActive: true,
    sortOrder: 0,
    features: {
      products: 50,
      staff: 2,
      customers: 100,
      invoicesPerMonth: 100,
      analyticsHistory: 30,
      onlineStorefront: true,
      whatsappOrders: true,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    slug: "starter",
    name: "Starter",
    priceMonthly: 499,
    priceYearly: 4999,
    durationDays: null,
    description: "Perfect for small shops getting started",
    isTrial: false,
    isActive: true,
    sortOrder: 1,
    features: {
      products: 200,
      staff: 3,
      customers: 1000,
      invoicesPerMonth: 500,
      analyticsHistory: 90,
      onlineStorefront: true,
      whatsappOrders: true,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    slug: "pro",
    name: "Pro",
    priceMonthly: 999,
    priceYearly: 9999,
    durationDays: null,
    description: "For growing businesses that need more power",
    isTrial: false,
    isActive: true,
    sortOrder: 2,
    features: {
      products: 2000,
      staff: 10,
      customers: -1,
      invoicesPerMonth: -1,
      analyticsHistory: 365,
      onlineStorefront: true,
      whatsappOrders: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: false,
    },
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    priceMonthly: 2499,
    priceYearly: 24999,
    durationDays: null,
    description: "Unlimited everything with dedicated support",
    isTrial: false,
    isActive: true,
    sortOrder: 3,
    features: {
      products: -1,
      staff: -1,
      customers: -1,
      invoicesPerMonth: -1,
      analyticsHistory: -1,
      onlineStorefront: true,
      whatsappOrders: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
];

export function formatLimit(value: number): string {
  return value === -1 ? "Unlimited" : String(value);
}

export function formatAnalytics(days: number): string {
  return days === -1 ? "All time" : `${days} days`;
}
