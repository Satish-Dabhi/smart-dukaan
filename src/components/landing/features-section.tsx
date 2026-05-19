"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart, BarChart3, Package, FileText, MessageCircle,
  QrCode, Globe, Smartphone, Bell, Shield, Zap, Users
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "POS Billing",
    description: "Fast, intuitive point-of-sale with barcode scanning, GST calculation, and thermal printing support.",
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Online Storefront",
    description: "Beautiful, mobile-first online store for your business. Share your menu via QR or link.",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Ordering",
    description: "Let customers order directly via WhatsApp with auto-generated order messages.",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Deep insights into sales, revenue, top products, and customer behavior with beautiful charts.",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, get low-stock alerts, manage restocks, and view inventory history.",
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: FileText,
    title: "GST Invoicing",
    description: "Professional GST-compliant invoices with CGST/SGST breakdown, PDF export, and printing.",
    color: "indigo",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: QrCode,
    title: "QR Menu System",
    description: "Generate QR codes for table menus, store front, or specific products instantly.",
    color: "teal",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: Smartphone,
    title: "Mobile PWA",
    description: "Install as a native app on any device. Works offline for uninterrupted billing.",
    color: "purple",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Build loyalty with customer profiles, purchase history, and reward points.",
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Globe,
    title: "Multilingual",
    description: "Full support for English and Gujarati. Gujarati invoices, menus, and product names.",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Real-time alerts for new orders, low stock, payment confirmations, and more.",
    color: "yellow",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with RBAC, encrypted data, rate limiting, and CSRF protection.",
    color: "slate",
    gradient: "from-slate-600 to-gray-700",
  },
];

const colorMap: Record<string, string> = {
  violet: "bg-violet-100 dark:bg-violet-900/30",
  blue: "bg-blue-100 dark:bg-blue-900/30",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30",
  amber: "bg-amber-100 dark:bg-amber-900/30",
  pink: "bg-pink-100 dark:bg-pink-900/30",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30",
  teal: "bg-teal-100 dark:bg-teal-900/30",
  purple: "bg-purple-100 dark:bg-purple-900/30",
  rose: "bg-rose-100 dark:bg-rose-900/30",
  cyan: "bg-cyan-100 dark:bg-cyan-900/30",
  yellow: "bg-yellow-100 dark:bg-yellow-900/30",
  slate: "bg-slate-100 dark:bg-slate-900/30",
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Everything you need
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful features for
            <br />
            <span className="gradient-text">every type of business</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            From grocery stores to cafes, SmartDukaan has everything you need to run and grow your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-lg p-2`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
