"use client";

import { motion } from "framer-motion";
import { UserPlus, Store, Smartphone, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up with Google in 30 seconds. No credit card required.",
    color: "violet",
  },
  {
    icon: Store,
    step: "02",
    title: "Set Up Your Store",
    description: "Add your products, set prices, and customize your storefront theme.",
    color: "blue",
  },
  {
    icon: Smartphone,
    step: "03",
    title: "Start Billing",
    description: "Use the POS system to bill customers. Accept UPI, cash, and cards.",
    color: "emerald",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Grow Your Business",
    description: "Track analytics, manage inventory, and receive online orders.",
    color: "pink",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800" },
};

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Up and running in{" "}
            <span className="gradient-text">5 minutes</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            No technical knowledge required. SmartDukaan is designed for non-technical business owners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 via-emerald-200 to-pink-200 dark:from-violet-900/50 dark:to-pink-900/50" />

          {steps.map((step, i) => {
            const colors = colorClasses[step.color];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-flex">
                  <div
                    className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center mb-4 mx-auto`}
                  >
                    <step.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
