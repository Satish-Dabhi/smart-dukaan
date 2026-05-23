export type PlanId = "trial" | "starter" | "pro" | "enterprise";

export interface PlanFeatures {
  products: number;       // max products (-1 = unlimited)
  staff: number;          // max staff accounts (-1 = unlimited)
  customers: number;      // max customers tracked (-1 = unlimited)
  invoicesPerMonth: number; // -1 = unlimited
  analyticsHistory: number; // days of analytics history
  onlineStorefront: boolean;
  whatsappOrders: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;   // INR per month (0 = trial)
  priceYearly: number;    // INR per year (0 = trial)
  durationDays: number | null; // null = no expiry
  features: PlanFeatures;
  description: string;
}

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: "trial",
    name: "Free Trial",
    priceMonthly: 0,
    priceYearly: 0,
    durationDays: 30,
    description: "Full access for 30 days — no credit card required",
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
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 499,
    priceYearly: 4999,
    durationDays: null,
    description: "Perfect for small shops getting started",
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
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 999,
    priceYearly: 9999,
    durationDays: null,
    description: "For growing businesses that need more power",
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
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 2499,
    priceYearly: 24999,
    durationDays: null,
    description: "Unlimited everything with dedicated support",
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
};

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}
