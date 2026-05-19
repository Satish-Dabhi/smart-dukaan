"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, TrendingUp, ShoppingCart, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function HeroSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-800">
              <Zap className="w-3.5 h-3.5" />
              <span>New: AI-powered analytics now live!</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Run Your Business{" "}
            <span className="relative">
              <span className="gradient-text">Smarter</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 9C70.3333 3.66667 143 1 215 1C244.333 1 273 3.66667 299 9"
                  stroke="url(#grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("heroSubtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={`/${locale}/auth/register`}>
              <Button variant="gradient" size="xl" className="group shadow-2xl">
                {t("getStartedFree")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="group gap-3 border-gray-300">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <Play className="w-3 h-3 text-violet-600 ml-0.5" />
              </div>
              {t("watchDemo")}
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["🛒", "☕", "🍕", "💊", "✂️"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 border-2 border-white flex items-center justify-center text-xs"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                10,000+ businesses
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="font-medium text-gray-700 dark:text-gray-300">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">₹50Cr+ processed</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-pink-600/20 blur-2xl rounded-3xl" />

            {/* Mock dashboard UI */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                  app.smartdukaan.com/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex h-80 sm:h-96">
                {/* Sidebar */}
                <div className="hidden sm:flex w-52 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 flex-col p-4 gap-1">
                  {["Dashboard", "Products", "POS Billing", "Orders", "Analytics"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          i === 0
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 space-y-4 overflow-hidden">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Revenue", value: "₹1.2L", color: "violet", icon: "💰" },
                      { label: "Orders", value: "348", color: "blue", icon: "📦" },
                      { label: "Products", value: "124", color: "emerald", icon: "🏷️" },
                      { label: "Customers", value: "89", color: "pink", icon: "👥" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="text-lg">{stat.icon}</div>
                        <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600 to-violet-400 opacity-80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-4 sm:-left-8 top-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 hidden sm:flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">New Order</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">₹840</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
            className="absolute -right-4 sm:-right-8 top-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 hidden sm:flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Revenue up</div>
              <div className="text-sm font-semibold text-emerald-600">+34%</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
