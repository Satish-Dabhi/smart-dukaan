"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  TrendingUp,
  ShoppingCart,
  Zap,
  LayoutDashboard,
  Receipt,
  Package,
  Tag,
  ShoppingBag,
  FileText,
  Users,
  Warehouse,
  BarChart3,
  QrCode,
  Bell,
  Moon,
  Globe,
  IndianRupee,
  ChevronDown,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

import type { Variants, Transition } from "framer-motion";

/* ─── Animation variants ───────────────────────────────────────── */
const cubicEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: cubicEase } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const floatTransition: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };
const floatTransitionDelayed: Transition = {
  duration: 4,
  delay: 2,
  repeat: Infinity,
  ease: "easeInOut",
};

/* ─── Mock data ─────────────────────────────────────────────────── */
const sidebarSections = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", active: true },
      { icon: Receipt, label: "POS Billing", active: false },
    ],
  },
  {
    label: "CATALOG",
    items: [
      { icon: Package, label: "Products", active: false },
      { icon: Tag, label: "Categories", active: false },
    ],
  },
  {
    label: "SALES",
    items: [
      { icon: ShoppingCart, label: "Orders", active: false },
      { icon: FileText, label: "Invoices", active: false },
      { icon: Users, label: "Customers", active: false },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { icon: Warehouse, label: "Inventory", active: false },
      { icon: BarChart3, label: "Analytics", active: false },
      { icon: QrCode, label: "QR Codes", active: false },
    ],
  },
];

const statCards = [
  {
    label: "Total Revenue",
    value: "₹1.2L",
    sub: "This month",
    change: "+18%",
    iconBg: "bg-violet-600",
    Icon: IndianRupee,
  },
  {
    label: "Total Orders",
    value: "348",
    sub: "This month",
    change: "+12%",
    iconBg: "bg-blue-500",
    Icon: ShoppingCart,
  },
  {
    label: "Total Products",
    value: "124",
    sub: "Active",
    change: null,
    iconBg: "bg-emerald-500",
    Icon: Package,
  },
  {
    label: "Customers",
    value: "89",
    sub: "Total",
    change: null,
    iconBg: "bg-pink-500",
    Icon: Users,
  },
];

const revenueLine =
  "M0,78 L7,72 L14,68 L21,74 L28,58 L35,52 L42,60 L49,44 L56,50 L63,36 L70,42 L77,30 L84,38 L91,24 L100,18";

const pieSegments = [
  { color: "#ec4899", pct: 30, start: 0 },
  { color: "#8b5cf6", pct: 25, start: 108 },
  { color: "#3b82f6", pct: 20, start: 198 },
  { color: "#14b8a6", pct: 15, start: 270 },
  { color: "#f59e0b", pct: 10, start: 324 },
];

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

function pieArc(startDeg: number, pct: number) {
  const endDeg = startDeg + pct * 3.6;
  const start = polarToXY(startDeg, 38);
  const end = polarToXY(endDeg, 38);
  const large = pct * 3.6 > 180 ? 1 : 0;
  return `M50,50 L${start.x},${start.y} A38,38 0 ${large} 1 ${end.x},${end.y} Z`;
}

/* ─── Trust badges ───────────────────────────────────────────────── */
const trustBadges = [
  {
    icon: Zap,
    label: "GST-compliant from day one",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Smartphone,
    label: "Works offline, syncs automatically",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    label: "Free to start — no credit card",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

/* ─── Component ──────────────────────────────────────────────────── */
export function HeroSection() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
  const parallaxY = useSpring(rawY, { stiffness: 80, damping: 20 });
  const parallaxScale = useSpring(rawScale, { stiffness: 80, damping: 20 });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950" />

      {/* Animated gradient orbs — pure CSS for zero-JS perf */}
      <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-3xl animate-orb pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-pink-400/15 rounded-full blur-3xl animate-orb-reverse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center">
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-800">
              <Zap className="w-3.5 h-3.5" />
              <span>GST-compliant billing for Indian businesses</span>
            </div>
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Run Your Business{" "}
            <span className="relative inline-block">
              <span className="gradient-text">Smarter</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              >
                <motion.path
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
              </motion.svg>
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
            <a href="#features">
              <Button variant="outline" size="xl" className="group gap-3 border-gray-300">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                  <Play className="w-3 h-3 text-violet-600 ml-0.5" />
                </div>
                See features
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm"
          >
            {trustBadges.map((badge) => (
              <motion.div
                key={badge.label}
                className="flex items-center gap-2.5"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${badge.bg} flex items-center justify-center shrink-0`}
                >
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard Preview with parallax */}
        <motion.div
          style={{ y: parallaxY, scale: parallaxScale }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-pink-600/20 blur-2xl rounded-3xl" />

            {/* Mock dashboard */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              {/* Browser chrome */}
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                  app.smartdukaan.com/dashboard
                </div>
              </div>

              {/* App header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    SmartDukaan
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
                    <Globe className="w-3 h-3" /> EN
                  </button>
                  <Moon className="w-3.5 h-3.5 text-gray-400" />
                  <div className="relative">
                    <Bell className="w-3.5 h-3.5 text-gray-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-none">
                        Store Owner
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* App body */}
              <div className="flex" style={{ height: "420px" }}>
                {/* Sidebar */}
                <div className="hidden sm:flex w-44 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col py-3 overflow-hidden shrink-0">
                  {sidebarSections.map((section) => (
                    <div key={section.label} className="mb-1">
                      <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {section.label}
                      </div>
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className={`mx-2 px-2 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium ${
                            item.active
                              ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <item.icon
                            className={`w-3.5 h-3.5 shrink-0 ${item.active ? "text-violet-600 dark:text-violet-400" : ""}`}
                          />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 space-y-3 overflow-hidden bg-gray-50 dark:bg-gray-950">
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {statCards.map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.07 }}
                        className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}
                          >
                            <card.Icon className="w-4 h-4 text-white" />
                          </div>
                          {card.change && (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" />
                              {card.change}
                            </span>
                          )}
                        </div>
                        <div className="text-base font-black text-gray-900 dark:text-white">
                          {card.value}
                        </div>
                        <div className="text-[10px] font-medium text-gray-500 mt-0.5">
                          {card.label}
                        </div>
                        <div className="text-[9px] text-gray-400">{card.sub}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                    style={{ height: "200px" }}
                  >
                    {/* Revenue Trend */}
                    <div className="sm:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex flex-col">
                      <div>
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          Revenue Trend
                        </div>
                        <div className="text-[10px] text-violet-600">Daily revenue this month</div>
                      </div>
                      <div className="flex-1 mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-gray-400 pr-1">
                          <span>₹1k</span>
                          <span>₹750</span>
                          <span>₹500</span>
                          <span>₹250</span>
                          <span>₹0</span>
                        </div>
                        <div className="ml-6 h-full">
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="w-full h-full"
                          >
                            {[25, 50, 75].map((y) => (
                              <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2="100"
                                y2={y}
                                stroke="#f3f4f6"
                                strokeWidth="0.5"
                              />
                            ))}
                            <path
                              d={`${revenueLine} L100,100 L0,100 Z`}
                              fill="url(#areaGrad)"
                              opacity="0.2"
                            />
                            <motion.path
                              d={revenueLine}
                              fill="none"
                              stroke="#7c3aed"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                            />
                            <circle
                              cx="63"
                              cy="36"
                              r="3"
                              fill="#7c3aed"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Pie chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex flex-col hidden sm:flex">
                      <div>
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          Top Products
                        </div>
                        <div className="text-[10px] text-gray-400">Revenue share</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-28 h-28">
                          {pieSegments.map((seg, i) => (
                            <motion.path
                              key={seg.color}
                              d={pieArc(seg.start, seg.pct)}
                              fill={seg.color}
                              stroke="white"
                              strokeWidth="1.5"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 300 }}
                              style={{ transformOrigin: "50px 50px" }}
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={floatTransition}
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
            animate={{ y: [0, -10, 0] }}
            transition={floatTransitionDelayed}
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
