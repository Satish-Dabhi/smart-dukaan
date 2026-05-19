"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    color: "gray",
    features: [
      "1 store",
      "Up to 50 products",
      "Basic POS billing",
      "WhatsApp ordering",
      "QR menu",
      "Basic analytics",
    ],
    cta: "Start Free",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    description: "For growing businesses",
    color: "violet",
    features: [
      "1 store",
      "Unlimited products",
      "Advanced POS + barcode",
      "GST invoicing",
      "PDF export",
      "Customer management",
      "Inventory alerts",
      "Email support",
    ],
    cta: "Get Starter",
    variant: "gradient" as const,
    popular: true,
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    description: "For established businesses",
    color: "pink",
    features: [
      "3 stores / branches",
      "Unlimited products",
      "Full POS + thermal print",
      "Advanced analytics",
      "Staff management",
      "Custom themes",
      "Priority support",
      "Bulk import/export",
      "API access",
    ],
    cta: "Get Pro",
    variant: "default" as const,
    popular: false,
  },
];

export function PricingSection() {
  const locale = useLocale();

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
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No hidden fees. Cancel anytime. Start free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? "border-violet-500 shadow-xl shadow-violet-500/10 scale-105"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={`/${locale}/auth/register`}>
                <Button variant={plan.variant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
