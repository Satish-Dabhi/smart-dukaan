"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, Clock } from "lucide-react";

interface PlanFeatures {
  products: number;
  staff: number;
  customers: number;
  invoicesPerMonth: number;
  analyticsHistory: number;
  onlineStorefront: boolean;
  whatsappOrders: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

interface PublicPlan {
  _id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  durationDays: number | null;
  isTrial: boolean;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeatures;
}

function formatFeatureValue(value: number): string {
  return value === -1 ? "Unlimited" : value.toLocaleString("en-IN");
}

function formatAnalytics(days: number): string {
  return days === -1 ? "All-time analytics" : `${days}-day analytics history`;
}

function buildFeatureList(plan: PublicPlan): string[] {
  const f = plan.features;
  const list: string[] = [];

  if (plan.isTrial) {
    list.push(`${formatFeatureValue(f.products)} products`);
    list.push(`${plan.durationDays}-day free trial`);
  } else {
    list.push(`${formatFeatureValue(f.products)} products`);
    list.push(`${formatFeatureValue(f.staff)} staff accounts`);
    list.push(`${formatFeatureValue(f.invoicesPerMonth)} invoices/month`);
  }

  list.push(formatAnalytics(f.analyticsHistory));

  if (f.onlineStorefront) list.push("Online storefront");
  if (f.whatsappOrders) list.push("WhatsApp ordering");
  if (f.customDomain) list.push("Custom domain");
  if (f.prioritySupport) list.push("Priority support");
  if (f.apiAccess) list.push("API access");

  return list;
}

const slugGradient: Record<string, string> = {
  trial: "from-sky-400 to-cyan-400",
  starter: "from-blue-500 to-indigo-500",
  pro: "from-violet-500 to-pink-500",
  enterprise: "from-amber-500 to-orange-500",
};

export function PricingSection() {
  const locale = useLocale();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPlans(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayPlans = plans.length > 0 ? plans : [];
  const popularSlug = displayPlans.find((p) => p.slug === "pro")
    ? "pro"
    : displayPlans[Math.floor(displayPlans.length / 2)]?.slug;

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No hidden fees. Cancel anytime. Start with a free trial.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-8 max-w-6xl mx-auto ${
              displayPlans.length <= 2
                ? "md:grid-cols-2 max-w-2xl"
                : displayPlans.length === 3
                  ? "md:grid-cols-3 max-w-5xl"
                  : "md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {displayPlans.map((plan, i) => {
              const isPopular = plan.slug === popularSlug;
              const gradient = slugGradient[plan.slug] ?? "from-violet-500 to-pink-500";
              const features = buildFeatureList(plan);

              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 flex flex-col ${
                    isPopular
                      ? "border-violet-500 shadow-xl shadow-violet-500/10 scale-105"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        <Zap className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white mb-3`}
                    >
                      {plan.isTrial && <Clock className="w-3 h-3" />}
                      {plan.name}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">
                        {plan.priceMonthly === 0
                          ? "Free"
                          : `₹${plan.priceMonthly.toLocaleString("en-IN")}`}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-gray-500 text-sm">/month</span>
                      )}
                    </div>
                    {plan.priceYearly > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        ₹{plan.priceYearly.toLocaleString("en-IN")}/year — save{" "}
                        {Math.round(100 - (plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%
                      </p>
                    )}
                    {plan.isTrial && plan.durationDays && (
                      <p className="text-xs text-sky-600 font-semibold mt-1">
                        {plan.durationDays}-day free trial — no card required
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/${locale}/auth/register`}>
                    <Button
                      variant={isPopular ? "gradient" : plan.isTrial ? "outline" : "default"}
                      className="w-full"
                    >
                      {plan.isTrial ? "Start Free Trial" : `Get ${plan.name}`}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
