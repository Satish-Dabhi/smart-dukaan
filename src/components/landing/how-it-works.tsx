"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Store, Smartphone, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up with Google in 30 seconds. No credit card required. Your business profile is ready instantly.",
    color: "violet",
  },
  {
    icon: Store,
    step: "02",
    title: "Set Up Your Store",
    description:
      "Add your products, set prices, choose your storefront theme, and customise your business profile.",
    color: "blue",
  },
  {
    icon: Smartphone,
    step: "03",
    title: "Start Billing",
    description:
      "Use the POS to bill customers, generate GST invoices, and accept UPI, cash, or card payments.",
    color: "emerald",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Grow Your Business",
    description:
      "Track analytics, monitor inventory, receive online orders, and build customer loyalty — all in one place.",
    color: "pink",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; num: string }> = {
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    num: "from-violet-500 to-purple-600",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    num: "from-blue-500 to-indigo-600",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    num: "from-emerald-500 to-teal-600",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    num: "from-pink-500 to-rose-600",
  },
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Up and running in <span className="gradient-text">5 minutes</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            No technical knowledge required. SmartDukaan is designed for non-technical business
            owners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Animated connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[26px] left-[12.5%] right-[12.5%] h-px overflow-visible pointer-events-none">
            <svg className="w-full h-6 overflow-visible" preserveAspectRatio="none">
              <motion.line
                x1="0"
                y1="3"
                x2="100%"
                y2="3"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, i) => {
            const colors = colorClasses[step.color];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="relative text-center"
              >
                {/* Icon + number badge */}
                <div className="relative inline-flex">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center mb-4 mx-auto`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <step.icon className={`w-6 h-6 ${colors.text}`} />
                  </motion.div>
                  <motion.div
                    className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${colors.num} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 500 }}
                  >
                    {i + 1}
                  </motion.div>
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
